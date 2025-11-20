"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Download, ZoomIn, ZoomOut } from "lucide-react"
import { useState, useEffect } from "react"

interface ContractTemplate {
  id: string
  name: string
  type: string
  size: string
  lastModified: string
  description?: string
}

interface PDFPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: ContractTemplate | null
}

export function PDFPreviewModal({ open, onOpenChange, template }: PDFPreviewModalProps) {
  const [zoom, setZoom] = useState(100)
  const [templateData, setTemplateData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (template && open) {
      fetchTemplateData()
    }
  }, [template, open])

  const fetchTemplateData = async () => {
    if (!template) return
    setLoading(true)
    try {
      const response = await fetch(`/api/contracts/templates/${template.id}`)
      if (response.ok) {
        const data = await response.json()
        setTemplateData(data)
      }
    } catch (error) {
      console.error('Failed to fetch template data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Contract Preview - {template.name}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-16 text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            {template.type} Document - {template.size}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-[600px] bg-gray-100 rounded-lg overflow-auto">
          <div className="p-4">
            <div 
              className="bg-white shadow-lg mx-auto rounded-lg overflow-hidden"
              style={{ 
                width: `${8.5 * (zoom / 100) * 100}px`,
                minHeight: `${11 * (zoom / 100) * 100}px`
              }}
            >
              {template.type === "PDF" ? (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <FileText className="h-20 w-20 mx-auto text-blue-600" />
                    <div>
                      <h3 className="text-xl font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {template.description}
                      </p>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>PDF Viewer Integration</strong>
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          This would display the actual PDF content using PDF.js or similar library.
                          The PDF would be rendered with proper zoom controls and navigation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-8">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p>Loading preview...</p>
                      </div>
                    </div>
                  ) : templateData?.elements ? (
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <h3 className="text-xl font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="prose max-w-none" style={{ fontSize: `${zoom/100}rem` }}>
                        {templateData.elements.map((element: any, index: number) => {
                          if (element.type === 'content' && element.data) {
                            return (
                              <div 
                                key={index} 
                                dangerouslySetInnerHTML={{ 
                                  __html: element.data
                                    .replace(/\n/g, '<br>')
                                    .replace(/--- PAGE BREAK ---/g, '<div style="page-break-before: always; border-top: 2px dashed #ccc; margin: 20px 0; padding: 10px; text-align: center; color: #666;">Page Break</div>')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                    .replace(/_(.*?)_/g, '<u>$1</u>')
                                    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                                    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                                    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                                }} 
                                className="quill-content"
                                style={{
                                  fontFamily: 'Times New Roman, serif',
                                  lineHeight: '1.6',
                                  whiteSpace: 'pre-wrap'
                                }}
                              />
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <FileText className="h-20 w-20 mx-auto text-gray-400" />
                      <div>
                        <h3 className="text-xl font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {template.description || 'No content available'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}