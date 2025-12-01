import createConnector from '../core/connectorBase';
import hrData from '../mockData/hr.json';

export default createConnector({
  id: 'hr',
  name: 'HR Connector',
  config: { apiUrl: '', apiKey: '', fieldMapping: {} },
  fetchData: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return hrData;
  }
});
