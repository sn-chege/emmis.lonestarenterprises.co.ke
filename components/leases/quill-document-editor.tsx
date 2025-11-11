"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Save, Download, Eye, ArrowLeft, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

interface QuillDocumentEditorProps {
  templateName?: string
  onSave?: (data: any) => void
  onCancel?: () => void
}

export function QuillDocumentEditor({ templateName, onSave, onCancel }: QuillDocumentEditorProps) {
  const [content, setContent] = useState('')
  const [name, setName] = useState(templateName || 'New Document Template')
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertPageBreak = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + '\n\n--- PAGE BREAK ---\n\n' + content.substring(end)
      setContent(newContent)
      
      // Set cursor position after page break
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 23
        textarea.focus()
      }, 0)
    }
  }

  const handleSave = () => {
    onSave?.({
      name,
      content,
      type: 'QUILL_DOCUMENT',
      lastModified: new Date().toISOString()
    })
  }

  const handlePreview = () => {
    setIsPreview(!isPreview)
  }

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page {
            size: A4;
            margin: 2.5cm;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            white-space: pre-wrap;
          }
          .page-break {
            page-break-before: always;
            border-top: 1px dashed #ccc;
            margin: 20px 0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        ${content.replace(/--- PAGE BREAK ---/g, '<div class="page-break"></div>')}
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (isPreview) {
    return (
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Preview Header */}
        <div className="border-b p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setIsPreview(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <h1 className="text-xl font-semibold">{name} - Preview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              Print/PDF
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div 
              className="bg-white shadow-lg p-16 min-h-[297mm]"
              style={{ 
                width: '210mm',
                fontFamily: 'Times New Roman, serif',
                fontSize: '12pt',
                lineHeight: '1.6'
              }}
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>').replace(/--- PAGE BREAK ---/g, '<div style="page-break-before: always; border-top: 2px dashed #ccc; margin: 20px 0; padding: 10px; text-align: center; color: #666;">Page Break</div>') }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Editor Header */}
      <div className="border-b p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-64"
            placeholder="Document name"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" />
            Print/PDF
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 bg-gray-100 p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                {/* Toolbar */}
                <div className="border-b pb-3 mb-3 flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={insertPageBreak}>
                    Page Break
                  </Button>
                  <div className="text-xs text-gray-500 flex items-center ml-auto">
                    Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline
                  </div>
                </div>
                
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault()
                    const pastedText = e.clipboardData.getData('text')
                    const textarea = textareaRef.current
                    if (textarea && pastedText) {
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      
                      // Split text into chunks of approximately 3000 characters (about 1 page)
                      const chunkSize = 3000
                      const chunks = []
                      
                      for (let i = 0; i < pastedText.length; i += chunkSize) {
                        chunks.push(pastedText.substring(i, i + chunkSize))
                      }
                      
                      // Join chunks with page breaks
                      const textWithPageBreaks = chunks.join('\n\n--- PAGE BREAK ---\n\n')
                      
                      const newContent = content.substring(0, start) + textWithPageBreaks + content.substring(end)
                      setContent(newContent)
                    }
                  }}
                  placeholder="Start writing your document...\n\nUse keyboard shortcuts:\nCtrl+B = Bold\nCtrl+I = Italic\nCtrl+U = Underline\n\nType '--- PAGE BREAK ---' or use the button above to add page breaks."
                  className="min-h-[600px] resize-none border-0 focus:ring-0 text-base leading-relaxed"
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '12pt',
                    lineHeight: '1.6'
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar with Editing Tools */}
        <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
          {/* Text Formatting */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Text Formatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Style</label>
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => {
                    const textarea = textareaRef.current
                    if (textarea) {
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const selectedText = content.substring(start, end)
                      if (selectedText) {
                        const newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end)
                        setContent(newContent)
                      }
                    }
                  }}>
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const textarea = textareaRef.current
                    if (textarea) {
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const selectedText = content.substring(start, end)
                      if (selectedText) {
                        const newContent = content.substring(0, start) + `*${selectedText}*` + content.substring(end)
                        setContent(newContent)
                      }
                    }
                  }}>
                    <Italic className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const textarea = textareaRef.current
                    if (textarea) {
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const selectedText = content.substring(start, end)
                      if (selectedText) {
                        const newContent = content.substring(0, start) + `_${selectedText}_` + content.substring(end)
                        setContent(newContent)
                      }
                    }
                  }}>
                    <Underline className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block">Headers</label>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map(level => (
                    <Button key={level} size="sm" variant="outline" onClick={() => {
                      const textarea = textareaRef.current
                      if (textarea) {
                        const start = textarea.selectionStart
                        const end = textarea.selectionEnd
                        const selectedText = content.substring(start, end) || `Heading ${level}`
                        const hashes = '#'.repeat(level)
                        const newContent = content.substring(0, start) + `${hashes} ${selectedText}\n` + content.substring(end)
                        setContent(newContent)
                      }
                    }}>
                      H{level}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Lists</label>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => {
                    const textarea = textareaRef.current
                    if (textarea) {
                      const start = textarea.selectionStart
                      const newContent = content.substring(0, start) + '• List item\n' + content.substring(start)
                      setContent(newContent)
                    }
                  }}>
                    • List
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const textarea = textareaRef.current
                    if (textarea) {
                      const start = textarea.selectionStart
                      const newContent = content.substring(0, start) + '1. Numbered item\n' + content.substring(start)
                      setContent(newContent)
                    }
                  }}>
                    1. Numbered
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insert Elements */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Insert Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={insertPageBreak}>
                📄 Page Break
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                const textarea = textareaRef.current
                if (textarea) {
                  const start = textarea.selectionStart
                  const newContent = content.substring(0, start) + '\n\n---\n\n' + content.substring(start)
                  setContent(newContent)
                }
              }}>
                ➖ Horizontal Line
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                const textarea = textareaRef.current
                if (textarea) {
                  const start = textarea.selectionStart
                  const table = '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n'
                  const newContent = content.substring(0, start) + table + content.substring(start)
                  setContent(newContent)
                }
              }}>
                📊 Table
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                const textarea = textareaRef.current
                if (textarea) {
                  const start = textarea.selectionStart
                  const newContent = content.substring(0, start) + '\n> This is a quote or important note\n\n' + content.substring(start)
                  setContent(newContent)
                }
              }}>
                💬 Quote Block
              </Button>
            </CardContent>
          </Card>

          {/* Document Templates */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                const template = `# EQUIPMENT LEASE AGREEMENT\n\n**Date:** [DATE]\n**Lessor:** [COMPANY NAME]\n**Lessee:** [CLIENT NAME]\n\n## Terms and Conditions\n\n1. **Equipment Description**\n   - Item: [EQUIPMENT]\n   - Serial Number: [SERIAL]\n   - Condition: [CONDITION]\n\n2. **Lease Period**\n   - Start Date: [START DATE]\n   - End Date: [END DATE]\n   - Duration: [DURATION]\n\n3. **Payment Terms**\n   - Monthly Rate: $[AMOUNT]\n   - Payment Due: [DUE DATE]\n   - Late Fee: [LATE FEE]\n\n--- PAGE BREAK ---\n\n## Signatures\n\n**Lessor Signature:** _________________________ Date: _______\n\n**Lessee Signature:** _________________________ Date: _______\n\n`
                setContent(template)
              }}>
                📋 Lease Agreement
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                const template = `# MAINTENANCE REPORT\n\n**Date:** [DATE]\n**Technician:** [NAME]\n**Equipment:** [EQUIPMENT]\n\n## Work Performed\n\n• [TASK 1]\n• [TASK 2]\n• [TASK 3]\n\n## Parts Used\n\n| Part | Quantity | Cost |\n|------|----------|------|\n| [PART 1] | [QTY] | $[COST] |\n| [PART 2] | [QTY] | $[COST] |\n\n**Total Cost:** $[TOTAL]\n\n## Notes\n\n[ADDITIONAL NOTES]\n\n**Signature:** _________________________ Date: _______\n`
                setContent(template)
              }}>
                🔧 Maintenance Report
              </Button>
            </CardContent>
          </Card>

          {/* Document Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Document Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Characters:</span>
                <span>{content.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Words:</span>
                <span>{content.split(/\s+/).filter(w => w.length > 0).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Lines:</span>
                <span>{content.split('\n').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Page Breaks:</span>
                <span>{(content.match(/--- PAGE BREAK ---/g) || []).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}