import createConnector from '../core/connectorBase';
import workflowData from '../mockData/workflow.json';

export default createConnector({
  id: 'workflow',
  name: 'Workflow Connector',
  config: { apiUrl: '', apiKey: '', fieldMapping: {} },
  fetchData: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return workflowData;
  }
});
