import Dexie from 'dexie';
import seedData from '@/data/seedData.json';

export class Tele2Database extends Dexie {
    constructor() {
        super('Tele2Database');
        this.version(1).stores({
            fiberOrders: 'id, facility_id, status, priority, subcontractor',
            networkDesigns: 'id, facility_id',
            naasPreDesigns: 'id, facility_id',
            siteSurveys: 'id, facility_id',
            suppliers: 'id, name',
            subcontractors: 'id, name'
        });
        this.fiberOrders = this.table('fiberOrders');
        this.networkDesigns = this.table('networkDesigns');
        this.naasPreDesigns = this.table('naasPreDesigns');
        this.siteSurveys = this.table('siteSurveys');
        this.suppliers = this.table('suppliers');
        this.subcontractors = this.table('subcontractors');
    }
}

export const db = new Tele2Database();

db.on('populate', async () => {
    await db.fiberOrders.bulkAdd(seedData.FiberOrder);
    await db.networkDesigns.bulkAdd(seedData.NetworkDesign);
    await db.naasPreDesigns.bulkAdd(seedData.NaasPreDesign);
    await db.siteSurveys.bulkAdd(seedData.SiteSurvey);
    await db.suppliers.bulkAdd(seedData.Supplier);
    await db.subcontractors.bulkAdd(seedData.Subcontractor);
    console.log('Database seeded successfully');
});

export const resetDatabase = async () => {
    await db.delete();
    await db.open();
};
