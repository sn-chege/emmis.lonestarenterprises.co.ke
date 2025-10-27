"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MaintenanceTemplate } from "@/lib/types"
import { Eye, Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface TemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: MaintenanceTemplate[]
  onTemplatesChange: (templates: MaintenanceTemplate[]) => void
}

export function TemplatesModal({ open, onOpenChange, templates, onTemplatesChange }: TemplatesModalProps) {
  const { toast } = useToast()
  const [viewTemplate, setViewTemplate] = useState<MaintenanceTemplate | null>(null)

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      onTemplatesChange(templates.filter((t) => t.id !== id))
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully.",
      })
    }
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      service: "default",
      repair: "destructive",
      preventive: "secondary",
      emergency: "destructive",
    }
    return variants[type] || "default"
  }

  if (viewTemplate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewTemplate.name}</DialogTitle>
            <DialogDescription>{viewTemplate.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant={getTypeBadge(viewTemplate.type)}>{viewTemplate.type}</Badge>
              <Badge variant="secondary">{viewTemplate.estimatedDuration} hours</Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Checklist ({viewTemplate.checklist.length} steps)</h4>
              <ul className="space-y-2">
                {viewTemplate.checklist.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {viewTemplate.notes && (
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-muted-foreground">{viewTemplate.notes}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTemplate(null)}>
              Back to Templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Maintenance Templates</DialogTitle>
          <DialogDescription>Pre-configured maintenance procedures and checklists</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Templates ({templates.length})</CardTitle>
              <CardDescription>Use these templates to quickly schedule maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <h4 className="font-semibold text-lg">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex gap-2">
                          <Badge variant={getTypeBadge(template.type)}>{template.type}</Badge>
                          <Badge variant="secondary">{template.checklist.length} Steps</Badge>
                          <Badge variant="secondary">{template.estimatedDuration} hours</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewTemplate(template)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
