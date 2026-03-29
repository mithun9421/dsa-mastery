// @ts-nocheck
import type { Tab } from '@/lib/types'
import { scalabilityCategory } from './scalability'
import { databasesCategory } from './databases'
import { cachingCategory } from './caching'
import { messagingCategory } from './messaging'
import { apiDesignCategory } from './api-design'
import { distributedCategory } from './distributed-systems'
import { realWorldCategory } from './real-world'

export const systemDesignTab: Tab = {
  id: 'system-design',
  title: 'System Design',
  description: 'Scalability patterns, database design, caching strategies, messaging systems, and distributed architecture.',
  icon: 'Network',
  categories: [
    scalabilityCategory,
    databasesCategory,
    cachingCategory,
    messagingCategory,
    apiDesignCategory,
    distributedCategory,
    realWorldCategory,
  ],
}
