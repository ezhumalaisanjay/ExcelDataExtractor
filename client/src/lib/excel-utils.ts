export function exportToJSON(data: any[][], filename: string) {
  const headers = data[0];
  const rows = data.slice(1);
  
  const jsonData = rows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((header: any, index: number) => {
      obj[header || `Column_${index + 1}`] = row[index] || '';
    });
    return obj;
  });

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
    type: 'application/json' 
  });
  downloadFile(blob, filename);
}

export function exportToCSV(data: any[][], filename: string) {
  const csvContent = data.map(row => 
    row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadFile(blob, filename);
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
