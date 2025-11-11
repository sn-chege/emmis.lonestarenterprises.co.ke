"use client"

import { useState, useEffect } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Upload,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils/format"
import { PDFPreviewModal } from "@/components/leases/pdf-preview-modal"

import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useNotifications } from "@/components/notification-provider"
import { CreateTemplateDialog } from "@/components/leases/create-template-dialog"
import { UploadTemplateDialog } from "@/components/leases/upload-template-dialog"

interface ContractTemplate {
  id: string
  name: string
  type: string
  size: string
  lastModified: string
  description?: string
}

export default function ContractTemplatesPage() {
  const { notifySuccess, notifyError, notifyDelete } = useNotifications()
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)

  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<ContractTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/contracts/templates')
        if (response.ok) {
          const data = await response.json()
          setTemplates(data)
        } else {
          // Fallback to mock data if API fails
          setTemplates([
            {
              id: "TMP001",
              name: "Standard Equipment Lease Agreement",
              type: "PDF",
              size: "245 KB",
              lastModified: "2025-01-15",
              description: "Standard lease agreement template for equipment rentals"
            },
            {
              id: "TMP002", 
              name: "Short-term Lease Contract",
              type: "CUSTOM",
              size: "180 KB",
              lastModified: "2025-01-10",
              description: "Template for short-term equipment leases (less than 6 months)"
            }
          ])
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error)
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">Loading contract templates...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/leases">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Contract Templates</h1>
              <p className="text-muted-foreground">Manage lease agreement templates and documents</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Template
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
            <Link href="/leases/contract-templates/editor-v2">
              <Button 
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Template V2
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Templates</CardTitle>
            <CardDescription>
              Contract templates stored in leases/contract-templates folder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{template.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.type === "PDF" ? "default" : "secondary"}>
                          {template.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{template.size}</TableCell>
                      <TableCell>{formatDate(template.lastModified)}</TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-muted-foreground">
                          {template.description}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template)
                              setPreviewOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Link href={`/leases/contract-templates/edit/${template.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setTemplateToDelete(template)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <PDFPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          template={selectedTemplate}
        />

        <UploadTemplateDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
        />

        <CreateTemplateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />



        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Template"
          description={`Are you sure you want to delete template "${templateToDelete?.name}"? This action cannot be undone.`}
          onConfirm={async () => {
            if (!templateToDelete) return
            
            setIsDeleting(true)
            try {
              const response = await fetch(`/api/contracts/templates/${templateToDelete.id}`, {
                method: 'DELETE'
              })
              
              if (!response.ok) throw new Error('Failed to delete template')
              
              setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id))
              notifyDelete("Template Deleted", `Template "${templateToDelete.name}" has been deleted successfully.`)
              setDeleteDialogOpen(false)
              setTemplateToDelete(null)
            } catch (error) {
              console.error('Delete template error:', error)
              notifyError("Delete Failed", error instanceof Error ? error.message : 'Failed to delete template')
            } finally {
              setIsDeleting(false)
            }
          }}
          isDeleting={isDeleting}
        />
      </div>
    </ProtectedLayout>
  )
}