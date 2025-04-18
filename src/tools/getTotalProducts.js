import db from '../data/db.js';

export const getTotalProducts_definition = {
    type: "function",
    name: "getTotalProducts",
    description: "Fetches the total number of products in the database.",
    parameters: {
        type: "object",
        properties: {},
        required: []
    }
};

export const getTotalProducts = () => {
    try {
        const stmt = db.prepare(`SELECT COUNT(*) as total FROM products`);
        const result = stmt.get();
        return { success: true, message: "Total products fetched successfully.", total: result.total };
    } catch (error) {
        console.error("Error fetching total products:", error);
        return { success: false, message: "Error fetching total products.", error: error.message };
    }
};