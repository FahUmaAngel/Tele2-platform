export async function consolidate(connectors) {
  const output = [];

  for (const c of connectors) {
    try {
      const data = await c.fetchData();
      output.push({
        source: c.name,
        type: 'generic',
        data: data
      });
    } catch (error) {
      console.error(`Error fetching data from ${c.name}:`, error);
      output.push({
        source: c.name,
        type: 'error',
        data: null,
        error: error.message
      });
    }
  }

  return output;
}
