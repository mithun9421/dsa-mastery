import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ComplexityBadgeProps {
  complexity: string
}

function getComplexityColor(c: string): string {
  const lower = c.toLowerCase()
  if (lower.includes('1)') || lower.includes('log n)') || lower.includes('log(n)')) {
    return 'bg-green-500/10 text-green-400 border-green-500/20'
  }
  if (lower.includes('n)') && !lower.includes('n log') && !lower.includes('n^') && !lower.includes('n2')) {
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  }
  if (lower.includes('n log') || lower.includes('n*log')) {
    return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  }
  return 'bg-red-500/10 text-red-400 border-red-500/20'
}

export function ComplexityBadge({ complexity }: ComplexityBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-mono text-xs', getComplexityColor(complexity))}>
      {complexity}
    </Badge>
  )
}
