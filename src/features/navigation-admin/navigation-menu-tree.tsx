import { Minus, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import type { NavigationTreeNode } from "@/types/navigation-admin"
import { cn } from "@/lib/utils"

type NavigationMenuTreeProps = {
  nodes: NavigationTreeNode[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
  defaultExpandedIds?: string[]
}

const INDENT_PX = 18

type TreeNodeProps = {
  node: NavigationTreeNode
  selectedId: string
  expandedIds: Set<string>
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  depth?: number
}

function TreeNode({
  node,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  depth = 0,
}: TreeNodeProps) {
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id

  return (
    <div className="select-none">
      <div
        className="flex min-h-8 items-center gap-1"
        style={{ paddingLeft: `${depth * INDENT_PX}px` }}
      >
        {hasChildren ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-6 shrink-0 rounded-sm"
            onClick={() => onToggle(node.id)}
            aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
          >
            {isExpanded ? (
              <Minus className="size-3.5" />
            ) : (
              <Plus className="size-3.5" />
            )}
          </Button>
        ) : (
          <span aria-hidden className="size-6 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={cn(
            "min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors",
            isSelected
              ? "bg-primary/12 font-medium text-primary ring-1 ring-primary/20"
              : "text-foreground hover:bg-muted/60"
          )}
        >
          {node.label}
        </button>
      </div>

      {hasChildren && isExpanded ? (
        <div className="relative ml-3 border-l border-border/70">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function NavigationMenuTree({
  nodes,
  selectedId,
  onSelect,
  className,
  defaultExpandedIds = ["venue-manager", "defaults"],
}: NavigationMenuTreeProps) {
  const initialExpanded = useMemo(
    () => new Set(defaultExpandedIds),
    [defaultExpandedIds]
  )
  const [expandedIds, setExpandedIds] = useState(initialExpanded)

  function toggleExpanded(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-background", className)}>
      <div className="border-b bg-muted/50 px-3 py-2">
        <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
          Display Text
        </span>
      </div>

      <div className="calendar-thin-scrollbar max-h-[32rem] overflow-y-auto p-2">
        <div className="space-y-0.5">
          {nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={toggleExpanded}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function findLabel(nodes: NavigationTreeNode[], id: string): string | null {
  for (const node of nodes) {
    if (node.id === id) return node.label
    if (node.children) {
      const found = findLabel(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function findNavigationMenuLabel(
  nodes: NavigationTreeNode[],
  id: string
): string {
  return findLabel(nodes, id) ?? id
}
