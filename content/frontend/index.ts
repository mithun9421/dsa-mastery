// @ts-nocheck
import type { Tab } from '@/lib/types'
import { reactPatternsCategory } from './react-patterns'
import { stateManagementCategory } from './state-management'
import { frontendPerfCategory } from './performance'
import { webApisCategory } from './web-apis'
import { renderingCategory } from './rendering'
import { typescriptCategory } from './typescript-advanced'
import { frontendTestingCategory } from './testing'

export const frontendTab: Tab = {
  id: 'frontend',
  title: 'Frontend',
  description:
    'React internals, state management trade-offs, rendering strategies, Web APIs, and TypeScript mastery — from a decade in the trenches.',
  icon: 'Monitor',
  categories: [
    reactPatternsCategory,
    stateManagementCategory,
    frontendPerfCategory,
    webApisCategory,
    renderingCategory,
    typescriptCategory,
    frontendTestingCategory,
  ],
}
