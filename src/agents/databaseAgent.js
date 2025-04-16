import { addProduct_definition } from "../tools/addProduct.js";
import { lookupProduct_definition } from "../tools/lookupProduct.js";
import { editProduct_definition } from "../tools/editProduct.js";
import { filterProductsByPrice_definition } from "../tools/filterProductsByPrice.js";
import { getTotalProducts_definition } from "../tools/getTotalProducts.js";

const databaseAgent = {
    name: "Database Agent",
    instructions: "You specialize in managing a products database. You can add new products, look up existing ones, and edit their details. Use tools to perform these actions.",
    tools: [addProduct_definition, lookupProduct_definition, editProduct_definition, filterProductsByPrice_definition, getTotalProducts_definition],
};

export default databaseAgent;