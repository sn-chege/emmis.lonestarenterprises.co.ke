"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { QuillDocumentEditor } from "@/components/leases/quill-document-editor"
import { useNotifications } from "@/components/notification-provider"

export default function EditorV2Page() {
  const router = useRouter()
  const { notifySuccess, notifyError } = useNotifications()

  const handleSave = async (data: any) => {
    try {
      const response = await fetch('/api/contracts/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: 'Created with Quill Editor V2',
          type: 'QUILL_DOCUMENT',
          elements: [{ type: 'content', data: data.content }]
        })
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save document')
      }

      notifySuccess("Document Saved", `Document "${data.name}" has been saved successfully.`)
      router.push('/leases/contract-templates')
    } catch (error) {
      console.error('Save document error:', error)
      notifyError("Save Failed", error instanceof Error ? error.message : "Failed to save document")
    }
  }

  const handleCancel = () => {
    router.push('/leases/contract-templates')
  }

  return (
    <ProtectedLayout>
      <QuillDocumentEditor
        templateName="New Document Template V2"
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </ProtectedLayout>
  )
}