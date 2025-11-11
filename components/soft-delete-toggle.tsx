"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2, Eye } from "lucide-react"

interface SoftDeleteToggleProps {
  showDeleted: boolean
  onToggle: (showDeleted: boolean) => void
  deletedCount?: number
  userRole?: string
}

export function SoftDeleteToggle({ showDeleted, onToggle, deletedCount, userRole }: SoftDeleteToggleProps) {
  // Only show for admin users
  if (userRole !== 'admin') {
    return null
  }

  return (
    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border">
      <div className="flex items-center space-x-2">
        {showDeleted ? (
          <Trash2 className="h-4 w-4 text-red-500" />
        ) : (
          <Eye className="h-4 w-4 text-green-500" />
        )}
        <Label htmlFor="show-deleted" className="text-sm font-medium">
          {showDeleted ? "Showing Deleted" : "Showing Active"}
          {deletedCount !== undefined && showDeleted && (
            <span className="ml-1 text-xs text-muted-foreground">({deletedCount})</span>
          )}
        </Label>
      </div>
      <Switch
        id="show-deleted"
        checked={showDeleted}
        onCheckedChange={onToggle}
      />
    </div>
  )
}