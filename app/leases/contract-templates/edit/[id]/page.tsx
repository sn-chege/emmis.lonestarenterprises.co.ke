"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { FabricPDFEditor } from "@/components/leases/fabric-pdf-editor"
import { useNotifications } from "@/components/notification-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Monitor } from "lucide-react"

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const { notifySuccess, notifyError } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [templateData, setTemplateData] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileError, setShowMobileError] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setShowMobileError(true)
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    const loadTemplate = async () => {
      try {
        const templateId = params.id as string
        
        if (templateId === 'new') {
          setTemplateData({
            id: 'new',
            name: 'New Contract Template',
            type: 'PDF',
            description: '',
            isNew: true
          })
        } else if (templateId === 'import') {
          const uploadedPDF = sessionStorage.getItem('uploadedPDF')
          console.log('Uploaded PDF data:', uploadedPDF)
          if (uploadedPDF) {
            try {
              const pdfData = JSON.parse(uploadedPDF)
              setTemplateData({
                id: 'import',
                name: pdfData.name || 'Imported PDF Template',
                type: 'PDF',
                description: '',
                isImport: true,
                pdfData
              })
              // Don't remove from sessionStorage immediately
            } catch (parseError) {
              console.error('Failed to parse PDF data:', parseError)
              router.push('/leases/contract-templates')
              return
            }
          } else {
            console.log('No uploaded PDF found in sessionStorage')
            router.push('/leases/contract-templates')
            return
          }
        } else {
          // Load existing template
          const response = await fetch(`/api/contracts/templates/${templateId}`)
          if (response.ok) {
            const template = await response.json()
            setTemplateData({
              id: template.id,
              name: template.name,
              type: template.type,
              description: template.description || '',
              elements: template.elements ? JSON.parse(template.elements) : [],
              isExisting: true
            })
          } else {
            throw new Error('Template not found')
          }
        }
      } catch (error) {
        notifyError("Error", "Failed to load template")
        router.push('/leases/contract-templates')
      } finally {
        setLoading(false)
      }
    }

    loadTemplate()
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [params.id, router, notifyError])

  const handleSave = async (data: any) => {
    try {
      const templateId = params.id as string
      console.log('Saving template:', { templateId, data })
      
      if (templateId === 'new' || templateId === 'import') {
        // Create new template
        const payload = {
          name: data.name || 'Untitled Template',
          description: data.description || '',
          type: data.pdfFile ? 'PDF' : 'CUSTOM',
          elements: data.elements || []
        }
        console.log('POST payload:', payload)
        
        const response = await fetch('/api/contracts/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        const responseData = await response.json()
        console.log('POST response:', { status: response.status, data: responseData })
        
        if (!response.ok) {
          throw new Error(responseData.error || `HTTP ${response.status}: Failed to create template`)
        }
        
        notifySuccess("Template Created", `Template "${data.name}" (${responseData.id}) has been created successfully.`)
      } else {
        // Update existing template
        const payload = {
          name: data.name || 'Untitled Template',
          description: data.description || '',
          elements: data.elements || []
        }
        console.log('PUT payload:', payload)
        
        const response = await fetch(`/api/contracts/templates/${templateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        const responseData = await response.json()
        console.log('PUT response:', { status: response.status, data: responseData })
        
        if (!response.ok) {
          throw new Error(responseData.error || `HTTP ${response.status}: Failed to update template`)
        }
        
        notifySuccess("Template Updated", `Template "${data.name}" has been updated successfully.`)
      }
      
      router.push('/leases/contract-templates')
    } catch (error) {
      console.error('Save template error:', error)
      notifyError("Save Failed", error instanceof Error ? error.message : "Failed to update template.")
    }
  }

  const handleCancel = () => {
    router.push('/leases/contract-templates')
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center">Loading template editor...</div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <FabricPDFEditor
        templateId={templateData?.id}
        templateName={templateData?.name}
        initialElements={templateData?.elements}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      
      <Dialog open={showMobileError} onOpenChange={() => router.push('/leases/contract-templates')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Desktop Required
            </DialogTitle>
            <DialogDescription>
              The contract template editor is only available on desktop devices. Please use a larger screen to access this feature.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => router.push('/leases/contract-templates')}>
              Go Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  )
}