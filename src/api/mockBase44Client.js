import { parseCsv } from '@/utils/csvParser';

// Import raw CSV content
import fiberOrderCsv from '@/data/FiberOrder.csv?raw';
import networkDesignCsv from '@/data/NetworkDesign.csv?raw';
import naasPreDesignCsv from '@/data/NaasPreDesign.csv?raw';
import siteSurveyCsv from '@/data/SiteSurvey.csv?raw';
import supplierCsv from '@/data/Supplier.csv?raw';
import subcontractorCsv from '@/data/Subcontractor.csv?raw';

// Helper to try parsing JSON
const tryParseJson = (value) => {
    if (typeof value !== 'string') return value;
    try {
        const parsed = JSON.parse(value);
        return parsed;
    } catch (e) {
        return value;
    }
};

// Helper to process specific fields for an entity
const processEntityData = (data, jsonFields = []) => {
    return data.map(item => {
        const newItem = { ...item };
        jsonFields.forEach(field => {
            if (newItem[field]) {
                newItem[field] = tryParseJson(newItem[field]);
            }
        });
        return newItem;
    });
};

// In-memory store to simulate database
const store = {
    FiberOrder: processEntityData(parseCsv(fiberOrderCsv), []).map(item => ({
        ...item,
        lat: item.lat ? parseFloat(item.lat) : null,
        lng: item.lng ? parseFloat(item.lng) : null,
        priority: item.priority ? parseInt(item.priority, 10) : 3
    })),
    NetworkDesign: processEntityData(parseCsv(networkDesignCsv), [
        'hardware_specs',
        'pricing',
        'customer_contact',
        'ai_insights',
        'approval_history'
    ]),
    NaasPreDesign: parseCsv(naasPreDesignCsv),
    SiteSurvey: parseCsv(siteSurveyCsv),
    Supplier: parseCsv(supplierCsv),
    Subcontractor: parseCsv(subcontractorCsv)
};

// Helper to simulate async delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const createEntityClient = (entityName) => ({
    list: async (arg) => {
        await delay();
        let data = [...(store[entityName] || [])];

        // Handle arguments: arg can be a sort string or a filter object
        let sort = null;
        let filters = {};

        if (typeof arg === 'string') {
            sort = arg;
        } else if (typeof arg === 'object' && arg !== null) {
            filters = arg;
        }

        // Apply Filters
        if (Object.keys(filters).length > 0) {
            data = data.filter(item => {
                return Object.entries(filters).every(([key, value]) => {
                    // Simple equality check, case-insensitive for strings
                    if (typeof item[key] === 'string' && typeof value === 'string') {
                        return item[key].toLowerCase() === value.toLowerCase();
                    }
                    return item[key] == value;
                });
            });
        }

        // Apply Sorting
        if (sort && sort.startsWith('-')) {
            const field = sort.substring(1);
            data.sort((a, b) => {
                if (a[field] < b[field]) return 1;
                if (a[field] > b[field]) return -1;
                return 0;
            });
        }

        return data;
    },

    create: async (data) => {
        await delay();
        const newItem = {
            ...data,
            id: `mock-${Date.now()}`,
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        };
        store[entityName] = [newItem, ...(store[entityName] || [])];
        return newItem;
    },

    update: async (id, data) => {
        await delay();
        const index = store[entityName].findIndex(item => item.id === id);
        if (index === -1) throw new Error(`${entityName} with ID ${id} not found`);

        const updatedItem = {
            ...store[entityName][index],
            ...data,
            updated_date: new Date().toISOString()
        };

        store[entityName][index] = updatedItem;
        return updatedItem;
    },

    get: async (id) => {
        await delay();
        return store[entityName].find(item => item.id === id);
    }
});

export const mockBase44Client = {
    entities: {
        FiberOrder: createEntityClient('FiberOrder'),
        NetworkDesign: createEntityClient('NetworkDesign'),
        NaasPreDesign: createEntityClient('NaasPreDesign'),
        SiteSurvey: createEntityClient('SiteSurvey'),
        Supplier: createEntityClient('Supplier'),
        Subcontractor: createEntityClient('Subcontractor')
    }
};
