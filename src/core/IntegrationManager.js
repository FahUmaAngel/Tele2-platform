const IntegrationManager = {
  connectors: [],
  enabled: {},

  register(connector) {
    // Avoid duplicate registration
    if (!this.connectors.find(c => c.id === connector.id)) {
      this.connectors.push(connector);
      this.enabled[connector.id] = false;
    }
  },

  setEnabled(id, value) {
    this.enabled[id] = value;
  },

  getEnabledConnectors() {
    return this.connectors.filter(c => this.enabled[c.id]);
  },

  getAllConnectors() {
    return this.connectors;
  },

  isEnabled(id) {
    return !!this.enabled[id];
  }
};

export default IntegrationManager;
