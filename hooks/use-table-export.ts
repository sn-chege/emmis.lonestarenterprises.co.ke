import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { ColumnDef } from '@tanstack/react-table'

export function useTableExport<TData>(
  data: TData[],
  columns: ColumnDef<TData, any>[],
  title: string = 'Export'
) {
  const getExportData = () => {
    const headers = columns.filter(col => col.id !== 'actions').map(col => 
      typeof col.header === 'string' ? col.header : String(col.accessorKey || '')
    )
    const rows = data.map(row => 
      columns.filter(col => col.id !== 'actions').map(col => {
        const value = (row as any)[col.accessorKey as string]
        return typeof value === 'object' ? '' : String(value || '')
      })
    )
    return { headers, rows }
  }

  const exportToCopy = () => {
    const { headers, rows } = getExportData()
    const csvContent = [headers, ...rows].map(row => row.join('\t')).join('\n')
    navigator.clipboard.writeText(csvContent)
  }

  const exportToCSV = () => {
    const { headers, rows } = getExportData()
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    const { headers, rows } = getExportData()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`)
  }

  const exportToPDF = () => {
    const { headers, rows } = getExportData()
    const doc = new jsPDF()
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
    })
    doc.save(`${title.replace(/\s+/g, '_')}.pdf`)
  }

  return {
    exportToCopy,
    exportToCSV,
    exportToExcel,
    exportToPDF,
  }
}