import { allTabs } from '@/content'
import type { Tab, Category, Concept } from '@/lib/types'

export function getTab(tabId: string): Tab | undefined {
  return allTabs.find((t) => t.id === tabId)
}

export function getCategory(tabId: string, categoryId: string): Category | undefined {
  const tab = getTab(tabId)
  if (!tab) return undefined
  return tab.categories.find((c) => c.id === categoryId)
}

export function getConcept(
  tabId: string,
  categoryId: string,
  conceptId: string
): Concept | undefined {
  const category = getCategory(tabId, categoryId)
  if (!category) return undefined
  return category.concepts.find((c) => c.id === conceptId)
}

export function searchConcepts(
  query: string,
  tabId?: string
): Array<{ concept: Concept; tab: Tab; category: Category }> {
  const results: Array<{ concept: Concept; tab: Tab; category: Category }> = []
  const q = query.toLowerCase()

  const tabs = tabId ? allTabs.filter((t) => t.id === tabId) : allTabs

  for (const tab of tabs) {
    for (const category of tab.categories) {
      for (const concept of category.concepts) {
        const matches =
          concept.title?.toLowerCase().includes(q) ||
          concept.description?.toLowerCase().includes(q) ||
          (concept.tags ?? []).some((tag) => tag.toLowerCase().includes(q))

        if (matches) {
          results.push({ concept, tab, category })
        }
      }
    }
  }

  return results
}

export function getAdjacentConcepts(
  tabId: string,
  categoryId: string,
  conceptId: string
): { prev?: Concept; next?: Concept } {
  const category = getCategory(tabId, categoryId)
  if (!category) return {}

  const idx = category.concepts.findIndex((c) => c.id === conceptId)
  if (idx === -1) return {}

  return {
    prev: idx > 0 ? category.concepts[idx - 1] : undefined,
    next: idx < category.concepts.length - 1 ? category.concepts[idx + 1] : undefined,
  }
}
