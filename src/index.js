import { config } from 'dotenv';
config({ path: '../secrets/.env.secrets' });

import { select, input } from '@inquirer/prompts';

import Database from 'better-sqlite3';
const db = new Database('./data/database.db');

// Initialize the database with a products table
const initDatabase = () => {
    const createProductsTableQuery = `
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL
        );
    `;

    db.exec(createProductsTableQuery);
    console.log("Database initialized with 'products' table.");
};

initDatabase();

import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

import generalAssistantAgent from "./agents/generalAssistantAgent.js";
import databaseAgent from "./agents/databaseAgent.js";

import { handOff } from './tools/handOff.js';
import { addProduct } from './tools/addProduct.js';
import { lookupProduct } from './tools/lookupProduct.js';
import { editProduct } from './tools/editProduct.js';

let selectedAgent = generalAssistantAgent;

let previous_response_id = null;

while (true) {
    let userPrompt = await input({
        message: "Enter your prompt (or type 'exit' to quit):",
    });

    if (userPrompt.toLowerCase() === 'exit') {
        console.log("Exiting chat loop. Goodbye!");
        break;
    }

    userPrompt = [{
        role: "user",
        content: userPrompt
    }];

    const response = await openai.responses.create({
        instructions: selectedAgent.instructions,
        tools: selectedAgent.tools,
        tool_choice: "auto",
        model: "gpt-4o-mini",
        input: userPrompt,
        previous_response_id: previous_response_id,
    });
    previous_response_id = response.id;

    // Modify the loop to only call response2 if tools are called
    let toolsCalled = false;

    for (const toolCall of response.output) {
        if (toolCall.type !== "function_call") {
            continue;
        }

        toolsCalled = true; // Mark that tools were called

        const name = toolCall.name;
        const args = JSON.parse(toolCall.arguments);

        let toolResult;
        switch (name) {
            case "handOff": {
                const handOffResult = handOff(args.targetAgent);
                if (handOffResult.success) {
                    switch (args.targetAgent) {
                        case 'generalAssistantAgent':
                            selectedAgent = generalAssistantAgent;
                            break;
                        case 'databaseAgent':
                            selectedAgent = databaseAgent;
                            break;
                        default:
                            toolResult = `Unknown agent: ${args.targetAgent}`;
                            break;
                    }
                    if (selectedAgent) {
                        toolResult = `Agent switched to ${args.targetAgent}`;
                    }
                } else {
                    toolResult = `Failed to switch agent: ${handOffResult.message}`;
                }
                break;
            }
            case "addProduct":
                toolResult = await addProduct(args);
                break;
            case "lookupProduct":
                toolResult = await lookupProduct(args);
                break;
            case "editProduct":
                toolResult = await editProduct(args);
                break;
            default:
                toolResult = `Unknown tool: ${name}`;
                break;
        }

        if (toolResult === undefined || toolResult === null) {
            toolResult = "No result returned from the tool.";
        } else if (typeof toolResult !== "string") {
            toolResult = JSON.stringify(toolResult);
        }

        userPrompt.push({
            type: "function_call_output",
            call_id: toolCall.call_id,
            output: toolResult,
        });
    }

    if (toolsCalled) {
        // console.log("Tools were called, sending updated input back to the model.");
        const response2 = await openai.responses.create({
            instructions: selectedAgent.instructions,
            tools: selectedAgent.tools,
            tool_choice: "none",
            model: "gpt-4o-mini",
            input: userPrompt,
            previous_response_id: previous_response_id,
        });

        previous_response_id = response2.id;

        console.log(`${selectedAgent.name}: ${response2.output_text}`);
    } else {
        // console.log("No tools were called, skipping second response.");
        console.log(`${selectedAgent.name}: ${response.output_text}`); // Log the AI's text response
    }
}
