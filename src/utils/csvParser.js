/**
 * Parses a CSV string into an array of objects.
 * Assumes the first row contains headers.
 * Handles quoted fields and multiline values.
 * 
 * @param {string} csvText - The raw CSV string.
 * @returns {Array<Object>} - Array of objects representing the CSV rows.
 */
export const parseCsv = (csvText) => {
  if (!csvText || typeof csvText !== 'string') return [];

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  // Normalize line endings to \n
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField);
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // End of row
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add last field/row if exists
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());

  return rows.slice(1).map(values => {
    const entry = {};
    headers.forEach((header, index) => {
      if (!header) return;

      let value = values[index];

      // Handle undefined/null
      if (value === undefined) {
        value = '';
      }

      // Basic type inference
      if (value === 'true') value = true;
      else if (value === 'false') value = false;

      // Note: We avoid aggressive number conversion to prevent ID corruption

      entry[header] = value;
    });
    return entry;
  }).filter(obj => Object.keys(obj).length > 0);
};

// Removed parseLine helper as it's no longer used
