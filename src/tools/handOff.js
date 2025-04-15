import databaseAgent from "../agents/databaseAgent.js";
import generalAssistantAgent from "../agents/generalAssistantAgent.js";

export const handOff_definition = {
    "type": "function",
    "name": "handOff",
    "description": "Switches to the target agent.",
    "parameters": {
        "type": "object",
        "required": ["targetAgent"],
        "properties": {
            "targetAgent": {
                "description": "The agent to switch to.",
                "type": "string",
                "oneOf": [
                    { "const": "generalAssistantAgent", "description": "The general-purpose assistant agent." },
                    { "const": "databaseAgent", "description": "The specialized database agent." }
                ]
            },
        }
    }
};

export const handOff = (targetAgent) => {
    try {
        let agent;
        switch (targetAgent) {
            case "generalAssistantAgent":
                agent = generalAssistantAgent;
                break;
            case "databaseAgent":
                agent = databaseAgent;
                break;
            default:
                throw new Error(`Unknown target agent: ${targetAgent}`);
        }

        console.log(`Switching to ${agent.name}.`);
        return { success: true, message: `Switched to ${agent.name}.`, agent };
    } catch (error) {
        console.error("Error during handoff:", error);
        return { success: false, message: "Error during handoff.", error: error.message };
    }
};