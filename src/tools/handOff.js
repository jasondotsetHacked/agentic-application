import { agentMap } from "../agents/index.js";

export const handOff_definition = {
    type: "function",
    name: "handOff",
    description: "Switches to the target agent.",
    parameters: {
        type: "object",
        required: ["targetAgent"],
        properties: {
            targetAgent: {
                description: "The agent to switch to.",
                type: "string",
                oneOf: [
                    { const: "generalAssistantAgent", description: "The general-purpose assistant agent." },
                    { const: "databaseAgent", description: "The specialized database agent." }
                ]
            },
        }
    }
};

export const handOff = (targetAgent) => {
    if (!agentMap[targetAgent]) {
        return { success: false, message: `Unknown target agent: ${targetAgent}` };
    }
    const agent = agentMap[targetAgent];
    console.log(`Switching to ${agent.name}.`);
    return { success: true, message: `Switched to ${agent.name}.`, agent };
};