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
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  advanced: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  expert: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export function ConceptCard({ concept, href }: ConceptCardProps) {
  return (
    <Link href={href} className="cursor-pointer block group press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded-lg">
      <Card className="h-full border border-white/[0.07] bg-[#0d0d0f] transition-all duration-150 group-hover:border-white/[0.14] group-hover:bg-[#111116]">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-snug text-[#e0e0e0] transition-colors duration-150 group-hover:text-[#efefef]">
              {concept.title}
            </CardTitle>
            {concept.difficulty && (
              <Badge
                variant="outline"
                className={cn('shrink-0 text-[10px] capitalize', difficultyColors[concept.difficulty])}
              >
                {concept.difficulty}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[#555]">{concept.description}</p>
          <div className="flex flex-wrap gap-1">
            {(concept.tags ?? []).slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border-white/[0.06] bg-white/[0.04] text-[10px] text-[#444] transition-colors duration-150 group-hover:text-[#555]"
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
