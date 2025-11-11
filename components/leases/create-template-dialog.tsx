"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/components/notification-provider"

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
  const router = useRouter()
  const { notifySuccess, notifyError } = useNotifications()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      notifyError("Validation Error", "Template name is required")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/contracts/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          type: 'CUSTOM',
          elements: []
        })
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create template')
      }

      notifySuccess("Template Created", `Template "${name}" has been created successfully.`)
      onOpenChange(false)
      router.push(`/leases/contract-templates/edit/${responseData.id}`)
    } catch (error) {
      console.error('Create template error:', error)
      notifyError("Creation Failed", error instanceof Error ? error.message : "Failed to create template")
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create a new contract template with a name and description.
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
              disabled={isCreating}
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
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}