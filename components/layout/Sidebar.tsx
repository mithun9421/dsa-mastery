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
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] bg-[#080809] lg:block">
      <div className="p-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter concepts..." />
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)] scrollbar-thin">
        <div className="space-y-0.5 p-3 pt-0">
          {filtered.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#444] transition-colors duration-150 hover:bg-white/[0.04] hover:text-[#888] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2]"
              >
                {expanded[cat.id] ? (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                )}
                <span className="truncate">{cat.title ?? ''}</span>
                <span className="ml-auto tabular-nums text-[#333]">{cat.concepts.length}</span>
              </button>
              {expanded[cat.id] && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/[0.05] pl-2">
                  {cat.concepts.map((concept) => {
                    const href = `/${tabId}/${cat.id}/${concept.id}`
                    const isActive = pathname === href
                    return (
                      <Link
                        key={concept.id}
                        href={href}
                        className={cn(
                          'block cursor-pointer rounded-md px-2 py-1 text-sm leading-snug transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2]',
                          isActive
                            ? 'bg-[#5e6ad2]/10 font-medium text-[#8b93e8] ring-1 ring-[#5e6ad2]/20'
                            : 'text-[#555] hover:bg-white/[0.04] hover:text-[#999]'
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
            <p className="px-2 py-8 text-center text-xs text-[#333]">No concepts found.</p>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
