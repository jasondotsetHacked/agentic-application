import db from '../data/db.js';

export const listTables_definition = {
    type: "function",
    name: 'listTables',
    description: 'Lists all the table names in the database.',
    parameters: {
        type: 'object',
        properties: {},
    },
};

export function listTables() {
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").all();
    return { success: true, tables: tables.map(table => table.name) };
  } catch (error) {
    console.error('Error listing tables:', error);
    return { success: false, message: 'Error listing tables.', error: error.message };
  }
}
