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
        <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto max-h-screen">
          {/* Quick Templates */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                const template = `# EQUIPMENT LEASE AGREEMENT\n\n**Agreement Number:** [AGREEMENT-001]\n**Date:** [DATE]\n**Lessor:** [COMPANY NAME]\n**Address:** [COMPANY ADDRESS]\n**Phone:** [PHONE] | **Email:** [EMAIL]\n\n**Lessee:** [CLIENT NAME]\n**Address:** [CLIENT ADDRESS]\n**Phone:** [CLIENT PHONE] | **Email:** [CLIENT EMAIL]\n\n## EQUIPMENT DETAILS\n\n**Equipment Type:** [EQUIPMENT TYPE]\n**Make/Model:** [MAKE/MODEL]\n**Serial Number:** [SERIAL NUMBER]\n**Year:** [YEAR]\n**Condition:** [NEW/USED/REFURBISHED]\n**Current Value:** $[VALUE]\n\n## LEASE TERMS\n\n**Lease Period:** [DURATION] months\n**Start Date:** [START DATE]\n**End Date:** [END DATE]\n**Monthly Payment:** $[MONTHLY AMOUNT]\n**Security Deposit:** $[DEPOSIT AMOUNT]\n**Late Fee:** $[LATE FEE] (after [GRACE PERIOD] days)\n\n--- PAGE BREAK ---\n\n## RESPONSIBILITIES\n\n### Lessor Responsibilities:\n• Deliver equipment in working condition\n• Provide necessary documentation\n• Maintain insurance on equipment\n• Handle major repairs (over $[AMOUNT])\n\n### Lessee Responsibilities:\n• Use equipment properly and safely\n• Perform routine maintenance\n• Pay monthly fees on time\n• Return equipment in good condition\n• Notify lessor of any damage immediately\n\n## INSURANCE & LIABILITY\n\n• Lessee must maintain comprehensive insurance\n• Minimum coverage: $[INSURANCE AMOUNT]\n• Lessor must be named as additional insured\n• Lessee liable for theft, damage, or loss\n\n## TERMINATION\n\n• Either party may terminate with [NOTICE PERIOD] days notice\n• Early termination fee: $[TERMINATION FEE]\n• Equipment must be returned within [RETURN DAYS] days\n\n--- PAGE BREAK ---\n\n## SIGNATURES\n\n**LESSOR:**\n\nSignature: ___________________________ Date: __________\nPrint Name: [LESSOR NAME]\nTitle: [TITLE]\n\n**LESSEE:**\n\nSignature: ___________________________ Date: __________\nPrint Name: [LESSEE NAME]\nTitle: [TITLE]\n\n**WITNESS:**\n\nSignature: ___________________________ Date: __________\nPrint Name: [WITNESS NAME]\n\n*This agreement is governed by the laws of [STATE/PROVINCE]*`
                setContent(template)
              }}>
                📋 Equipment Lease Agreement
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                const template = `# MAINTENANCE SERVICE REPORT\n\n**Report #:** [REPORT-001]\n**Date:** [DATE]\n**Time:** [START TIME] - [END TIME]\n**Technician:** [TECHNICIAN NAME]\n**Supervisor:** [SUPERVISOR NAME]\n\n## CUSTOMER INFORMATION\n\n**Company:** [CUSTOMER NAME]\n**Contact:** [CONTACT PERSON]\n**Phone:** [PHONE NUMBER]\n**Location:** [SERVICE ADDRESS]\n\n## EQUIPMENT DETAILS\n\n**Equipment:** [EQUIPMENT TYPE]\n**Make/Model:** [MAKE/MODEL]\n**Serial Number:** [SERIAL NUMBER]\n**Hours/Mileage:** [CURRENT HOURS]\n**Last Service:** [LAST SERVICE DATE]\n\n--- PAGE BREAK ---\n\n## WORK PERFORMED\n\n### Scheduled Maintenance:\n• [✓] Oil change and filter replacement\n• [✓] Hydraulic fluid check and top-off\n• [✓] Grease all fittings (12 points)\n• [✓] Visual inspection of belts and hoses\n• [✓] Battery and electrical system check\n• [✓] Tire pressure and condition check\n• [✓] Safety system inspection\n\n### Additional Services:\n• [ADDITIONAL SERVICE 1]\n• [ADDITIONAL SERVICE 2]\n• [ADDITIONAL SERVICE 3]\n\n### Issues Found:\n• [ISSUE 1 - DESCRIPTION]\n• [ISSUE 2 - DESCRIPTION]\n• [ISSUE 3 - DESCRIPTION]\n\n## PARTS & MATERIALS USED\n\n| Part Number | Description | Quantity | Unit Cost | Total |\n|-------------|-------------|----------|-----------|-------|\n| [PART-001] | [Oil Filter] | [2] | $[25.00] | $[50.00] |\n| [PART-002] | [Hydraulic Oil] | [5 gal] | $[15.00] | $[75.00] |\n| [PART-003] | [Grease] | [1 tube] | $[8.00] | $[8.00] |\n\n**Parts Subtotal:** $[133.00]\n**Labor Hours:** [3.5] @ $[85.00]/hr = $[297.50]\n**Tax:** $[21.58]\n**TOTAL:** $[452.08]\n\n--- PAGE BREAK ---\n\n## RECOMMENDATIONS\n\n### Immediate Action Required:\n• [URGENT ITEM 1]\n• [URGENT ITEM 2]\n\n### Recommended Within 30 Days:\n• [RECOMMENDATION 1]\n• [RECOMMENDATION 2]\n\n### Future Maintenance (Next 6 Months):\n• [FUTURE ITEM 1]\n• [FUTURE ITEM 2]\n\n## CUSTOMER FEEDBACK\n\n**Equipment Condition:** [EXCELLENT/GOOD/FAIR/POOR]\n**Service Quality:** [RATING 1-10]\n**Comments:** [CUSTOMER COMMENTS]\n\n## SIGNATURES\n\n**Technician:** _________________________ Date: _______\n[TECHNICIAN NAME]\n\n**Customer:** _________________________ Date: _______\n[CUSTOMER NAME]\n\n**Next Service Due:** [DATE] or [HOURS] hours\n**Service Interval:** [FREQUENCY]`
                setContent(template)
              }}>
                🔧 Maintenance Service Report
              </Button>
            </CardContent>
          </Card>

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