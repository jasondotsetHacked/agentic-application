import db from '../data/db.js';

export const describeTable_definition = {
    type: "function",
    name: 'describeTable',
    description: 'Describes the columns and data types of a specific table.',
    parameters: {
        type: 'object',
        properties: {
            tableName: {
                type: 'string',
                description: 'The name of the table to describe.',
            },
        },
        required: ['tableName'],
    },
};

export function describeTable({ tableName }) {
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(${tableName});`).all();
    if (tableInfo.length === 0) {
      return { success: false, message: `Table '${tableName}' not found.` };
    }
    return { 
        success: true, 
        columns: tableInfo.map(col => ({ 
            name: col.name, 
            type: col.type, 
            notnull: col.notnull === 1,
            default_value: col.dflt_value, 
            primary_key: col.pk === 1
        })) 
    };
  } catch (error) {
    console.error(`Error describing table ${tableName}:`, error);
    return { success: false, message: `Error describing table ${tableName}.`, error: error.message };
  }
}
