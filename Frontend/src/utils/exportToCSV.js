export const exportToCSV = (data, fileName = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  ).filter(key => !key.startsWith('_'))

  // Create CSV header
  const header = keys.join(',')

  // Create CSV rows
  const rows = data.map(item =>
    keys.map(key => {
      const value = item[key]
      // Handle strings with commas
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value || ''
    }).join(',')
  )

  // Combine header and rows
  const csvContent = [header, ...rows].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
