// @ts-nocheck
import type { Tab } from '@/lib/types'
import { sortingCategory } from './sorting'
import { searchingCategory } from './searching'
import { graphCategory } from './graph'
import { dpCategory } from './dynamic-programming'
import { greedyCategory } from './greedy'
import { backtrackingCategory } from './backtracking'
import { stringCategory } from './string-algorithms'
import { bitCategory } from './bit-manipulation'
import { mathCategory } from './mathematical'

export const algorithmsTab: Tab = {
  id: 'algorithms',
  title: 'Algorithms',
  description: 'Every algorithm from first principles — complexity analysis, implementation patterns, and the intuition that makes them click.',
  icon: 'Brain',
  categories: [
    sortingCategory,
    searchingCategory,
    graphCategory,
    dpCategory,
    greedyCategory,
    backtrackingCategory,
    stringCategory,
    bitCategory,
    mathCategory,
  ],
}
