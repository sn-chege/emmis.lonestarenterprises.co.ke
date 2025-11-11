"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface SLATerm {
  id: string
  category: string
  metric: string
  target: string
  measurement: string
  penalty: string
}

interface SLAData {
  id?: string
  name: string
  description: string
  customerId: string
  customerName: string
  serviceLevel: 'basic' | 'standard' | 'premium' | 'enterprise'
  responseTime: string
  resolutionTime: string
  availability: string
  penalties: string
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired' | 'pending'
  terms: SLATerm[]
}

interface SLAModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view"
  sla: SLAData | null
  onSave: (data: Partial<SLAData>) => Promise<void>
}

export function SLAModal({ open, onOpenChange, mode, sla, onSave }: SLAModalProps) {
  const [formData, setFormData] = useState<Partial<SLAData>>({
    terms: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (sla && (mode === "edit" || mode === "view")) {
      setFormData(sla)
    } else {
      setFormData({
        serviceLevel: "standard",
        status: "pending",
        terms: []
      })
    }
  }, [sla, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTerm = () => {
    const newTerm: SLATerm = {
      id: `term_${Date.now()}`,
      category: '',
      metric: '',
      target: '',
      measurement: '',
      penalty: ''
    }
    setFormData(prev => ({
      ...prev,
      terms: [...(prev.terms || []), newTerm]
    }))
  }

  const removeTerm = (termId: string) => {
    setFormData(prev => ({
      ...prev,
      terms: (prev.terms || []).filter(term => term.id !== termId)
    }))
  }

  const updateTerm = (termId: string, field: keyof SLATerm, value: string) => {
    setFormData(prev => ({
      ...prev,
      terms: (prev.terms || []).map(term =>
        term.id === termId ? { ...term, [field]: value } : term
      )
    }))
  }

  const isViewMode = mode === "view"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && "Create New SLA"}
            {mode === "edit" && `Edit SLA: ${sla?.id}`}
            {mode === "view" && `SLA Details - ${sla?.id}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SLA Name</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isViewMode}
                required
              />
            </div>
            <div>
              <Label>Service Level</Label>
              <Select
                value={formData.serviceLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, serviceLevel: value as any }))}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isViewMode}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Response Time</Label>
              <Input
                value={formData.responseTime || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, responseTime: e.target.value }))}
                disabled={isViewMode}
                placeholder="e.g., 2 hours"
              />
            </div>
            <div>
              <Label>Resolution Time</Label>
              <Input
                value={formData.resolutionTime || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, resolutionTime: e.target.value }))}
                disabled={isViewMode}
                placeholder="e.g., 24 hours"
              />
            </div>
            <div>
              <Label>Availability</Label>
              <Input
                value={formData.availability || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                disabled={isViewMode}
                placeholder="e.g., 99.9%"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                disabled={isViewMode}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                disabled={isViewMode}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>SLA Terms</Label>
              {!isViewMode && (
                <Button type="button" variant="outline" size="sm" onClick={addTerm}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Term
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {(formData.terms || []).map((term) => (
                <div key={term.id} className="border p-4 rounded-lg">
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    <Input
                      placeholder="Category"
                      value={term.category}
                      onChange={(e) => updateTerm(term.id, 'category', e.target.value)}
                      disabled={isViewMode}
                    />
                    <Input
                      placeholder="Metric"
                      value={term.metric}
                      onChange={(e) => updateTerm(term.id, 'metric', e.target.value)}
                      disabled={isViewMode}
                    />
                    <Input
                      placeholder="Target"
                      value={term.target}
                      onChange={(e) => updateTerm(term.id, 'target', e.target.value)}
                      disabled={isViewMode}
                    />
                    <Input
                      placeholder="Measurement"
                      value={term.measurement}
                      onChange={(e) => updateTerm(term.id, 'measurement', e.target.value)}
                      disabled={isViewMode}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Penalty"
                        value={term.penalty}
                        onChange={(e) => updateTerm(term.id, 'penalty', e.target.value)}
                        disabled={isViewMode}
                      />
                      {!isViewMode && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTerm(term.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isViewMode && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save SLA'}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}