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
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  advanced: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  expert: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export function ConceptDetail({ concept, tabId, categoryId, prev, next }: ConceptDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#f0f0f0]">{concept.title}</h1>
          {concept.difficulty && (
            <Badge
              variant="outline"
              className={cn('capitalize', difficultyColors[concept.difficulty])}
            >
              {concept.difficulty}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-[#999] leading-relaxed">{concept.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(concept.tags ?? []).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="border-[#1f1f1f] bg-[#1a1a1a] text-xs text-[#777]"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Complexity */}
      {(concept.timeComplexity || concept.spaceComplexity) && (
        <Card className="border-[#1f1f1f] bg-[#111]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#ccc]">Complexity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f1f1f]">
                    <th className="pb-2 pr-4 text-left font-medium text-[#888]">Metric</th>
                    <th className="pb-2 pr-4 text-left font-medium text-[#888]">Complexity</th>
                  </tr>
                </thead>
                <tbody className="text-[#ccc]">
                  {concept.timeComplexity?.best && (
                    <tr className="border-b border-[#1a1a1a]">
                      <td className="py-1.5 pr-4 text-[#888]">Time (Best)</td>
                      <td className="py-1.5">
                        <ComplexityBadge complexity={concept.timeComplexity.best} />
                      </td>
                    </tr>
                  )}
                  {concept.timeComplexity?.average && (
                    <tr className="border-b border-[#1a1a1a]">
                      <td className="py-1.5 pr-4 text-[#888]">Time (Average)</td>
                      <td className="py-1.5">
                        <ComplexityBadge complexity={concept.timeComplexity.average} />
                      </td>
                    </tr>
                  )}
                  {concept.timeComplexity?.worst && (
                    <tr className="border-b border-[#1a1a1a]">
                      <td className="py-1.5 pr-4 text-[#888]">Time (Worst)</td>
                      <td className="py-1.5">
                        <ComplexityBadge complexity={concept.timeComplexity.worst} />
                      </td>
                    </tr>
                  )}
                  {concept.spaceComplexity && (
                    <tr>
                      <td className="py-1.5 pr-4 text-[#888]">Space</td>
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
        <Card className="border-[#1f1f1f] bg-[#111]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#ccc]">
              <Zap className="h-4 w-4 text-[#6366f1]" />
              Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {concept.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#bbb]">
                  <span className="mt-0.5 shrink-0 text-[#6366f1]">&#x2022;</span>
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Code Examples */}
      {concept.codeExamples && concept.codeExamples.length > 0 && (
        <Card className="border-[#1f1f1f] bg-[#111]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#ccc]">
              <BookOpen className="h-4 w-4 text-[#6366f1]" />
              Code Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {concept.codeExamples.map((example, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline" className="border-[#333] text-xs text-[#888]">
                    {example.language}
                  </Badge>
                  <span className="text-xs text-[#666]">{example.label}</span>
                </div>
                <SyntaxHighlighter
                  language={example.language}
                  style={oneDark}
                  customStyle={{
                    background: '#0a0a0a',
                    borderRadius: '0.5rem',
                    border: '1px solid #1f1f1f',
                    fontSize: '0.8rem',
                    margin: 0,
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
        <Card className="border-[#1f1f1f] bg-[#111]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#ccc]">
              <Target className="h-4 w-4 text-[#22c55e]" />
              Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {(concept.useCases ?? []).map((uc, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#bbb]">
                  <span className="mt-0.5 shrink-0 text-[#22c55e]">&#x2192;</span>
                  {uc}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Common Pitfalls */}
      {(concept.commonPitfalls ?? []).length > 0 && (
        <Card className="border-[#1f1f1f] bg-[#111] border-l-2 border-l-[#f59e0b]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#ccc]">
              <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />
              Common Pitfalls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {(concept.commonPitfalls ?? []).map((pit, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#bbb]">
                  <span className="mt-0.5 shrink-0 text-[#f59e0b]">!</span>
                  {pit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Interview Tips */}
      {(concept.interviewTips ?? []).length > 0 && (
        <Card className="border-[#1f1f1f] bg-[#111] border-l-2 border-l-[#3b82f6]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#ccc]">
              <Lightbulb className="h-4 w-4 text-[#3b82f6]" />
              Interview Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {(concept.interviewTips ?? []).map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#bbb]">
                  <span className="mt-0.5 shrink-0 text-[#3b82f6]">&#x2713;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Pro Tip */}
      {concept.proTip && (
        <Card className="border-[#6366f1]/30 bg-[#6366f1]/5">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[#6366f1]" />
              <div>
                <p className="mb-1 text-sm font-semibold text-[#6366f1]">Pro Tip</p>
                <p className="text-sm text-[#ccc] leading-relaxed">{concept.proTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ASCII Diagram */}
      {concept.ascii && (
        <Card className="border-[#1f1f1f] bg-[#111]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#ccc]">Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-[#0a0a0a] border border-[#1f1f1f] p-4 font-mono text-xs text-[#ccc] leading-relaxed">
              {concept.ascii}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Related Concepts */}
      {(concept.relatedConcepts ?? []).length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#ccc]">
            <LinkIcon className="h-4 w-4 text-[#888]" />
            Related Concepts
          </h3>
          <div className="flex flex-wrap gap-2">
            {(concept.relatedConcepts ?? []).map((rc) => (
              <Badge
                key={rc}
                variant="outline"
                className="border-[#333] text-xs text-[#888] hover:border-[#6366f1] hover:text-[#6366f1]"
              >
                {rc}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-[#1f1f1f]" />

      {/* Prev/Next Navigation */}
      <div className="flex items-center justify-between">
        {prev ? (
          <Link
            href={`/${tabId}/${categoryId}/${prev.id}`}
            className="text-sm text-[#888] transition-colors hover:text-[#6366f1]"
          >
            &larr; {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/${tabId}/${categoryId}/${next.id}`}
            className="text-sm text-[#888] transition-colors hover:text-[#6366f1]"
          >
            {next.title} &rarr;
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
