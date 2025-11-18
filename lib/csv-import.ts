export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim())
  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  })
}

export function validateCSVData(
  data: string[][],
  requiredFields: string[],
  entityType: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.length === 0) {
    errors.push('CSV file is empty')
    return { isValid: false, errors }
  }
  
  const headers = data[0]
  const missingFields = requiredFields.filter(field => !headers.includes(field))
  
  if (missingFields.length > 0) {
    errors.push(`Missing required columns: ${missingFields.join(', ')}`)
  }
  
  // Validate data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 1
    
    if (row.length !== headers.length) {
      errors.push(`Row ${rowNum}: Column count mismatch`)
      continue
    }
    
    // Check required fields are not empty
    requiredFields.forEach(field => {
      const fieldIndex = headers.indexOf(field)
      if (fieldIndex !== -1 && !row[fieldIndex]?.trim()) {
        errors.push(`Row ${rowNum}: ${field} is required`)
      }
    })
    
    // Entity-specific validations
    if (entityType === 'users') {
      const emailIndex = headers.indexOf('email')
      if (emailIndex !== -1 && row[emailIndex]) {
        const email = row[emailIndex].trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push(`Row ${rowNum}: Invalid email format`)
        }
      }
      
      const roleIndex = headers.indexOf('role')
      if (roleIndex !== -1 && row[roleIndex]) {
        const role = row[roleIndex].trim().toLowerCase()
        if (!['admin', 'manager', 'technician', 'viewer'].includes(role)) {
          errors.push(`Row ${rowNum}: Invalid role. Must be admin, manager, technician, or viewer`)
        }
      }
    }
    
    if (entityType === 'customers') {
      const emailIndex = headers.indexOf('email')
      if (emailIndex !== -1 && row[emailIndex]) {
        const email = row[emailIndex].trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push(`Row ${rowNum}: Invalid email format`)
        }
      }
    }
    
    // Date validations
    const dateFields = ['purchaseDate', 'warrantyExpiry', 'contractStartDate', 'contractEndDate', 'scheduledDate', 'completedDate']
    dateFields.forEach(field => {
      const fieldIndex = headers.indexOf(field)
      if (fieldIndex !== -1 && row[fieldIndex]) {
        const dateValue = row[fieldIndex].trim()
        if (dateValue && isNaN(Date.parse(dateValue))) {
          errors.push(`Row ${rowNum}: Invalid date format for ${field}`)
        }
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.slice(0, 50) // Limit to first 50 errors
  }
}

export function csvToObjects(data: string[][]): Record<string, any>[] {
  if (data.length === 0) return []
  
  const headers = data[0]
  return data.slice(1).map(row => {
    const obj: Record<string, any> = {}
    headers.forEach((header, index) => {
      const value = row[index]?.trim() || ''
      
      // Convert date strings to Date objects
      if (['purchaseDate', 'warrantyExpiry', 'contractStartDate', 'contractEndDate', 'scheduledDate', 'completedDate'].includes(header) && value) {
        obj[header] = new Date(value)
      } else {
        obj[header] = value
      }
    })
    return obj
  })
}