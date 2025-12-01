import createConnector from '../core/connectorBase';
import erpData from '../mockData/erp.json';

export default createConnector({
  id: 'erp',
  name: 'ERP Connector',
  config: { apiUrl: '', apiKey: '', fieldMapping: {} },
  fetchData: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real scenario we would fetch from config.apiUrl
    // Here we return mock data
    return erpData;
  }
});
