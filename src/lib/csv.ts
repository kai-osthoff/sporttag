/**
 * Download data as CSV file with UTF-8 BOM for German Excel compatibility.
 * Uses semicolon separator (German Excel default).
 */
export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return

  // Get headers from first row
  const headers = Object.keys(data[0])

  // Build CSV content with BOM for Excel UTF-8 support
  const BOM = '\uFEFF'
  const csvRows = [
    headers.join(';'), // German Excel uses semicolon
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? '')
          // Escape quotes and wrap if contains special chars
          if (value.includes('"') || value.includes(';') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(';')
    ),
  ]

  const csvContent = BOM + csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()

  URL.revokeObjectURL(url)
}
