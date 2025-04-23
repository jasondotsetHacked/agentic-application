import { config } from 'dotenv';
config({ path: '../secrets/.env.secrets' });

import { input } from '@inquirer/prompts';
import db from './data/db.js'; // centralized DB instance

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
if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY in environment variables.");
    process.exit(1);
}
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Import agents and agent mapping
import { agentMap } from "./agents/index.js";
let selectedAgent = agentMap.generalAssistantAgent;

// Import tools
import { handOff } from './tools/handOff.js';
import { addProduct } from './tools/addProduct.js';
import { lookupProduct } from './tools/lookupProduct.js';
import { editProduct } from './tools/editProduct.js';
import { filterProductsByPrice } from './tools/filterProductsByPrice.js';
import { getTotalProducts } from './tools/getTotalProducts.js';
import { listTables } from './tools/listTables.js';
import { describeTable } from './tools/describeTable.js';

let previous_response_id = null;

// Tool handler lookup for modularity
const toolHandlers = {
    handOff: async (args) => {
        const handOffResult = handOff(args.targetAgent);
        if (handOffResult.success) {
            selectedAgent = handOffResult.agent;
            return `Agent switched to ${args.targetAgent}`;
        } else {
            return `Failed to switch agent: ${handOffResult.message}`;
        }
    },
    addProduct: async (args) => await addProduct(args),
    lookupProduct: async (args) => await lookupProduct(args),
    editProduct: async (args) => await editProduct(args),
    filterProductsByPrice: async (args) => await filterProductsByPrice(args),
    getTotalProducts: async () => await getTotalProducts(),
    listTables: async () => await listTables(),
    describeTable: async (args) => await describeTable(args),
};

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

    let toolsCalled = false;

    for (const toolCall of response.output) {
        if (toolCall.type !== "function_call") continue;

        toolsCalled = true;
        const name = toolCall.name;
        const args = JSON.parse(toolCall.arguments);

        let toolResult;
        if (toolHandlers[name]) {
            toolResult = await toolHandlers[name](args);
        } else {
            toolResult = `Unknown tool: ${name}`;
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
        console.log(`${selectedAgent.name}: ${response.output_text}`);
    }
}
