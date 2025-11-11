"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreateTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTemplateModal({ open, onOpenChange }: CreateTemplateModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateFromScratch = () => {
    onOpenChange(false)
    router.push('/leases/contract-templates/edit/new')
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Choose how you want to create your contract template
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button 
            className="w-full h-20 flex-col gap-2" 
            variant="outline"
            onClick={handleCreateFromScratch}
          >
            <FileText className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Create Template</div>
              <div className="text-xs text-muted-foreground">Build a custom contract template</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}