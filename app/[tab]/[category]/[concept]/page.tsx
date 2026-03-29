import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getTab, getCategory, getConcept, getAdjacentConcepts } from '@/lib/content'
import { ConceptDetail } from '@/components/concept/ConceptDetail'
import { Sidebar } from '@/components/layout/Sidebar'

interface ConceptPageProps {
  params: Promise<{ tab: string; category: string; concept: string }>
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { tab: tabId, category: categoryId, concept: conceptId } = await params
  const tab = getTab(tabId)
  const category = getCategory(tabId, categoryId)
  const concept = getConcept(tabId, categoryId, conceptId)

  if (!tab || !category || !concept) {
    notFound()
  }

  const { prev, next } = getAdjacentConcepts(tabId, categoryId, conceptId)

  return (
    <div className="flex">
      <Sidebar tabId={tabId} categories={tab.categories} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href={`/${tabId}/${categoryId}`}
              className="inline-flex items-center gap-1 text-sm text-[#888] transition-colors hover:text-[#6366f1]"
            >
              <ChevronLeft className="h-4 w-4" />
              {category.title}
            </Link>
          </div>
          <ConceptDetail
            concept={concept}
            tabId={tabId}
            categoryId={categoryId}
            prev={prev}
            next={next}
          />
        </div>
      </div>
    </div>
  )
}
