import { handOff_definition } from '../tools/handOff.js';

const generalAssistantAgent = {
    name: "General Assistant Agent",
    instructions: "You are a general assistant and can answer general questions, but your main purpose is to hand off the conversation to other agents when requested. You have access to a handoff tool to switch to another agent when needed; the only other available agent right now is the Database Agent.",
    tools: [handOff_definition],
};

export default generalAssistantAgent;