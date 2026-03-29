'use client'

import dynamic from 'next/dynamic'
import type { OnMount, OnChange } from '@monaco-editor/react'

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#050506]">
      <span className="text-xs text-[#333]">Loading editor…</span>
    </div>
  ),
})

interface MonacoEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
}

export function MonacoEditor({ value, language, onChange }: MonacoEditorProps) {
  const handleMount: OnMount = (_editor, monaco) => {
    monaco.editor.defineTheme('dsa-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '3a3a5a', fontStyle: 'italic' },
        { token: 'keyword', foreground: '8b93e8' },
        { token: 'string', foreground: '86efac' },
        { token: 'number', foreground: 'fda4af' },
        { token: 'type', foreground: '7dd3fc' },
        { token: 'function', foreground: 'c4b5fd' },
      ],
      colors: {
        'editor.background': '#050506',
        'editor.foreground': '#d4d4dc',
        'editor.lineHighlightBackground': '#0d0d0f',
        'editor.selectionBackground': '#5e6ad230',
        'editor.inactiveSelectionBackground': '#5e6ad215',
        'editorLineNumber.foreground': '#2a2a3a',
        'editorLineNumber.activeForeground': '#5e6ad2',
        'editorCursor.foreground': '#5e6ad2',
        'editorIndentGuide.background1': '#1a1a2a',
        'editorIndentGuide.activeBackground1': '#5e6ad250',
        'editorWhitespace.foreground': '#1a1a2a',
        'editorBracketMatch.background': '#5e6ad225',
        'editorBracketMatch.border': '#5e6ad2',
        'editorWidget.background': '#0d0d0f',
        'editorWidget.border': '#1f1f2e',
        'editorSuggestWidget.background': '#0d0d0f',
        'editorSuggestWidget.border': '#1f1f2e',
        'editorSuggestWidget.selectedBackground': '#5e6ad215',
        'editorSuggestWidget.foreground': '#d4d4dc',
        'editorSuggestWidget.highlightForeground': '#8b93e8',
        'scrollbarSlider.background': '#1a1a2a80',
        'scrollbarSlider.hoverBackground': '#2a2a3a80',
        'scrollbarSlider.activeBackground': '#5e6ad240',
        'focusBorder': '#5e6ad260',
        'input.background': '#0d0d0f',
        'input.border': '#1f1f2e',
      },
    })
    monaco.editor.setTheme('dsa-dark')
  }

  const handleChange: OnChange = (val) => onChange(val ?? '')

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        fontSize: 13,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
        fontLigatures: true,
        lineHeight: 22,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'off',
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoSurround: 'brackets',
        autoIndent: 'advanced',
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: { other: true, comments: false, strings: false },
        parameterHints: { enabled: true },
        hover: { enabled: true },
        contextmenu: true,
        folding: true,
        foldingHighlight: true,
        showFoldingControls: 'mouseover',
        matchBrackets: 'always',
        renderWhitespace: 'none',
        guides: { indentation: true, bracketPairs: true },
        padding: { top: 16, bottom: 32 },
        scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
      }}
    />
  )
}
