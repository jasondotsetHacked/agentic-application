import db from '../db.js';

export const lookupProduct_definition = {
    type: "function",
    name: "lookupProduct",
    description: "Looks up a product in the database by its ID.",
    parameters: {
        type: "object",
        properties: {
            id: { type: "number", description: "The ID of the product to look up." },
        },
        required: ["id"],
    },
};

export const lookupProduct = ({ id }) => {
    try {
        const stmt = db.prepare(`
            SELECT * FROM products WHERE id = ?
        `);
        const result = stmt.get(id);
        if (result) {
            return { success: true, message: "Product found.", result };
        } else {
            return { success: false, message: "Product not found." };
        }
    } catch (error) {
        console.error("Error looking up product:", error);
        return { success: false, message: "Error looking up product.", error: error.message };
    }
};