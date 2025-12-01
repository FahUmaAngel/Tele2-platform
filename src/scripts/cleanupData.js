import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

// --- Helper Functions ---

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const row = [];
        let inQuotes = false;
        let currentValue = '';
        const line = lines[i];

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        row.push(currentValue);

        // Map to object
        const obj = {};
        headers.forEach((h, index) => {
            let val = row[index] ? row[index].trim() : '';
            // Remove surrounding quotes if present
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1);
            }
            obj[h] = val;
        });
        data.push(obj);
    }
    return { headers, data };
}

function stringifyCSV(headers, data) {
    const headerLine = headers.join(',');
    const rows = data.map(obj => {
        return headers.map(h => {
            let val = obj[h] || '';
            // Escape quotes and wrap in quotes if contains comma or quote
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(',');
    });
    return [headerLine, ...rows].join('\n');
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

// --- Data Generators ---

const CLIENTS = ['Tele2 Enterprise', 'Ericsson', 'Volvo Group', 'H&M', 'Spotify', 'Klarna', 'Scania', 'Vattenfall', 'SEB', 'Swedbank', 'Ikea', 'Northvolt', 'Polestar', 'Electrolux', 'Atlas Copco'];
const CITIES = ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'];
const STREETS = ['Storgatan', 'Kungsgatan', 'Drottninggatan', 'Hamngatan', 'Vasagatan', 'Sveavägen', 'Odengatan', 'Hornsgatan', 'Götgatan', 'Ringvägen'];
const SUBCONTRACTORS = ['Svea Fiber AB', 'NordGräv Teknik', 'Connecta Sverige', 'FiberPro Nordic'];
const MANAGERS = ['Anders Svensson', 'Maria Larsson', 'Erik Johansson', 'Anna Karlsson', 'Johan Nilsson'];
const TEAMS = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];

// --- Main Cleanup Logic ---

function cleanup() {
    console.log('🧹 Starting Data Cleanup...');

    // 1. Process FiberOrder.csv (Source of Truth)
    const orderPath = path.join(DATA_DIR, 'FiberOrder.csv');
    const orderContent = fs.readFileSync(orderPath, 'utf-8');
    const { headers: orderHeaders, data: orders } = parseCSV(orderContent);

    console.log(`Processing ${orders.length} orders...`);

    const validOrders = [];
    const facilityIds = new Set();

    orders.forEach((order, index) => {
        // Fix Facility ID
        let fid = order.facility_id;
        if (!fid || !fid.startsWith('SITE-SE-')) {
            const suffix = (index + 1).toString().padStart(3, '0');
            fid = `SITE-SE-${suffix}`;
        }
        order.facility_id = fid;

        // Fix Order ID (Match Suffix)
        const suffix = fid.split('-')[2];
        order.order_id = `ORD-2025-${suffix}`;

        // Ensure Uniqueness
        if (facilityIds.has(fid)) {
            console.warn(`Duplicate FacilityID found: ${fid}. Skipping.`);
            return;
        }
        facilityIds.add(fid);

        // Fill Missing Data
        if (!order.client) order.client = getRandomItem(CLIENTS);
        if (!order.municipality) order.municipality = getRandomItem(CITIES);
        if (!order.address) order.address = `${getRandomItem(STREETS)} ${Math.floor(Math.random() * 100) + 1}`;
        if (!order.subcontractor) order.subcontractor = getRandomItem(SUBCONTRACTORS);
        if (!order.project_manager) order.project_manager = getRandomItem(MANAGERS);
        if (!order.technician_team) order.technician_team = getRandomItem(TEAMS);
        if (!order.status) order.status = 'Planned';
        if (!order.priority) order.priority = Math.floor(Math.random() * 3) + 1; // 1-3
        if (!order.service_type) order.service_type = 'fiber';
        if (!order.created_date) order.created_date = new Date().toISOString();

        // Randomize status for all orders as requested
        order.status = getRandomItem(['Planned', 'Confirming', 'Delivered', 'In Transit', 'pending', 'Completed', 'Delayed', 'processing']);

        // Fix Coordinates (Mock)
        if (!order.lat) order.lat = (59.3 + Math.random() * 0.5).toFixed(4);
        if (!order.lng) order.lng = (18.0 + Math.random() * 0.5).toFixed(4);
        order.geocoding_status = 'success';
        order.geocoding_source = 'Mock Data';

        // Populate requested missing fields
        if (!order.scheduled_date) order.scheduled_date = generateDate(new Date(2025, 5, 1), new Date(2025, 8, 1));
        if (!order.category) order.category = getRandomItem(['Standard', 'Complex', 'Express']);
        if (!order.requirements) order.requirements = getRandomItem(['None', 'Permit Required', 'Traffic Control', 'Night Work']);
        if (!order.special_hw_needed) order.special_hw_needed = getRandomItem(['None', 'Cisco Router', 'Fiber Switch', 'Media Converter']);
        if (!order.lift_required) order.lift_required = Math.random() > 0.8 ? 'Yes' : 'No';
        if (!order.install_type) order.install_type = getRandomItem(['Underground', 'Aerial', 'Indoor', 'Facade']);
        if (!order.hw_lead_time) order.hw_lead_time = getRandomItem(['3 days', '1 week', '2 weeks', 'On Stock']);
        if (!order.notes) order.notes = getRandomItem(['Standard installation.', 'Customer requested call before arrival.', 'Key code required for entry.', 'Beware of dog.']);

        // Randomize delay_risk for all facilities as requested
        order.delay_risk = getRandomItem(['None', 'Low', 'Medium', 'High', 'At risk']);

        validOrders.push(order);
    });

    // Save cleaned orders
    fs.writeFileSync(orderPath, stringifyCSV(orderHeaders, validOrders));
    console.log(`✅ Saved ${validOrders.length} cleaned orders to FiberOrder.csv`);

    // 2. Sync SiteSurvey.csv
    syncSiteSurvey(validOrders);

    // 3. Sync NetworkDesign.csv
    syncNetworkDesign(validOrders);

    // 4. Sync WorkOrder.csv
    syncWorkOrder(validOrders);

    // 5. Sync RfsReport.csv
    syncRfsReport(validOrders);

    console.log('✨ Data Cleanup Complete!');
}

function syncSiteSurvey(orders) {
    const filePath = path.join(DATA_DIR, 'SiteSurvey.csv');
    const { headers, data: existingSurveys } = parseCSV(fs.readFileSync(filePath, 'utf-8'));

    const newSurveys = orders.map(order => {
        // Check if survey exists
        const existing = existingSurveys.find(s => s.facility_id === order.facility_id);

        return {
            facility_id: order.facility_id,
            client: order.client,
            order_id: order.order_id,
            address: order.address,
            surveyor: getRandomItem(['Sven Svensson', 'Lars Larsson', 'Karl Karlsson', 'Anna Björk', 'Erik Lind']),
            date: existing?.date || generateDate(new Date(2025, 0, 1), new Date(2025, 3, 1)),
            feasibility: getRandomItem(['feasible', 'feasible', 'feasible', 'requires_modification', 'impossible']),
            requires_special_hardware: Math.random() > 0.8 ? 'true' : 'false',
            requires_lift: Math.random() > 0.9 ? 'true' : 'false',
            installation_type: Math.random() > 0.5 ? 'Underground (Existing Duct)' : 'Aerial/Facade',
            notes: existing?.notes || 'Survey completed successfully.',
            id: existing?.id || `SURVEY-${order.order_id}`,
            created_date: existing?.created_date || new Date().toISOString(),
            updated_date: new Date().toISOString(),
            created_by_id: '692342b679f2a6c498963a83',
            created_by: 'nangfahmaproad@gmail.com',
            is_sample: 'false'
        };
    });

    // Ensure headers match
    const finalHeaders = headers.length > 0 ? headers : Object.keys(newSurveys[0]);
    fs.writeFileSync(filePath, stringifyCSV(finalHeaders, newSurveys));
    console.log(`✅ Synced ${newSurveys.length} surveys to SiteSurvey.csv`);
}

function syncNetworkDesign(orders) {
    const filePath = path.join(DATA_DIR, 'NetworkDesign.csv');
    const { headers, data: existingDesigns } = parseCSV(fs.readFileSync(filePath, 'utf-8'));

    // Only for orders that are past 'Planned'
    const relevantOrders = orders.filter(o => o.status !== 'Planned');

    const newDesigns = relevantOrders.map(order => {
        const existing = existingDesigns.find(d => d.facility_id === order.facility_id);

        return {
            facility_id: order.facility_id,
            order_id: order.order_id,
            status: existing?.status || 'approved',
            version: existing?.version || '1.0',
            hardware_specs: existing?.hardware_specs || '[{"category":"Hardware","model":"Cisco ISR 1100","quantity":1,"unit_price":1200}]',
            pricing: existing?.pricing || '{"hardware_total":1200,"labor_cost":500,"total_upfront":1700}',
            customer_contact: existing?.customer_contact || '{}',
            ai_insights: existing?.ai_insights || '[]',
            approval_history: existing?.approval_history || '[]',
            id: existing?.id || `DESIGN-${order.order_id}`,
            created_date: existing?.created_date || new Date().toISOString(),
            is_sample: 'false'
        };
    });

    const finalHeaders = headers.length > 0 ? headers : Object.keys(newDesigns[0] || { facility_id: '' });
    fs.writeFileSync(filePath, stringifyCSV(finalHeaders, newDesigns));
    console.log(`✅ Synced ${newDesigns.length} designs to NetworkDesign.csv`);
}

function syncWorkOrder(orders) {
    const filePath = path.join(DATA_DIR, 'WorkOrder.csv');
    const { headers, data: existingWOs } = parseCSV(fs.readFileSync(filePath, 'utf-8'));

    // Orders in Installation or later
    const relevantOrders = orders.filter(o => ['Installation', 'RFS', 'Completed'].includes(o.status) || o.status === 'In Progress');

    const newWOs = relevantOrders.map(order => {
        const existing = existingWOs.find(w => w.facility_id === order.facility_id);

        return {
            work_order_id: existing?.work_order_id || `WO-${order.order_id.split('-')[2]}`,
            facility_id: order.facility_id,
            order_id: order.order_id,
            status: existing?.status || (order.status === 'Completed' ? 'Completed' : 'Scheduled'),
            technician: existing?.technician || getRandomItem(['Erik Eriksson', 'Anna Andersson', 'Per Persson']),
            scheduled_date: existing?.scheduled_date || generateDate(new Date(2025, 4, 1), new Date(2025, 6, 1)),
            completion_date: order.status === 'Completed' ? (existing?.completion_date || new Date().toISOString().split('T')[0]) : '',
            notes: existing?.notes || 'Installation proceeding as planned.',
            id: existing?.id || `WO-${order.order_id}`,
            created_date: existing?.created_date || new Date().toISOString(),
            is_sample: 'false'
        };
    });

    const finalHeaders = headers.length > 0 ? headers : Object.keys(newWOs[0] || { work_order_id: '' });
    fs.writeFileSync(filePath, stringifyCSV(finalHeaders, newWOs));
    console.log(`✅ Synced ${newWOs.length} work orders to WorkOrder.csv`);
}

function syncRfsReport(orders) {
    const filePath = path.join(DATA_DIR, 'RfsReport.csv');
    const { headers, data: existingReports } = parseCSV(fs.readFileSync(filePath, 'utf-8'));

    // Generate RFS reports for ALL facilities as requested (01-13)
    const relevantOrders = orders;

    const newReports = relevantOrders.map(order => {
        const existing = existingReports.find(r => r.facility_id === order.facility_id);

        return {
            facility_id: order.facility_id,
            order_id: order.order_id,
            client: order.client,
            health_score: existing?.health_score || Math.floor(Math.random() * 10 + 90).toString(), // 90-100
            anomalies_detected: existing?.anomalies_detected || '[]',
            kpi_metrics: existing?.kpi_metrics || '{}',
            predictive_failure_prob: existing?.predictive_failure_prob || '0.05',
            customer_signature: existing?.customer_signature || 'Signed via DocuSign',
            customer_comments: existing?.customer_comments || 'Service working great.',
            signed_at: existing?.signed_at || new Date().toISOString(),
            invoice_status: 'paid',
            rfs_status: 'ready',
            completion_date: existing?.completion_date || new Date().toISOString().split('T')[0],
            id: existing?.id || `RFS-${order.order_id}`,
            created_date: existing?.created_date || new Date().toISOString(),
            updated_date: new Date().toISOString(),
            created_by_id: '692342b679f2a6c498963a83',
            created_by: 'nangfahmaproad@gmail.com',
            is_sample: 'false'
        };
    });

    const finalHeaders = headers.length > 0 ? headers : Object.keys(newReports[0] || { facility_id: '' });
    fs.writeFileSync(filePath, stringifyCSV(finalHeaders, newReports));
    console.log(`✅ Synced ${newReports.length} RFS reports to RfsReport.csv`);
}

cleanup();
