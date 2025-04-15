import db from '../db.js';

export const addProduct_definition = {
    type: "function",
    name: "addProduct",
    description: "Adds a new product to the database. You need to provide the product details.",
    parameters: {
        type: "object",
        properties: {
            name: { type: "string", description: "The name of the product." },
            description: { type: "string", description: "A description of the product." },
            price: { type: "number", description: "The price of the product." },
            stock: { type: "number", description: "The stock quantity of the product." },
        },
        required: ["name", "price", "stock"],
    },
};

export const addProduct = ({ name, description, price, stock }) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO products (name, description, price, stock)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(name, description, price, stock);
        return { success: true, message: "Product added successfully.", result };
    } catch (error) {
        console.error("Error adding product:", error);
        return { success: false, message: "Error adding product.", error: error.message };
    }
};