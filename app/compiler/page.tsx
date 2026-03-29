'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Play,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle,
  TerminalSquare,
  X,
  GripHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LANGUAGE_MAP, runCode, type LanguageConfig, type RunResult } from '@/lib/compiler'
import { MonacoEditor } from '@/components/compiler/MonacoEditor'

const LANGS = Object.values(LANGUAGE_MAP)

export default function CompilerPage() {
  const [selectedLang, setSelectedLang] = useState<LanguageConfig>(LANGUAGE_MAP.py)
  const [code, setCode] = useState(LANGUAGE_MAP.py.template)
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [output, setOutput] = useState<RunResult | null>(null)
  const [outputErr, setOutputErr] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [outputOpen, setOutputOpen] = useState(false)
  const [outputHeight, setOutputHeight] = useState(220)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)

  const switchLang = useCallback((lang: LanguageConfig) => {
    setSelectedLang(lang)
    setCode(lang.template)
    setLangPickerOpen(false)
    setOutput(null)
    setOutputErr(null)
  }, [])

  const handleRun = useCallback(async () => {
    if (running) return
    setRunning(true)
    setOutputOpen(true)
    setOutput(null)
    setOutputErr(null)
    try {
      const result = await runCode(`main.${selectedLang.ext}`, code)
      setOutput(result)
    } catch (err) {
      setOutputErr(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setRunning(false)
    }
  }, [running, selectedLang, code])

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startH: outputHeight }
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const delta = dragRef.current.startY - ev.clientY
      setOutputHeight(Math.max(80, Math.min(520, dragRef.current.startH + delta)))
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const editorHeight = outputOpen
    ? `calc(100vh - 56px - 44px - 28px - ${outputHeight}px)`
    : 'calc(100vh - 56px - 44px)'

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden bg-[#020203]">
      {/* Toolbar */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#080809] px-4">
        {/* Language picker */}
        <div className="relative">
          <button
            onClick={() => setLangPickerOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-[#ccc] transition-all duration-150 hover:border-white/[0.14] hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]"
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: selectedLang.color }}
            />
            {selectedLang.label}
            <ChevronDown
              className={cn('h-3.5 w-3.5 text-[#555] transition-transform duration-150', langPickerOpen && 'rotate-180')}
            />
          </button>

          {langPickerOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setLangPickerOpen(false)}
              />
              {/* Dropdown */}
              <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-white/[0.08] bg-[#0d0d0f] shadow-2xl">
                {LANGS.map((lang) => (
                  <button
                    key={lang.ext}
                    onClick={() => switchLang(lang)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100',
                      selectedLang.ext === lang.ext
                        ? 'bg-[#5e6ad2]/10 text-[#8b93e8]'
                        : 'text-[#666] hover:bg-white/[0.04] hover:text-[#ccc]'
                    )}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: lang.color }}
                    />
                    {lang.label}
                    <span className="ml-auto text-[10px] text-[#333]">.{lang.ext}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={running}
          className={cn(
            'flex cursor-pointer items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150',
            'disabled:cursor-not-allowed disabled:opacity-50',
            running
              ? 'bg-[#5e6ad2]/10 text-[#5e6ad2]'
              : 'bg-[#5e6ad2] text-white hover:bg-[#6b76db] active:scale-[0.97]'
          )}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {running ? 'Running…' : 'Run Code'}
        </button>
      </div>

      {/* Editor */}
      <div className="overflow-hidden" style={{ height: editorHeight }}>
        <MonacoEditor
          key={selectedLang.ext}
          value={code}
          language={selectedLang.monacoId}
          onChange={setCode}
        />
      </div>

      {/* Output panel */}
      {outputOpen && (
        <>
          {/* Drag handle / panel header */}
          <div
            onMouseDown={onDragStart}
            className="flex h-7 shrink-0 cursor-row-resize items-center justify-between border-y border-white/[0.06] bg-[#080809] px-4 select-none"
          >
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-3.5 w-3.5 text-[#333]" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#333]">
                Output
              </span>
              {output && !running && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-[10px]',
                    output.exitCode === 0 ? 'text-emerald-500' : 'text-red-400'
                  )}
                >
                  {output.exitCode === 0 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  exit {output.exitCode} · {output.durationMs}ms
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <GripHorizontal className="h-3.5 w-3.5 text-[#1a1a2a]" />
              <button
                onClick={() => setOutputOpen(false)}
                className="cursor-pointer text-[#333] transition-colors hover:text-[#777]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Output content */}
          <div
            className="scrollbar-thin overflow-y-auto bg-[#050506] font-mono"
            style={{ height: outputHeight }}
          >
            {running && (
              <div className="flex items-center gap-2.5 p-5 text-sm text-[#5e6ad2]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Executing…
              </div>
            )}
            {outputErr && !running && (
              <pre className="p-5 text-sm leading-relaxed text-red-400">{outputErr}</pre>
            )}
            {output && !running && (
              <div className="p-5 space-y-4">
                {output.stdout && (
                  <div>
                    <div className="mb-1.5 text-[10px] uppercase tracking-widest text-[#2a2a3a]">
                      stdout
                    </div>
                    <pre className="text-sm leading-relaxed text-[#bbb] whitespace-pre-wrap">
                      {output.stdout}
                    </pre>
                  </div>
                )}
                {output.stderr && (
                  <div>
                    <div className="mb-1.5 text-[10px] uppercase tracking-widest text-[#2a2a3a]">
                      stderr
                    </div>
                    <pre className="text-sm leading-relaxed text-red-400 whitespace-pre-wrap">
                      {output.stderr}
                    </pre>
                  </div>
                )}
                {!output.stdout && !output.stderr && (
                  <span className="text-sm text-[#2a2a3a]">(no output)</span>
                )}
              </div>
            )}
            {!running && !output && !outputErr && (
              <div className="p-5 text-sm text-[#1a1a2a]">
                Run your code to see output here.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
