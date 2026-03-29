import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getTab, getCategory } from '@/lib/content'
import { ConceptCard } from '@/components/concept/ConceptCard'

interface CategoryPageProps {
  params: Promise<{ tab: string; category: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { tab: tabId, category: categoryId } = await params
  const tab = getTab(tabId)
  const category = getCategory(tabId, categoryId)

  if (!tab || !category) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/${tabId}`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-[#888] transition-colors hover:text-[#6366f1]"
        >
          <ChevronLeft className="h-4 w-4" />
          {tab.title}
        </Link>
        <h1 className="text-2xl font-bold text-[#f0f0f0]">{category.title}</h1>
        <p className="mt-1 text-[#888]">{category.description}</p>
      </div>

      {category.concepts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#333] p-12 text-center">
          <p className="text-[#555]">Concepts coming soon.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {category.concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              href={`/${tabId}/${categoryId}/${concept.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
