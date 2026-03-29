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
      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#333]" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-white/[0.07] bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-[#ccc] placeholder-[#333] outline-none transition-colors duration-150 focus:border-[#5e6ad2]/40 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#5e6ad2]/30"
      />
    </div>
  )
}
