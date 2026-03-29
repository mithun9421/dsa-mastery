'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Layers, Network, Monitor, Server, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'algorithms', label: 'Algorithms', icon: Brain },
  { id: 'dsa', label: 'DSA', icon: Layers },
  { id: 'system-design', label: 'System Design', icon: Network },
  { id: 'frontend', label: 'Frontend', icon: Monitor },
  { id: 'backend', label: 'Backend', icon: Server },
  { id: 'architecture', label: 'Architecture', icon: Building2 },
] as const

export function Header() {
  const pathname = usePathname()
  const activeTab = pathname.split('/')[1] || 'algorithms'

  return (
    <header className="sticky top-0 z-50 border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#f0f0f0]">DSA Mastery</span>
            <span className="hidden text-xs text-[#888] sm:inline">For the 10-year engineer</span>
          </Link>
        </div>
        <nav className="-mb-px flex gap-1 overflow-x-auto pb-px scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Link
                key={tab.id}
                href={`/${tab.id}`}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-[#6366f1] text-[#f0f0f0]'
                    : 'border-transparent text-[#888] hover:border-[#333] hover:text-[#ccc]'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
