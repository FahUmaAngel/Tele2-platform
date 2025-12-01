import { db } from '@/db/dexie';

const entityToTable = {
    FiberOrder: 'fiberOrders',
    NetworkDesign: 'networkDesigns',
    NaasPreDesign: 'naasPreDesigns',
    SiteSurvey: 'siteSurveys',
    Supplier: 'suppliers',
    Subcontractor: 'subcontractors'
};

const createEntityClient = (entityName) => {
    const tableName = entityToTable[entityName];
    
    return {
        list: async (arg) => {
            let collection = db[tableName].toCollection();
            let sort = null;
            let filters = {};

            if (typeof arg === 'string') {
                sort = arg;
            } else if (typeof arg === 'object' && arg !== null) {
                filters = arg;
            }

            // Apply Filters
            if (Object.keys(filters).length > 0) {
                collection = db[tableName].filter(item => {
                    return Object.entries(filters).every(([key, value]) => {
                        // Simple equality check, case-insensitive for strings
                        if (typeof item[key] === 'string' && typeof value === 'string') {
                            return item[key].toLowerCase() === value.toLowerCase();
                        }
                        return item[key] == value;
                    });
                });
            }

            let data = await collection.toArray();

            // Apply Sorting (Dexie sorting is limited in complex queries, so doing in-memory for now to match mock behavior)
            if (sort && sort.startsWith('-')) {
                const field = sort.substring(1);
                data.sort((a, b) => {
                    if (a[field] < b[field]) return 1;
                    if (a[field] > b[field]) return -1;
                    return 0;
                });
            } else if (sort) {
                const field = sort;
                 data.sort((a, b) => {
                    if (a[field] < b[field]) return -1;
                    if (a[field] > b[field]) return 1;
                    return 0;
                });
            }

            return data;
        },

        create: async (data) => {
            const newItem = {
                ...data,
                created_date: new Date().toISOString(),
                updated_date: new Date().toISOString()
            };
            if (!newItem.id) {
                newItem.id = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            await db[tableName].add(newItem);
            return newItem; 
        },

        update: async (id, data) => {
            const updated = await db[tableName].update(id, {
                ...data,
                updated_date: new Date().toISOString()
            });
            if (!updated) throw new Error(`${entityName} with ID ${id} not found`);
            return await db[tableName].get(id);
        },

        get: async (id) => {
            return await db[tableName].get(id);
        }
    };
};

export const dexieClient = {
    entities: {
        FiberOrder: createEntityClient('FiberOrder'),
        NetworkDesign: createEntityClient('NetworkDesign'),
        NaasPreDesign: createEntityClient('NaasPreDesign'),
        SiteSurvey: createEntityClient('SiteSurvey'),
        Supplier: createEntityClient('Supplier'),
        Subcontractor: createEntityClient('Subcontractor')
    }
};
