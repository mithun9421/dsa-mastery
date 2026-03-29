'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SearchBar } from '@/components/ui/SearchBar'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface SidebarProps {
  tabId: string
  categories: Category[]
}

export function Sidebar({ tabId, categories }: SidebarProps) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const cat of categories) {
      initial[cat.id] = true
    }
    return initial
  })

  const filtered = useMemo(() => {
    if (!search) return categories
    const q = search.toLowerCase()
    return categories
      .map((cat) => ({
        ...cat,
        concepts: cat.concepts.filter(
          (c) =>
            c.title?.toLowerCase().includes(q) ||
            (c.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
            c.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.concepts.length > 0)
  }, [categories, search])

  const toggleCategory = (catId: string) => {
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }))
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r border-[#1f1f1f] lg:block">
      <div className="p-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter concepts..." />
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-1 p-3 pt-0">
          {filtered.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-[#ccc] hover:bg-[#1a1a1a]"
              >
                {expanded[cat.id] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-[#666]" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-[#666]" />
                )}
                {cat.title ?? ""}
                <span className="ml-auto text-xs text-[#555]">{cat.concepts.length}</span>
              </button>
              {expanded[cat.id] && (
                <div className="ml-4 space-y-0.5 border-l border-[#1f1f1f] pl-2">
                  {cat.concepts.map((concept) => {
                    const href = `/${tabId}/${cat.id}/${concept.id}`
                    const isActive = pathname === href
                    return (
                      <Link
                        key={concept.id}
                        href={href}
                        className={cn(
                          'block rounded-md px-2 py-1 text-sm transition-colors',
                          isActive
                            ? 'bg-[#6366f1]/10 text-[#6366f1]'
                            : 'text-[#888] hover:bg-[#1a1a1a] hover:text-[#ccc]'
                        )}
                      >
                        {concept.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-[#555]">No concepts found.</p>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
