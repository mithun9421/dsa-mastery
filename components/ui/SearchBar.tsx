'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(local)
    }, 300)
    return () => clearTimeout(timer)
  }, [local, onChange])

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] py-1.5 pl-9 pr-3 text-sm text-[#f0f0f0] placeholder-[#555] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
      />
    </div>
  )
}
