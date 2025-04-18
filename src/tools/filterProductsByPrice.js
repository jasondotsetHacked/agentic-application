import db from '../data/db.js';

export const filterProductsByPrice_definition = {
    type: "function",
    name: "filterProductsByPrice",
    description: "Filters products based on price levels.",
    parameters: {
        type: "object",
        properties: {
            operator: {
                type: "string",
                description: "The comparison operator to use (e.g., '<', '>', '<=', '>=').",
                enum: ["<", ">", "<=", ">="]
            },
            price: {
                type: "number",
                description: "The price to compare against."
            }
        },
        required: ["operator", "price"]
    }
};

export const filterProductsByPrice = ({ operator, price }) => {
    try {
        const stmt = db.prepare(`
            SELECT * FROM products WHERE price ${operator} ?
        `);
        const results = stmt.all(price);
        if (results.length > 0) {
            return { success: true, message: "Products found.", results };
        } else {
            return { success: false, message: "No products found matching the criteria." };
        }
    } catch (error) {
        console.error("Error filtering products:", error);
        return { success: false, message: "Error filtering products.", error: error.message };
    }
};