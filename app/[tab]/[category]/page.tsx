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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/${tabId}`}
          className="mb-4 inline-flex cursor-pointer items-center gap-1 text-xs text-[#444] transition-colors duration-150 hover:text-[#5e6ad2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded-md"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {tab.title}
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[#efefef]">{category.title}</h1>
        <p className="mt-1.5 text-sm text-[#555]">{category.description}</p>
      </div>

      {category.concepts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/[0.08] p-16 text-center">
          <p className="text-sm text-[#333]">Concepts coming soon.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
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
