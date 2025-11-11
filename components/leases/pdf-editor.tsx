"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Save, 
  Download, 
  Upload, 
  Type, 
  Image, 
  Square, 
  Circle,
  Minus,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  MousePointer,
  Eye
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PDFEditorProps {
  templateId?: string
  templateName?: string
  onSave?: (data: any) => void
  onCancel?: () => void
}

interface DocumentElement {
  id: string
  type: 'text' | 'image' | 'signature' | 'rectangle'
  x: number
  y: number
  width: number
  height: number
  content?: string
  style?: Record<string, any>
}

export function PDFEditor({ templateId, templateName, onSave, onCancel }: PDFEditorProps) {
  const [zoom, setZoom] = useState(100)
  const [selectedTool, setSelectedTool] = useState<string>("select")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [elements, setElements] = useState<DocumentElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [templateData, setTemplateData] = useState({
    name: templateName || "",
    description: "",
    content: ""
  })
  const [documentContent, setDocumentContent] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
    }
  }

  const handleSave = () => {
    onSave?.({
      ...templateData,
      pdfFile,
      elements,
      documentContent,
      zoom,
      lastModified: new Date().toISOString()
    })
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const addElement = useCallback((type: DocumentElement['type']) => {
    const newElement: DocumentElement = {
      id: `elem_${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 40 : 100,
      content: type === 'text' ? 'Click to edit text' : undefined,
      style: {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: type === 'rectangle' ? '#f0f0f0' : 'transparent',
        border: type === 'rectangle' ? '1px solid #ccc' : 'none'
      }
    }
    setElements(prev => [...prev, newElement])
    setSelectedElement(newElement.id)
  }, [])

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (selectedTool !== 'select') return
    e.preventDefault()
    e.stopPropagation()
    
    const element = elements.find(el => el.id === elementId)
    if (!element) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setSelectedElement(elementId)
    setIsDragging(true)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return
    
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - canvasRect.left - dragOffset.x
    const newY = e.clientY - canvasRect.top - dragOffset.y
    
    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
        : el
    ))
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === 'select') {
      setSelectedElement(null)
      return
    }
    
    if (selectedTool !== 'select' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newElement: DocumentElement = {
        id: `elem_${Date.now()}`,
        type: selectedTool as DocumentElement['type'],
        x,
        y,
        width: selectedTool === 'text' ? 200 : 100,
        height: selectedTool === 'text' ? 40 : 100,
        content: selectedTool === 'text' ? 'Click to edit text' : undefined,
        style: {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#000000',
          backgroundColor: selectedTool === 'rectangle' ? '#f0f0f0' : 'transparent',
          border: selectedTool === 'rectangle' ? '1px solid #ccc' : 'none'
        }
      }
      
      setElements(prev => [...prev, newElement])
      setSelectedElement(newElement.id)
      setSelectedTool('select')
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <Input
            value={templateData.name}
            onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Template name"
            className="w-64"
          />
          <div className="flex items-center gap-2">
            <Button
              variant={selectedTool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool("select")}
            >
              <MousePointer className="h-4 w-4 mr-1" />
              Select
            </Button>
            <Button
              variant={selectedTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool("text")}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedTool === "image" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool("image")}
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTool("rectangle")}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-16 text-center">{zoom}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50">
          <Tabs defaultValue="properties" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="elements">Elements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium">Description</label>
                    <Textarea
                      value={templateData.description}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Template description"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  {!pdfFile && (
                    <div>
                      <label className="text-xs font-medium">Upload PDF</label>
                      <div className="mt-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose PDF File
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {pdfFile && (
                    <div className="text-xs text-green-600">
                      ✓ PDF loaded: {pdfFile.name}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="elements" className="p-4">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'text')}
                  onClick={() => addElement('text')}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Text Field
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'signature')}
                  onClick={() => addElement('signature')}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Signature Box
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'image')}
                  onClick={() => addElement('image')}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'rectangle')}
                  onClick={() => addElement('rectangle')}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Rectangle
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-gray-200 p-4 overflow-auto">
          <div 
            ref={canvasRef}
            className="bg-white shadow-lg mx-auto relative cursor-crosshair" 
            style={{ 
              width: `${8.5 * 100}px`, 
              minHeight: `${11 * 100}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left'
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {/* Document Background */}
            <div className="w-full h-full border border-gray-300 bg-white relative overflow-hidden">
              {/* Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #ccc 1px, transparent 1px),
                    linear-gradient(to bottom, #ccc 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
              
              {/* Main Document Content Area */}
              <div 
                className="absolute inset-4 bg-gray-50 border border-gray-200 rounded p-4 overflow-auto cursor-text"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setDocumentContent(e.currentTarget.textContent || '')}
                onPaste={(e) => {
                  e.preventDefault()
                  const text = e.clipboardData.getData('text/plain')
                  document.execCommand('insertText', false, text)
                  setDocumentContent(e.currentTarget.textContent || '')
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const elementType = e.dataTransfer.getData('text/plain')
                  if (elementType) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const y = e.clientY - rect.top
                    
                    const newElement: DocumentElement = {
                      id: `elem_${Date.now()}`,
                      type: elementType as DocumentElement['type'],
                      x,
                      y,
                      width: elementType === 'text' ? 200 : 100,
                      height: elementType === 'text' ? 40 : 100,
                      content: elementType === 'text' ? 'Click to edit text' : undefined,
                      style: {
                        fontSize: '14px',
                        fontFamily: 'Arial',
                        color: '#000000',
                        backgroundColor: elementType === 'rectangle' ? '#f0f0f0' : 'transparent',
                        border: elementType === 'rectangle' ? '1px solid #ccc' : 'none'
                      }
                    }
                    
                    setElements(prev => [...prev, newElement])
                    setSelectedElement(newElement.id)
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  minHeight: 'calc(100% - 32px)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: 'Arial, sans-serif',
                  outline: 'none'
                }}
                data-placeholder="Start typing your contract content here..."
              >
                {!documentContent && (
                  <div className="text-gray-400 pointer-events-none">
                    Start typing your contract content here...
                  </div>
                )}
              </div>
              
              {/* Document Elements */}
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute cursor-move border-2 ${
                    selectedElement === element.id 
                      ? 'border-blue-500 border-dashed' 
                      : 'border-transparent hover:border-gray-400'
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    ...element.style
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                >
                  {element.type === 'text' && (
                    <div 
                      className="w-full h-full p-2 outline-none resize-none overflow-hidden"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newContent = e.currentTarget.textContent || ''
                        setElements(prev => prev.map(el => 
                          el.id === element.id ? { ...el, content: newContent } : el
                        ))
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  {element.type === 'rectangle' && (
                    <div className="w-full h-full" />
                  )}
                  {element.type === 'image' && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
                      <Image className="h-8 w-8 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-2">Image</span>
                    </div>
                  )}
                  {element.type === 'signature' && (
                    <div className="w-full h-full flex items-center justify-center bg-yellow-50 border-2 border-dashed border-yellow-300">
                      <span className="text-xs text-yellow-700">Signature</span>
                    </div>
                  )}
                  
                  {/* Resize Handles */}
                  {selectedElement === element.id && (
                    <>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize" />
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize" />
                    </>
                  )}
                </div>
              ))}
              
              {/* PDF Overlay if loaded */}
              {pdfFile && (
                <div className="absolute top-2 right-2 bg-white p-2 rounded shadow-lg border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-xs">PDF: {pdfFile.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>PDF Preview - {templateData.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-[600px] bg-white border rounded-lg p-6 overflow-auto">
            <div className="max-w-none">
              <h1 className="text-2xl font-bold mb-4 text-center">{templateData.name}</h1>
              <div 
                className="whitespace-pre-wrap"
                style={{
                  fontSize: '12px',
                  lineHeight: '1.6',
                  fontFamily: 'Arial, sans-serif'
                }}
                dangerouslySetInnerHTML={{ __html: documentContent || 'No content to preview' }}
              />
              
              {/* Render Elements */}
              <div className="relative mt-8">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className="absolute border border-gray-300 bg-gray-50 p-2"
                    style={{
                      left: element.x / 2,
                      top: element.y / 2,
                      width: element.width / 2,
                      height: element.height / 2,
                      fontSize: '10px'
                    }}
                  >
                    {element.type === 'text' && element.content}
                    {element.type === 'signature' && '[Signature]'}
                    {element.type === 'image' && '[Image]'}
                    {element.type === 'rectangle' && ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={() => {
              window.print()
            }}>
              <Download className="h-4 w-4 mr-2" />
              Print/Save as PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}