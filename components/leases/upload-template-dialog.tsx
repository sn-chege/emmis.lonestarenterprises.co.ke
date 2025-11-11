"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/components/notification-provider"

interface UploadTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadTemplateDialog({ open, onOpenChange }: UploadTemplateDialogProps) {
  const router = useRouter()
  const { notifySuccess, notifyError } = useNotifications()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFile(files[0])
      if (!name) {
        setName(files[0].name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
      if (!name) {
        setName(files[0].name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleUpload = async () => {
    if (!name.trim()) {
      notifyError("Validation Error", "Template name is required")
      return
    }

    if (!file) {
      notifyError("Validation Error", "Please select a file to upload")
      return
    }

    setIsUploading(true)
    try {
      // Upload file first
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name.trim())
      formData.append('description', description.trim())

      const response = await fetch('/api/contracts/templates/upload', {
        method: 'POST',
        body: formData
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to upload template')
      }

      notifySuccess("Template Uploaded", `Template "${name}" has been uploaded successfully.`)
      handleClose()
      window.location.reload() // Refresh the template list
    } catch (error) {
      console.error('Upload template error:', error)
      notifyError("Upload Failed", error instanceof Error ? error.message : "Failed to upload template")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setFile(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Template</DialogTitle>
          <DialogDescription>
            Upload a template file or create a new template with a name and description.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter template description (optional)"
              rows={3}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label>Template File (Optional)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop a file here, or click to select
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploading}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>
            {file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                Remove File
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}