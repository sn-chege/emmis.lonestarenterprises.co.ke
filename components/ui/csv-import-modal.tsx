'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: 'customers' | 'assets' | 'work-orders' | 'maintenance' | 'users'
  onImport: (file: File) => Promise<{ success: boolean; message: string; errors?: string[] }>
}

const templates = {
  customers: [
    'id', 'name', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 
    'country', 'contactPerson', 'contractStartDate', 'contractEndDate', 'status'
  ],
  assets: [
    'id', 'name', 'description', 'serialNumber', 'model', 'manufacturer', 
    'purchaseDate', 'warrantyExpiry', 'location', 'status', 'customerId'
  ],
  'work-orders': [
    'id', 'title', 'description', 'priority', 'status', 'assetId', 
    'assignedTo', 'requestedBy', 'scheduledDate', 'completedDate'
  ],
  maintenance: [
    'id', 'title', 'description', 'assetId', 'scheduledDate', 'frequency', 
    'priority', 'assignedTo', 'status', 'estimatedDuration'
  ],
  users: [
    'id', 'name', 'email', 'role', 'phone', 'department', 'status'
  ]
}

export function CSVImportModal({ isOpen, onClose, entityType, onImport }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; errors?: string[] } | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const headers = templates[entityType]
    const csv = headers.join(',') + '\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${entityType}-template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile)
      setResult(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleImport = async () => {
    if (!file) return
    
    setImporting(true)
    try {
      const result = await onImport(file)
      setResult(result)
      if (result.success) {
        setFile(null)
        setTimeout(() => {
          onClose()
          setResult(null)
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Import failed. Please try again.',
        errors: ['Unexpected error occurred']
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Step 1: Download Template</Label>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full mt-2"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <div>
            <Label>Step 2: Upload Filled CSV</Label>
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                {file ? file.name : "Drop CSV file here or click to browse"}
              </p>
              <p className="text-xs text-gray-500">Only CSV files are accepted</p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>



          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.message}
                {result.errors && result.errors.length > 0 && (
                  <ul className="mt-2 list-disc list-inside">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-xs">{error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-xs">...and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1"
            >
              {importing ? (
                'Importing...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}