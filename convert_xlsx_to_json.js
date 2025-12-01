import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'data', 'Datapoints - Tele2 Hackaton.xlsx');
const outputPath = path.join(__dirname, 'src', 'data', 'seedData.json');

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Skip header row 0, use row 1 as keys
const headers = rawData[1];
const rows = rawData.slice(2);

const excelDateToJSDate = (serial) => {
   if (!serial) return null;
   // Excel base date is Dec 30 1899
   const utc_days  = Math.floor(serial - 25569);
   const utc_value = utc_days * 86400;                                      
   const date_info = new Date(utc_value * 1000);
   return date_info.toISOString();
}

const seedData = {
    FiberOrder: [],
    NetworkDesign: [],
    NaasPreDesign: [],
    SiteSurvey: [],
    Supplier: [],
    Subcontractor: []
};

const subcontractors = new Set();

rows.forEach(row => {
    const getVal = (headerName) => {
        const index = headers.indexOf(headerName);
        return index !== -1 ? row[index] : null;
    };

    const facilityId = getVal('Facility ID');
    if (!facilityId) return;

    // FiberOrder
    let fiberOrder = {
        id: `order-${facilityId}`,
        facility_id: facilityId,
        address: getVal('Address'),
        city: getVal('Location (Kommun)'),
        subcontractor: getVal('Assigned Subcontractor'),
        priority: getVal('Order Priority (1-5)'),
        status: 'planned', // Default
        estimated_delivery_date: excelDateToJSDate(getVal('Fiber Delivery Estimation Date')),
        confirmed_delivery_date: excelDateToJSDate(getVal('Fiber Confirmed Delivery Date')),
        municipality_permit_lead_time: getVal('Municipality Permit Lead Time (Days)'),
        frost_period_constraint: getVal('Frost Period Constraint'),
        lat: 59.3293 + (Math.random() - 0.5) * 0.1, // Randomize slightly around Stockholm
        lng: 18.0686 + (Math.random() - 0.5) * 0.1,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        // Defaults
        access_status: 'Access Granted',
        rfs_status: 'Ready',
        technician_status: 'available',
        weather_risk: 'low',
        schedule_conflict: false,
        checklist_completion: 100,
        photo_count: 3,
        photo_validation: 'passed',
        config_status: 'complete',
        activation_status: 'active',
        test_results: 'passed',
        category: 'Fiber',
        geocoding_status: 'success'
    };

    // Apply Mock Scenarios
    if (facilityId === 'SITE-SE-01') {
        fiberOrder.technician_status = 'sick';
        fiberOrder.delay_risk = 'At risk';
    }
    if (facilityId === 'SITE-SE-02') {
        fiberOrder.weather_risk = 'high';
        fiberOrder.schedule_conflict = true;
        fiberOrder.delay_risk = 'At risk';
    }
    if (facilityId === 'SITE-SE-03') {
        fiberOrder.access_status = 'No Access';
        fiberOrder.checklist_completion = 66;
        fiberOrder.failed_checklist_items = ['Power redundancy verified'];
        fiberOrder.status = 'Blocked';
    }
    if (facilityId === 'SITE-SE-04') {
        fiberOrder.rfs_status = 'pending_approval';
        fiberOrder.photo_count = 1;
        fiberOrder.photo_validation = 'failed';
        fiberOrder.acceptanceStatus = 'PENDING';
        fiberOrder.customerComplaint = 'Network speed performance is lower than expected.';
        fiberOrder.delay_risk = 'Delayed';
    }
    if (facilityId === 'SITE-SE-05') {
        fiberOrder.config_status = 'incomplete';
        fiberOrder.config_validation = 'failed';
        fiberOrder.device_ip = '';
        fiberOrder.subnet_mask = '';
        fiberOrder.acceptanceStatus = 'PENDING';
        fiberOrder.customerComplaint = 'Latency is too high for our VoIP application.';
    }
    if (facilityId === 'SITE-SE-06') {
        fiberOrder.activation_status = 'failed';
        fiberOrder.test_results = 'failed';
        fiberOrder.ping_test = 'failed';
        fiberOrder.status = 'exception';
    }

    seedData.FiberOrder.push(fiberOrder);

    // NetworkDesign
    seedData.NetworkDesign.push({
        id: `nd-${facilityId}`,
        facility_id: facilityId,
        pricing: getVal('Pricing Model'),
        customer_contact: getVal('Customer Site Contact'),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
    });

    // NaasPreDesign
    seedData.NaasPreDesign.push({
        id: `npd-${facilityId}`,
        facility_id: facilityId,
        site_category: getVal('Site Category'),
        location_type: getVal('Location Type'),
        requirements: getVal('Customer Requirements'),
        special_hardware: getVal('Requires Special Hardware'),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
    });

    // SiteSurvey
    seedData.SiteSurvey.push({
        id: `ss-${facilityId}`,
        facility_id: facilityId,
        requires_lift: getVal('Requires Lift'),
        installation_type: getVal('Installation Type'),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
    });
    
    // Collect Subcontractors
    const sub = getVal('Assigned Subcontractor');
    if (sub) subcontractors.add(sub);
});

// Subcontractors
subcontractors.forEach(sub => {
    seedData.Subcontractor.push({
        id: `sub-${sub.replace(/\s+/g, '-').toLowerCase()}`,
        name: sub,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
    });
});

// Suppliers (Mock one for now as it's not detailed in xlsx per row, but there is a lead time col)
seedData.Supplier.push({
    id: 'sup-1',
    name: 'Main Supplier',
    lead_time_days: 30, // From the header 'Supplier Hardware Lead Time (days)' which had value 30 in row 1/2
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString()
});

fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
console.log('Seed data generated at:', outputPath);
