import { algorithmsTab } from './algorithms'
import { dsaTab } from './dsa'
import { systemDesignTab } from './system-design'
import { frontendTab } from './frontend'
import { backendTab } from './backend'
import { architectureTab } from './architecture'
import type { Tab } from '@/lib/types'

export const allTabs: Tab[] = [
  algorithmsTab,
  dsaTab,
  systemDesignTab,
  frontendTab,
  backendTab,
  architectureTab,
]

export { algorithmsTab, dsaTab, systemDesignTab, frontendTab, backendTab, architectureTab }
