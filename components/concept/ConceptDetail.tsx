'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ComplexityBadge } from './ComplexityBadge'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  BookOpen,
  Link as LinkIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import type { Concept } from '@/lib/types'

interface ConceptDetailProps {
  concept: Concept
  tabId: string
  categoryId: string
  prev?: Concept
  next?: Concept
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  advanced: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  expert: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export function ConceptDetail({ concept, tabId, categoryId, prev, next }: ConceptDetailProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-[#efefef]">{concept.title}</h1>
          {concept.difficulty && (
            <Badge
              variant="outline"
              className={cn('capitalize text-xs', difficultyColors[concept.difficulty])}
            >
              {concept.difficulty}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#6b6b7a]">{concept.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(concept.tags ?? []).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="border-white/[0.06] bg-white/[0.04] text-[10px] text-[#444]"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Complexity */}
      {(concept.timeComplexity || concept.spaceComplexity) && (
        <Card className="border border-white/[0.07] bg-[#0d0d0f]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#444]">Complexity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="pb-2 pr-4 text-left text-xs font-medium text-[#444]">Metric</th>
                    <th className="pb-2 pr-4 text-left text-xs font-medium text-[#444]">Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {concept.timeComplexity?.best && (
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-1.5 pr-4 text-xs text-[#555]">Time (Best)</td>
                      <td className="py-1.5">
                        <ComplexityBadge complexity={concept.timeComplexity.best} />
                      </td>
                    </tr>
                  )}
                  {concept.timeComplexity?.average && (
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-1.5 pr-4 text-xs text-[#555]">Time (Average)</td>
                      <td className="py-1.5">
                        <ComplexityBadge complexity={concept.timeComplexity.average} />
                      </td>
                    </tr>
                  )}
                  {concept.timeComplexity?.worst && (
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-1.5 pr-4 text-xs text-[#555]">Time (Worst)</td>
                      <td className="py-1.5">
                        <ComplexityBadge complexity={concept.timeComplexity.worst} />
                      </td>
                    </tr>
                  )}
                  {concept.spaceComplexity && (
                    <tr>
                      <td className="py-1.5 pr-4 text-xs text-[#555]">Space</td>
                      <td className="py-1.5">
                        <ComplexityBadge complexity={concept.spaceComplexity} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Points */}
      {concept.keyPoints.length > 0 && (
        <Card className="border border-white/[0.07] bg-[#0d0d0f]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#444]">
              <Zap className="h-3.5 w-3.5 text-[#5e6ad2]" />
              Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {concept.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[#bbb]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5e6ad2]/60" />
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Code Examples */}
      {concept.codeExamples && concept.codeExamples.length > 0 && (
        <Card className="border border-white/[0.07] bg-[#0d0d0f]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#444]">
              <BookOpen className="h-3.5 w-3.5 text-[#5e6ad2]" />
              Code Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {concept.codeExamples.map((example, i) => (
              <div key={i}>
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge variant="outline" className="border-white/[0.1] text-[10px] text-[#555]">
                    {example.language}
                  </Badge>
                  <span className="text-xs text-[#3a3a4a]">{example.label}</span>
                </div>
                <SyntaxHighlighter
                  language={example.language}
                  style={oneDark}
                  customStyle={{
                    background: '#050506',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.07)',
                    fontSize: '0.78rem',
                    margin: 0,
                    lineHeight: '1.6',
                  }}
                >
                  {example.code}
                </SyntaxHighlighter>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Use Cases */}
      {(concept.useCases ?? []).length > 0 && (
        <Card className="border border-white/[0.07] bg-[#0d0d0f]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#444]">
              <Target className="h-3.5 w-3.5 text-emerald-500" />
              Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {(concept.useCases ?? []).map((uc, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[#bbb]">
                  <span className="mt-0.5 shrink-0 text-emerald-500/70">→</span>
                  {uc}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Common Pitfalls */}
      {(concept.commonPitfalls ?? []).length > 0 && (
        <Card className="border border-amber-500/20 bg-amber-500/[0.04]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777]">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Common Pitfalls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {(concept.commonPitfalls ?? []).map((pit, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[#bbb]">
                  <span className="mt-0.5 shrink-0 text-amber-500/70">!</span>
                  {pit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Interview Tips */}
      {(concept.interviewTips ?? []).length > 0 && (
        <Card className="border border-blue-500/20 bg-blue-500/[0.04]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777]">
              <Lightbulb className="h-3.5 w-3.5 text-blue-400" />
              Interview Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {(concept.interviewTips ?? []).map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[#bbb]">
                  <span className="mt-0.5 shrink-0 text-blue-400/70">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Pro Tip */}
      {concept.proTip && (
        <Card className="border border-[#5e6ad2]/25 bg-[#5e6ad2]/[0.06]">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#5e6ad2]" />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#5e6ad2]">Pro Tip</p>
                <p className="text-sm leading-relaxed text-[#bbb]">{concept.proTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ASCII Diagram */}
      {concept.ascii && (
        <Card className="border border-white/[0.07] bg-[#0d0d0f]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#444]">Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="scrollbar-thin overflow-x-auto rounded-md bg-[#050506] border border-white/[0.06] p-4 font-mono text-xs leading-relaxed text-[#888]">
              {concept.ascii}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Related Concepts */}
      {(concept.relatedConcepts ?? []).length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#444]">
            <LinkIcon className="h-3.5 w-3.5" />
            Related Concepts
          </h3>
          <div className="flex flex-wrap gap-2">
            {(concept.relatedConcepts ?? []).map((rc) => (
              <Badge
                key={rc}
                variant="outline"
                className="cursor-default border-white/[0.08] text-xs text-[#555] transition-colors duration-150 hover:border-[#5e6ad2]/40 hover:text-[#8b93e8]"
              >
                {rc}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-white/[0.06]" />

      {/* Prev/Next Navigation */}
      <div className="flex items-center justify-between">
        {prev ? (
          <Link
            href={`/${tabId}/${categoryId}/${prev.id}`}
            className="group flex cursor-pointer items-center gap-1.5 text-sm text-[#444] transition-colors duration-150 hover:text-[#5e6ad2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded-md px-1"
          >
            <span className="transition-transform duration-150 group-hover:-translate-x-0.5">←</span>
            {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/${tabId}/${categoryId}/${next.id}`}
            className="group flex cursor-pointer items-center gap-1.5 text-sm text-[#444] transition-colors duration-150 hover:text-[#5e6ad2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded-md px-1"
          >
            {next.title}
            <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
