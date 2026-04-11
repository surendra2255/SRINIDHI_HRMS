/**
 * Utility to export data to CSV format and trigger a download.
 * @param data Array of objects to export
 * @param filename Name of the file to download
 * @param headers Optional custom headers mapping { key: 'Header Name' }
 */
export const exportToCSV = (data: any[], filename: string, headers?: Record<string, string>) => {
  if (!data || data.length === 0) return;

  const keys = Object.keys(headers || data[0]);
  const headerRow = keys.map(key => headers ? headers[key] : key).join(',');

  const rows = data.map(item => {
    return keys.map(key => {
      const value = item[key] === null || item[key] === undefined ? '' : item[key];
      // Handle objects/arrays by stringifying
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      // Escape quotes and wrap in quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
