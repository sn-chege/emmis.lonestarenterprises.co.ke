"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Save, 
  Download, 
  Upload, 
  Type, 
  Image, 
  Square,
  ZoomIn,
  ZoomOut,
  Eye,
  Trash2,
  MousePointer,
  Undo2,
  Redo2,
  Move,
  Plus,
  FileImage
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Element {
  id: string
  type: 'text' | 'rectangle' | 'signature' | 'image' | 'checkbox'
  x: number
  y: number
  width: number
  height: number
  content?: string
  imageUrl?: string
  selected?: boolean
  page: number
  checked?: boolean
}

interface FabricPDFEditorProps {
  templateId?: string
  templateName?: string
  initialElements?: Element[]
  onSave?: (data: any) => void
  onCancel?: () => void
}

export function FabricPDFEditor({ templateId, templateName, initialElements, onSave, onCancel }: FabricPDFEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [elements, setElements] = useState<Element[]>(initialElements || [])
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(100)
  const [showPreview, setShowPreview] = useState(false)
  const [documentContent, setDocumentContent] = useState('Start typing your contract content here...')
  const [history, setHistory] = useState<Element[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [draggedPage, setDraggedPage] = useState<number | null>(null)
  const [leftMargin, setLeftMargin] = useState(2.5)
  const [rightMargin, setRightMargin] = useState(2.5)
  const [topMargin, setTopMargin] = useState(2.5)
  const [bottomMargin, setBottomMargin] = useState(2.5)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [templateData, setTemplateData] = useState({
    name: templateName || "",
    description: "",
    content: ""
  })
  const [pageContents, setPageContents] = useState<string[]>([''])
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const [tabStops, setTabStops] = useState<number[]>([2, 4, 6, 8, 10]) // Default tab stops in cm
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)



  const addElement = (type: Element['type'], x = 100, y = 100, imageUrl?: string) => {
    const newElement: Element = {
      id: `elem_${Date.now()}`,
      type,
      x,
      y,
      width: type === 'text' ? 300 : type === 'image' ? 200 : type === 'checkbox' ? 20 : 150,
      height: type === 'text' ? 40 : type === 'image' ? 150 : type === 'checkbox' ? 20 : 80,
      content: type === 'text' ? 'New text element' : undefined,
      imageUrl,
      page: currentPage,
      checked: type === 'checkbox' ? false : undefined
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    saveToHistory(newElements)
    setSelectedElement(newElement.id)
  }

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const element = elements.find(el => el.id === elementId)
    if (!element || !canvasRef.current) return
    
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const scale = zoom / 100
    
    setDragOffset({
      x: (e.clientX - canvasRect.left) / scale - element.x,
      y: (e.clientY - canvasRect.top) / scale - element.y
    })
    setDragStartPos({ x: element.x, y: element.y })
    setSelectedElement(elementId)
    setIsDragging(true)
    
    // Add global mouse events
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const scale = zoom / 100
      const element = elements.find(el => el.id === elementId)
      if (!element) return
      
      const newX = Math.max(0, Math.min(794 - element.width, (e.clientX - canvasRect.left) / scale - dragOffset.x))
      const newY = Math.max(0, Math.min(1123 - element.height, (e.clientY - canvasRect.top) / scale - dragOffset.y))
      
      setElements(prev => prev.map(el => 
        el.id === elementId ? { ...el, x: newX, y: newY } : el
      ))
    }
    
    const handleGlobalMouseUp = () => {
      const element = elements.find(el => el.id === elementId)
      if (element && (element.x !== dragStartPos.x || element.y !== dragStartPos.y)) {
        saveToHistory(elements)
      }
      setIsDragging(false)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
    
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
  }





  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    
    // Handle file drops (images from desktop)
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile && canvasRef.current) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        const rect = canvasRef.current!.getBoundingClientRect()
        const scale = zoom / 100
        const x = (e.clientX - rect.left) / scale
        const y = (e.clientY - rect.top) / scale
        addElement('image', x, y, imageUrl)
      }
      reader.readAsDataURL(imageFile)
      return
    }
    
    // Handle element drops from sidebar
    const elementType = e.dataTransfer.getData('text/plain') as Element['type']
    if (elementType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const scale = zoom / 100
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale
      addElement(elementType, x, y)
    }
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const saveToHistory = (newElements: Element[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newElements])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(history[historyIndex + 1])
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        if (selectedElement) {
          const newElements = elements.map(el => 
            el.id === selectedElement ? { ...el, imageUrl } : el
          )
          setElements(newElements)
          saveToHistory(newElements)
        } else {
          // Add new image element if none selected
          addElement('image', 100, 100, imageUrl)
        }
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    event.target.value = ''
  }



  useEffect(() => {
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          undo()
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault()
          redo()
        } else if (e.key === 's') {
          e.preventDefault()
          handleSave()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, history, templateId])

  const addText = () => addElement('text')
  const addRectangle = () => addElement('rectangle')
  const addSignature = () => addElement('signature')
  const addImage = () => addElement('image')
  const addCheckbox = () => addElement('checkbox')

  const deleteSelected = () => {
    if (selectedElement) {
      const newElements = elements.filter(el => el.id !== selectedElement)
      setElements(newElements)
      saveToHistory(newElements)
      setSelectedElement(null)
    }
  }

  const deleteElement = (elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId)
    setElements(newElements)
    saveToHistory(newElements)
    if (selectedElement === elementId) {
      setSelectedElement(null)
    }
  }

  const handleZoom = (newZoom: number) => {
    setZoom(newZoom)
  }

  const handleTextOverflow = (pageIndex: number, content: string) => {
    const element = contentRefs.current[pageIndex]
    if (!element) return
    
    // Simple approach: if content overflows, move excess to next page
    const words = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0)
    const wordsPerPage = Math.floor(words.length * (element.clientHeight / element.scrollHeight))
    
    if (wordsPerPage < words.length) {
      const fittingContent = words.slice(0, wordsPerPage).join(' ')
      const overflowContent = words.slice(wordsPerPage).join(' ')
      
      const newPageContents = [...pageContents]
      newPageContents[pageIndex] = fittingContent
      
      // Create new page if needed
      if (pageIndex + 1 >= totalPages) {
        setTotalPages(prev => prev + 1)
        newPageContents.push(overflowContent)
      } else {
        newPageContents[pageIndex + 1] = overflowContent + ' ' + (newPageContents[pageIndex + 1] || '')
      }
      
      setPageContents(newPageContents)
    }
  }

  const handleSave = () => {
    onSave?.({
      ...templateData,
      elements,
      documentContent,
      pageContents,
      zoom,
      lastModified: new Date().toISOString()
    })
  }

  const handlePreview = () => {
    setShowPreview(true)
  }



  const exportToPDF = () => {
    window.print()
  }

  return (
    <div className={`h-screen flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <Input
            value={templateData.name}
            onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Template name"
            className="w-64"
          />
          <div className="flex items-center gap-2 text-xs text-gray-500">

          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? '⤓' : '⤢'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <Button variant="outline" size="sm" onClick={() => handleZoom(Math.max(25, zoom - 25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-16 text-center">{zoom}%</span>
          <Button variant="outline" size="sm" onClick={() => handleZoom(Math.min(200, zoom + 25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
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

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`w-80 border-r bg-gray-50 flex-shrink-0 ${isFullscreen ? 'hidden' : ''}`}>
          <Tabs defaultValue="elements" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="layers">Layers ({elements.filter(el => el.page === currentPage).length})</TabsTrigger>
              <TabsTrigger value="pages">Pages ({totalPages})</TabsTrigger>
            </TabsList>
            

            
            <TabsContent value="elements" className="p-4 flex flex-col h-full overflow-y-auto">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Add Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'text')}
                  onClick={addText}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'rectangle')}
                  onClick={addRectangle}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Add Rectangle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'signature')}
                  onClick={addSignature}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Add Signature Box
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'image')}
                  onClick={addImage}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', 'checkbox')}
                  onClick={() => addElement('checkbox')}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Add Checkbox
                </Button>

                </CardContent>
              </Card>
              
              {/* Text Formatting Panel */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Text Formatting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Text Style */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Style</label>
                    <div className="flex gap-1 flex-wrap">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              const activeElement = contentRefs.current[currentPage - 1]
                              if (activeElement) {
                                activeElement.focus()
                                document.execCommand('bold')
                              }
                            }}>
                              <strong>B</strong>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bold</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              const activeElement = contentRefs.current[currentPage - 1]
                              if (activeElement) {
                                activeElement.focus()
                                document.execCommand('italic')
                              }
                            }}>
                              <em>I</em>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Italic</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              const activeElement = contentRefs.current[currentPage - 1]
                              if (activeElement) {
                                activeElement.focus()
                                document.execCommand('underline')
                              }
                            }}>
                              <u>U</u>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Underline</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              const activeElement = contentRefs.current[currentPage - 1]
                              if (activeElement) {
                                activeElement.focus()
                                document.execCommand('strikeThrough')
                              }
                            }}>
                              <s>S</s>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Strikethrough</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {/* Alignment */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Alignment</label>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('justifyLeft')}>
                              ←
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Align Left</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('justifyCenter')}>
                              ↔
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Center</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('justifyRight')}>
                              →
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Align Right</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('justifyFull')}>
                              ⟷
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Justify</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {/* Lists */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Lists</label>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('insertUnorderedList')}>
                              •
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bullet List</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('insertOrderedList')}>
                              1.
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Numbered List</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('indent')}>
                              →|
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Indent</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('outdent')}>
                              |←
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Outdent</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {/* Font Size */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Font Size</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="8"
                        max="72"
                        defaultValue="14"
                        className="flex-1"
                        onChange={(e) => {
                          const size = e.target.value
                          document.execCommand('fontSize', false, '7')
                          const selection = window.getSelection()
                          if (selection?.rangeCount) {
                            const range = selection.getRangeAt(0)
                            const span = document.createElement('span')
                            span.style.fontSize = size + 'px'
                            try {
                              range.surroundContents(span)
                            } catch (e) {
                              span.appendChild(range.extractContents())
                              range.insertNode(span)
                            }
                          }
                        }}
                      />
                      <input
                        type="number"
                        min="8"
                        max="72"
                        defaultValue="14"
                        className="w-12 h-6 text-xs border rounded px-1"
                        onChange={(e) => {
                          const size = e.target.value
                          document.execCommand('fontSize', false, '7')
                          const selection = window.getSelection()
                          if (selection?.rangeCount) {
                            const range = selection.getRangeAt(0)
                            const span = document.createElement('span')
                            span.style.fontSize = size + 'px'
                            try {
                              range.surroundContents(span)
                            } catch (e) {
                              span.appendChild(range.extractContents())
                              range.insertNode(span)
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  

                  
                  {/* Page Breaks */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Page Breaks</label>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              document.execCommand('insertHTML', false, '<div style="page-break-before: always; border-top: 2px dashed #ccc; margin: 20px 0; padding-top: 20px; position: relative;"><span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: white; padding: 0 10px; font-size: 10px; color: #666;">Page Break</span></div>')
                            }}>
                              ⎯⎯
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Insert Page Break</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Actions</label>
                    <div className="flex gap-1 flex-wrap">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('removeFormat')}>
                              ✕
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Clear Formatting</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('selectAll')}>
                              ⌘A
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Select All</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => document.execCommand('copy')}>
                              📋
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
              

            </TabsContent>
            
            <TabsContent value="layers" className="p-4">
              <div className="space-y-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const pageElements = elements.filter(el => el.page === page)
                  return (
                    <div key={page} className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 py-1">
                        <span>Page {page}</span>
                        <span className="text-xs text-gray-500">({pageElements.length})</span>
                      </div>
                      {pageElements.length === 0 ? (
                        <p className="text-xs text-gray-400 ml-4">No elements</p>
                      ) : (
                        pageElements.map((element) => (
                          <div 
                            key={element.id}
                            className={`flex items-center justify-between p-2 ml-4 rounded border ${
                              selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                            onClick={() => {
                              setSelectedElement(element.id)
                              setCurrentPage(page)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {element.type === 'text' && <Type className="h-3 w-3" />}
                              {element.type === 'rectangle' && <Square className="h-3 w-3" />}
                              {element.type === 'signature' && <Square className="h-3 w-3" />}
                              {element.type === 'image' && <Image className="h-3 w-3" />}
                              {element.type === 'checkbox' && <Square className="h-3 w-3" />}
                              <span className="text-xs">
                                {element.type === 'text' ? (element.content || 'Text') : 
                                 element.type === 'signature' ? 'Signature' :
                                 element.type === 'image' ? 'Image' :
                                 element.type === 'checkbox' ? 'Checkbox' : 'Rectangle'}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteElement(element.id)
                              }}
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="pages" className="p-4 h-full flex flex-col">
              <div className="space-y-4">
                <div className="text-sm font-medium">Page Navigation</div>
                <div className="flex-1 overflow-y-auto p-2 max-h-96">
                  <div className="flex flex-wrap gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <div
                      key={page}
                      className={`w-20 h-24 border rounded cursor-pointer hover:bg-gray-50 bg-white ${
                        currentPage === page ? 'border-black border-2' : 'border-gray-300'
                      }`}
                      onClick={() => setCurrentPage(page)}
                      draggable
                      onDragStart={() => setDraggedPage(page)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggedPage && draggedPage !== page) {
                          console.log(`Move page ${draggedPage} to position ${page}`)
                        }
                        setDraggedPage(null)
                      }}
                    >
                      <div className="w-full h-full rounded relative overflow-hidden" style={{ transform: 'scale(0.08)', transformOrigin: 'top left', width: '794px', height: '1123px' }}>
                        {/* Page Content Preview */}
                        <div 
                          className="absolute bg-white p-1 text-xs overflow-hidden"
                          style={{
                            left: `${2.5 * 37.8}px`,
                            top: `${2.5 * 37.8}px`,
                            right: `${2.5 * 37.8}px`,
                            bottom: `${2.5 * 37.8}px`,
                            fontSize: '2px',
                            lineHeight: '1.2'
                          }}
                          dangerouslySetInnerHTML={{ __html: pageContents[page - 1] || '' }}
                        />
                        
                        {/* Elements Preview */}
                        {elements.filter(el => el.page === page).map((element) => (
                          <div
                            key={element.id}
                            className="absolute pointer-events-none"
                            style={{
                              left: element.x,
                              top: element.y,
                              width: element.width,
                              height: element.height,
                              backgroundColor: element.type === 'rectangle' ? 'transparent' : 
                                             element.type === 'signature' ? '#fff9c4' : 
                                             element.type === 'text' ? 'white' : 'transparent',
                              border: element.type === 'rectangle' ? '2px solid #333' :
                                     element.type === 'signature' ? '2px dashed #fbbf24' : 
                                     element.type === 'text' ? '1px solid #ccc' : 'none',
                              fontSize: element.type === 'text' ? '14px' : undefined
                            }}
                          >
                            {element.type === 'text' && (
                              <div className="p-1 text-xs overflow-hidden">{element.content}</div>
                            )}
                            {element.type === 'signature' && (
                              <div className="w-full h-full flex items-center justify-center text-xs text-yellow-700">Sig</div>
                            )}
                            {element.type === 'image' && element.imageUrl && (
                              <img src={element.imageUrl} alt="" className="w-full h-full object-cover" />
                            )}
                            {element.type === 'checkbox' && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-3 h-3 border border-gray-400"></div>
                              </div>
                            )}
                            {element.type === 'line' && (
                              <div className="w-full h-full bg-black"></div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-1 left-1 text-xs font-medium bg-black text-white px-1 rounded">
                        {page}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2">
                  <div className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTotalPages(prev => prev + 1)
                      setCurrentPage(totalPages + 1)
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Page
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-gray-200 overflow-auto">
          {/* Rulers */}
          <div className="relative">
            {/* Horizontal Ruler */}
            <div 
              className="absolute top-0 bg-white border-b border-gray-300 h-5 flex items-end" 
              style={{ 
                left: `${20 + (794 * (zoom / 100) - 794) / 2}px`,
                width: `${794 * (zoom / 100)}px`,
                zIndex: 10
              }}
            >
              {Array.from({ length: 210 }, (_, i) => (
                <div key={i} className="relative" style={{ width: `${794 * (zoom / 100) / 210}px` }}>
                  <div className={`absolute bottom-0 bg-gray-400 w-px ${
                    i % 10 === 0 ? 'h-3' : i % 5 === 0 ? 'h-2' : 'h-1'
                  }`}></div>
                  {i % 10 === 0 && (
                    <span className="absolute bottom-3 text-xs text-gray-600" style={{ fontSize: '8px', left: '2px' }}>
                      {i / 10}
                    </span>
                  )}
                </div>
              ))}
              
              {/* Left Margin */}
              <div 
                className="absolute bottom-0 w-2 h-4 bg-blue-500 cursor-ew-resize"
                style={{ left: `${(leftMargin / 21) * 794 * (zoom / 100)}px` }}
                onMouseDown={(e) => {
                  const startX = e.clientX
                  const startMargin = leftMargin
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX
                    const deltaCm = (deltaX / (794 * (zoom / 100))) * 21
                    const newMargin = Math.max(0, Math.min(10, startMargin + deltaCm))
                    setLeftMargin(newMargin)
                  }
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                title="Left Margin"
              />
              
              {/* Right Margin */}
              <div 
                className="absolute bottom-0 w-2 h-4 bg-blue-500 cursor-ew-resize"
                style={{ left: `${((21 - rightMargin) / 21) * 794 * (zoom / 100)}px` }}
                onMouseDown={(e) => {
                  const startX = e.clientX
                  const startMargin = rightMargin
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX
                    const deltaCm = (deltaX / (794 * (zoom / 100))) * 21
                    const newMargin = Math.max(0, Math.min(10, startMargin - deltaCm))
                    setRightMargin(newMargin)
                  }
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                title="Right Margin"
              />

            </div>

            
            {/* Vertical Ruler */}
            <div 
              className="absolute top-5 left-0 bg-white border-r border-gray-300 w-5 flex flex-col justify-start" 
              style={{ height: `${1123 * (zoom / 100)}px` }}
            >
              {Array.from({ length: 297 }, (_, i) => (
                <div key={i} className="relative" style={{ height: `${1123 * (zoom / 100) / 297}px` }}>
                  <div className={`absolute right-0 bg-gray-400 h-px ${
                    i % 10 === 0 ? 'w-3' : i % 5 === 0 ? 'w-2' : 'w-1'
                  }`}></div>
                  {i % 10 === 0 && (
                    <span className="absolute right-3 text-xs text-gray-600 transform -rotate-90" style={{ fontSize: '8px', top: '2px' }}>
                      {i / 10}
                    </span>
                  )}
                </div>
              ))}
              
              {/* Top Margin */}
              <div 
                className="absolute right-0 h-2 w-4 bg-blue-500 cursor-ns-resize"
                style={{ top: `${(topMargin / 29.7) * 1123 * (zoom / 100)}px` }}
                onMouseDown={(e) => {
                  const startY = e.clientY
                  const startMargin = topMargin
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaY = e.clientY - startY
                    const deltaCm = (deltaY / (1123 * (zoom / 100))) * 29.7
                    const newMargin = Math.max(0, Math.min(10, startMargin + deltaCm))
                    setTopMargin(newMargin)
                  }
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                title="Top Margin"
              />
              
              {/* Bottom Margin */}
              <div 
                className="absolute right-0 h-2 w-4 bg-blue-500 cursor-ns-resize"
                style={{ top: `${((29.7 - bottomMargin) / 29.7) * 1123 * (zoom / 100)}px` }}
                onMouseDown={(e) => {
                  const startY = e.clientY
                  const startMargin = bottomMargin
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaY = e.clientY - startY
                    const deltaCm = (deltaY / (1123 * (zoom / 100))) * 29.7
                    const newMargin = Math.max(0, Math.min(10, startMargin - deltaCm))
                    setBottomMargin(newMargin)
                  }
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                title="Bottom Margin"
              />

            </div>
            
            {/* Corner */}
            <div className="absolute top-0 left-0 w-5 h-5 bg-gray-100 border-r border-b border-gray-300"></div>
          </div>
          
          {/* All Pages Stacked Vertically */}
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <div key={pageIndex} className="mb-8 first:mt-8">
              <div 
                ref={pageIndex === 0 ? canvasRef : undefined}
                className={`bg-white shadow-lg mx-auto relative border-2 ${
                  currentPage === pageIndex + 1 ? 'border-blue-500' : 'border-gray-300'
                }`}
                style={{ 
                  width: '794px', 
                  height: '1123px',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  marginLeft: '20px'
                }}
                onClick={() => setCurrentPage(pageIndex + 1)}
              >
                {/* Page Number */}
                <div className="absolute -top-8 left-0 text-sm text-gray-600 bg-white px-2 py-1 rounded shadow">
                  Page {pageIndex + 1}
                </div>

            
                {/* Document Content Area */}
                <textarea
                  className="absolute border border-gray-200 rounded p-4 cursor-text bg-gray-50 resize-none"
                  value={pageContents[pageIndex] || ''}
                  onChange={(e) => {
                    if (currentPage === pageIndex + 1) {
                      const newPageContents = [...pageContents]
                      newPageContents[pageIndex] = e.target.value
                      setPageContents(newPageContents)
                    }
                  }}
                  onDrop={currentPage === pageIndex + 1 ? handleCanvasDrop : undefined}
                  onDragOver={currentPage === pageIndex + 1 ? handleCanvasDragOver : undefined}
                  style={{
                    left: `${leftMargin * 37.8}px`,
                    top: `${topMargin * 37.8}px`,
                    right: `${rightMargin * 37.8}px`,
                    bottom: `${bottomMargin * 37.8}px`,
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: 'Arial, sans-serif',
                    outline: 'none',
                    overflow: 'hidden',
                    border: 'none',
                    background: 'transparent'
                  }}
                  disabled={currentPage !== pageIndex + 1}
                />

            
                {/* Elements for this page */}
                {elements.filter(el => el.page === pageIndex + 1).map((element) => (
              <div
                key={element.id}
                className={`absolute border-2 ${
                  selectedElement === element.id 
                    ? 'border-blue-500 border-dashed' 
                    : 'border-transparent hover:border-gray-400'
                }`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  backgroundColor: element.type === 'rectangle' ? 'transparent' : 
                                 element.type === 'signature' ? '#fff9c4' : 'white',
                  border: element.type === 'rectangle' ? '2px solid #333' :
                         element.type === 'signature' ? '2px dashed #fbbf24' : '1px solid #ccc'
                }}
                onClick={() => setSelectedElement(element.id)}
              >
                {element.type === 'text' && (
                  <div 
                    className="w-full h-full p-2 outline-none overflow-hidden"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newContent = e.currentTarget.textContent || ''
                      setElements(prev => prev.map(el => 
                        el.id === element.id ? { ...el, content: newContent } : el
                      ))
                    }}
                    style={{ fontSize: '14px', fontFamily: 'Arial' }}
                  >
                    {element.content}
                  </div>
                )}
                {element.type === 'signature' && (
                  <div className="w-full h-full flex items-center justify-center text-xs text-yellow-700">
                    Signature
                  </div>
                )}
                {element.type === 'image' && (
                  <div className="w-full h-full relative overflow-hidden">
                    {element.imageUrl ? (
                      <img 
                        src={element.imageUrl} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
                        <Image className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Click to upload</span>
                      </div>
                    )}
                  </div>
                )}
                {element.type === 'checkbox' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={element.checked || false}
                      onChange={(e) => {
                        const newElements = elements.map(el => 
                          el.id === element.id ? { ...el, checked: e.target.checked } : el
                        )
                        setElements(newElements)
                        saveToHistory(newElements)
                      }}
                      className="w-4 h-4"
                    />
                  </div>
                )}
                
                {/* Action buttons for selected element */}
                {selectedElement === element.id && (
                  <>
                    <button
                      className="absolute w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      style={{
                        top: element.y < 10 ? '2px' : '-8px',
                        right: element.x + element.width > 784 ? '2px' : '-8px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteElement(element.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {element.type === 'image' && !element.imageUrl && (
                      <button
                        className="absolute w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                        style={{
                          top: element.y < 10 ? '2px' : '-8px',
                          left: element.x < 10 ? '2px' : '-8px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          imageInputRef.current?.click()
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                    <div 
                      className="absolute w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center cursor-move"
                      style={{
                        top: element.y < 10 ? '2px' : '-8px',
                        left: element.x < 40 ? '34px' : '-32px'
                      }}
                      onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                    >
                      <Move className="h-3 w-3" />
                    </div>
                  </>
                )}
              </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Page Navigator */}
      <div className="border-t p-2 bg-white flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          ←
        </Button>
        <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          →
        </Button>
        <div className="w-px h-4 bg-gray-300 mx-2" />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setTotalPages(prev => prev + 1)
            setCurrentPage(totalPages + 1)
          }}
        >
          + Add Page
        </Button>
      </div>
      
      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>PDF Preview - {templateData.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-[600px] bg-white border rounded-lg p-6 overflow-auto">
            <div className="text-center">
              <p className="text-lg font-medium mb-4">{templateData.name}</p>
              <p className="text-sm text-gray-600">Canvas preview would render here</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Print/Save as PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}