import { parseCsv } from '@/utils/csvParser';

// Import raw CSV content
import fiberOrderCsv from '@/data/FiberOrder.csv?raw';
import networkDesignCsv from '@/data/NetworkDesign.csv?raw';
import naasPreDesignCsv from '@/data/NaasPreDesign.csv?raw';
import siteSurveyCsv from '@/data/SiteSurvey.csv?raw';
import supplierCsv from '@/data/Supplier.csv?raw';
import subcontractorCsv from '@/data/Subcontractor.csv?raw';
import workOrderCsv from '@/data/WorkOrder.csv?raw';
import naasInstallationDataCsv from '@/data/NaasInstallationData.csv?raw';
import rfsReportCsv from '@/data/RfsReport.csv?raw';

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

// In-memory store to simulate database, with localStorage persistence
const loadStore = () => {
    const saved = localStorage.getItem('tele2_mock_db_v5');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        FiberOrder: processEntityData(parseCsv(fiberOrderCsv), []).map(item => ({
            ...item,
            lat: item.lat ? parseFloat(item.lat) : null,
            lng: item.lng ? parseFloat(item.lng) : null,
            priority: item.priority ? parseInt(item.priority, 10) : 3,
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
        Subcontractor: parseCsv(subcontractorCsv),
        WorkOrder: parseCsv(workOrderCsv),
        NaasInstallationData: parseCsv(naasInstallationDataCsv),
        RfsReport: parseCsv(rfsReportCsv)
    };
};

const store = loadStore();

const saveStore = () => {
    localStorage.setItem('tele2_mock_db_v5', JSON.stringify(store));
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
        saveStore();
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
        saveStore();
        return updatedItem;
    },

    get: async (id) => {
        await delay();
        return store[entityName].find(item => item.id === id);
    },

    delete: async (id) => {
        await delay();
        const index = store[entityName].findIndex(item => item.id === id);
        if (index === -1) throw new Error(`${entityName} with ID ${id} not found`);

        const deletedItem = store[entityName][index];
        store[entityName].splice(index, 1);
        saveStore();
        return { success: true, deleted: deletedItem };
    }
});

export const mockBase44Client = {
    entities: {
        FiberOrder: createEntityClient('FiberOrder'),
        NetworkDesign: createEntityClient('NetworkDesign'),
        NaasPreDesign: createEntityClient('NaasPreDesign'),
        SiteSurvey: createEntityClient('SiteSurvey'),
        Supplier: createEntityClient('Supplier'),
        Subcontractor: createEntityClient('Subcontractor'),
        WorkOrder: createEntityClient('WorkOrder'),
        NaasInstallationData: createEntityClient('NaasInstallationData'),
        RfsReport: createEntityClient('RfsReport')
    },
    integrations: {
        Core: {
            InvokeLLM: async ({ prompt }) => {
                await delay(800);
                const p = prompt.toLowerCase();

                // 1. Search for specific IDs (SITE-SE-XX, ORD-XXXX-XX)
                const siteMatch = prompt.match(/SITE-SE-\d+/i);
                const orderMatch = prompt.match(/ORD-\d+-\d+/i);

                if (siteMatch) {
                    const id = siteMatch[0].toUpperCase();
                    // Search across all relevant collections
                    const survey = store.SiteSurvey?.find(s => s.facility_id === id);
                    const order = store.FiberOrder?.find(o => o.facility_id === id);
                    const design = store.NetworkDesign?.find(d => d.facility_id === id);
                    const install = store.NaasPreDesign?.find(i => i.facility_id === id); // Assuming NaasPreDesign links to facility

                    if (!survey && !order && !design) return `I couldn't find any records for ${id}.`;

                    let response = `**Data for ${id}:**\n`;
                    if (order) response += `- **Order:** ${order.order_id} (${order.status})\n`;
                    if (survey) response += `- **Survey:** ${survey.feasibility} (Surveyor: ${survey.surveyor})\n`;
                    if (design) response += `- **Design:** ${design.status} (Cost: ${design.estimated_cost})\n`;

                    return response;
                }

                if (orderMatch) {
                    const id = orderMatch[0].toUpperCase();
                    const order = store.FiberOrder?.find(o => o.order_id === id);
                    if (order) return `**Order ${id}:**\n- Status: ${order.status}\n- Site: ${order.facility_id}\n- Address: ${order.address}`;
                    return `I couldn't find order ${id}.`;
                }

                // 2. General Status Queries
                if (p.includes('how many') || p.includes('count')) {
                    if (p.includes('orders')) return `There are ${store.FiberOrder?.length || 0} fiber orders in the system.`;
                    if (p.includes('surveys')) return `There are ${store.SiteSurvey?.length || 0} site surveys recorded.`;
                    if (p.includes('sites')) return `We are tracking ${store.SiteSurvey?.length || 0} unique sites.`;
                }

                // 3. Navigation Help
                if (p.includes('go to') || p.includes('navigate')) {
                    if (p.includes('survey')) return "You can navigate to the Site Survey page using the sidebar menu.";
                    if (p.includes('order')) return "The Fiber Ordering page contains all order details.";
                }

                // Default response
                return `[Tele2 Assistant] I have access to live data. You can ask me about specific sites (e.g., SITE-SE-01) or orders (e.g., ORD-2025-01).`;
            }
        }
    }
};
