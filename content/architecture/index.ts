// @ts-nocheck
import type { Tab } from '@/lib/types'
import { designPatternsCategory } from './design-patterns'
import { solidCategory } from './solid-principles'
import { cleanArchCategory } from './clean-architecture'
import { dddCategory } from './ddd'
import { archStylesCategory } from './architectural-styles'
import { cloudPatternsCategory } from './cloud-patterns'

export const architectureTab: Tab = {
  id: 'architecture',
  title: 'Architecture',
  description: 'Design patterns, SOLID principles, clean architecture, DDD, architectural styles, and cloud patterns — the blueprint for building systems that last.',
  icon: 'Building2',
  categories: [
    designPatternsCategory,
    solidCategory,
    cleanArchCategory,
    dddCategory,
    archStylesCategory,
    cloudPatternsCategory,
  ],
}
