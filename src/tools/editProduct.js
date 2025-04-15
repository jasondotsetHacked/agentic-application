import db from '../db.js';

export const editProduct_definition = {
    type: "function",
    name: "editProduct",
    description: "Edits an existing product in the database. You need to provide the product ID and the new details.",
    parameters: {
        type: "object",
        properties: {
            id: { type: "number", description: "The ID of the product to edit." },
            name: { type: "string", description: "The new name of the product." },
            description: { type: "string", description: "The new description of the product." },
            price: { type: "number", description: "The new price of the product." },
            stock: { type: "number", description: "The new stock quantity of the product." },
        },
        required: ["id", "name", "description", "price", "stock"],
    },
};

export const editProduct = ({ id, name, description, price, stock }) => {
    try {
        const stmt = db.prepare(`
            UPDATE products
            SET name = ?, description = ?, price = ?, stock = ?
            WHERE id = ?
        `);
        const result = stmt.run(name, description, price, stock, id);
        if (result.changes > 0) {
            return { success: true, message: "Product updated successfully.", result };
        } else {
            return { success: false, message: "No product found with the given ID." };
        }
    } catch (error) {
        console.error("Error editing product:", error);
        return { success: false, message: "Error editing product.", error: error.message };
    }
};