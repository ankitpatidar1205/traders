/**
 * AI Schema Loader — Auto-discovers MySQL database schema
 *
 * Fetches tables, columns, types, keys and relationships dynamically.
 * Caches in memory with configurable TTL.
 * Used by aiQueryGenerator to build valid SQL from natural language.
 */

const db = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA CACHE
// ─────────────────────────────────────────────────────────────────────────────

let schemaCache = null;
let schemaCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─────────────────────────────────────────────────────────────────────────────
// LOAD FULL SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loads complete database schema: tables → columns → types → keys
 * Returns structure like:
 * {
 *   users: {
 *     columns: [
 *       { name: 'id', type: 'int', key: 'PRI', nullable: false, default: null, extra: 'auto_increment' },
 *       { name: 'username', type: 'varchar(100)', key: 'UNI', nullable: false, ... },
 *       ...
 *     ],
 *     columnNames: ['id', 'username', 'password', ...],
 *     primaryKey: 'id',
 *     enums: { role: ['SUPERADMIN','ADMIN','BROKER','TRADER'], status: ['Active','Inactive','Suspended'] }
 *   },
 *   ...
 * }
 */
const loadSchema = async (forceRefresh = false) => {
    if (!forceRefresh && schemaCache && (Date.now() - schemaCacheTime < CACHE_TTL)) {
        return schemaCache;
    }

    console.log('[aiSchemaLoader] Loading database schema...');

    const schema = {};

    // 1. Get all tables
    const [tables] = await db.execute('SHOW TABLES');
    const dbName = (await db.execute('SELECT DATABASE() as db'))[0][0].db;
    const tableKey = `Tables_in_${dbName}`;

    for (const row of tables) {
        const tableName = row[tableKey] || Object.values(row)[0];

        // 2. Describe each table
        const [columns] = await db.execute(`DESCRIBE \`${tableName}\``);

        const colList = [];
        const colNames = [];
        const enums = {};
        let primaryKey = null;

        for (const col of columns) {
            const colInfo = {
                name: col.Field,
                type: col.Type,
                key: col.Key,           // PRI, UNI, MUL, or ''
                nullable: col.Null === 'YES',
                default: col.Default,
                extra: col.Extra,       // auto_increment, etc.
            };

            colList.push(colInfo);
            colNames.push(col.Field);

            if (col.Key === 'PRI') primaryKey = col.Field;

            // Extract ENUM values
            const enumMatch = col.Type.match(/^enum\((.+)\)$/i);
            if (enumMatch) {
                enums[col.Field] = enumMatch[1]
                    .split(',')
                    .map(v => v.replace(/'/g, '').trim());
            }
        }

        schema[tableName] = {
            columns: colList,
            columnNames: colNames,
            primaryKey,
            enums,
        };
    }

    schemaCache = schema;
    schemaCacheTime = Date.now();

    console.log(`[aiSchemaLoader] Loaded ${Object.keys(schema).length} tables`);
    return schema;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Get column names for a table */
const getColumns = async (tableName) => {
    const schema = await loadSchema();
    return schema[tableName]?.columnNames || [];
};

/** Get enum values for a column */
const getEnumValues = async (tableName, column) => {
    const schema = await loadSchema();
    return schema[tableName]?.enums?.[column] || [];
};

/** Check if a table exists */
const tableExists = async (tableName) => {
    const schema = await loadSchema();
    return !!schema[tableName];
};

/** Get table info */
const getTableInfo = async (tableName) => {
    const schema = await loadSchema();
    return schema[tableName] || null;
};

/** Get compact schema summary (for AI prompts) */
const getSchemaSummary = async () => {
    const schema = await loadSchema();
    const summary = {};
    for (const [table, info] of Object.entries(schema)) {
        summary[table] = info.columnNames;
    }
    return summary;
};

/** Get detailed schema for a specific table (for AI prompts) */
const getTableSchemaSummary = async (tableName) => {
    const schema = await loadSchema();
    const info = schema[tableName];
    if (!info) return null;

    return {
        table: tableName,
        columns: info.columns.map(c => ({
            name: c.name,
            type: c.type,
            key: c.key || undefined,
            nullable: c.nullable,
        })),
        enums: Object.keys(info.enums).length ? info.enums : undefined,
        primaryKey: info.primaryKey,
    };
};

/** Invalidate cache */
const invalidateCache = () => {
    schemaCache = null;
    schemaCacheTime = 0;
};

module.exports = {
    loadSchema,
    getColumns,
    getEnumValues,
    tableExists,
    getTableInfo,
    getSchemaSummary,
    getTableSchemaSummary,
    invalidateCache,
};
