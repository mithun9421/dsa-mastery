import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Concept } from '@/lib/types'

interface ConceptCardProps {
  concept: Concept
  href: string
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  advanced: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  expert: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export function ConceptCard({ concept, href }: ConceptCardProps) {
  return (
    <Link href={href}>
      <Card className="border-[#1f1f1f] bg-[#111] transition-colors hover:border-[#333] hover:bg-[#161616]">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold text-[#f0f0f0]">
              {concept.title}
            </CardTitle>
            {concept.difficulty && (
              <Badge
                variant="outline"
                className={cn('shrink-0 text-xs capitalize', difficultyColors[concept.difficulty])}
              >
                {concept.difficulty}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 line-clamp-2 text-xs text-[#888]">{concept.description}</p>
          <div className="flex flex-wrap gap-1">
            {(concept.tags ?? []).slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border-[#1f1f1f] bg-[#1a1a1a] text-[10px] text-[#666]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
