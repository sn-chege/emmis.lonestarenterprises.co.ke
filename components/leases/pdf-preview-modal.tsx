"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Download, ZoomIn, ZoomOut } from "lucide-react"
import { useState } from "react"

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
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <FileText className="h-20 w-20 mx-auto text-green-600" />
                    <div>
                      <h3 className="text-xl font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {template.description}
                      </p>
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Document Preview</strong>
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          DOCX files would be converted to PDF or displayed using appropriate viewer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}