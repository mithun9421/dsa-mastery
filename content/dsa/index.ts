// @ts-nocheck
import type { Tab } from '@/lib/types'
import { arraysCategory } from './arrays'
import { linkedListsCategory } from './linked-lists'
import { stacksQueuesCategory } from './stacks-queues'
import { treesCategory } from './trees'
import { heapsCategory } from './heaps'
import { hashTablesCategory } from './hash-tables'
import { graphsCategory } from './graphs'
import { triesCategory } from './tries'
import { disjointSetCategory } from './disjoint-set'
import { advancedDSCategory } from './advanced'

export const dsaTab: Tab = {
  id: 'dsa',
  title: 'Data Structures',
  description: 'Every data structure from arrays to van Emde Boas — with implementation trade-offs, when to use what, and the internals that make them tick.',
  icon: 'Layers',
  categories: [
    arraysCategory,
    linkedListsCategory,
    stacksQueuesCategory,
    treesCategory,
    heapsCategory,
    hashTablesCategory,
    graphsCategory,
    triesCategory,
    disjointSetCategory,
    advancedDSCategory,
  ],
}
