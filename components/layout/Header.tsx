'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Layers, Network, Monitor, Server, Building2, TerminalSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'algorithms', label: 'Algorithms', icon: Brain },
  { id: 'dsa', label: 'DSA', icon: Layers },
  { id: 'system-design', label: 'System Design', icon: Network },
  { id: 'frontend', label: 'Frontend', icon: Monitor },
  { id: 'backend', label: 'Backend', icon: Server },
  { id: 'architecture', label: 'Architecture', icon: Building2 },
  { id: 'compiler', label: 'Compiler', icon: TerminalSquare },
] as const

export function Header() {
  const pathname = usePathname()
  const activeTab = pathname.split('/')[1] || 'algorithms'

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#020203]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded-md px-1"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#5e6ad2]/15 ring-1 ring-[#5e6ad2]/30">
              <Brain className="h-4 w-4 text-[#5e6ad2]" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#efefef]">DSA Mastery</span>
            <span className="hidden text-xs text-[#444] sm:inline">· senior engineer edition</span>
          </Link>
        </div>
        <nav className="-mb-px flex gap-0.5 overflow-x-auto pb-px scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Link
                key={tab.id}
                href={`/${tab.id}`}
                className={cn(
                  'group relative flex cursor-pointer items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:rounded-t-md focus-visible:ring-2 focus-visible:ring-[#5e6ad2]',
                  isActive
                    ? 'text-[#efefef]'
                    : 'text-[#555] hover:text-[#aaa]'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5 transition-colors duration-150', isActive ? 'text-[#5e6ad2]' : 'text-current')} />
                {tab.label}
                {/* Active underline */}
                <span
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-200',
                    isActive
                      ? 'bg-[#5e6ad2] opacity-100'
                      : 'bg-[#5e6ad2] opacity-0 group-hover:opacity-20'
                  )}
                />
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
