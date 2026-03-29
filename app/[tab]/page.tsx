import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTab } from '@/lib/content'

interface TabPageProps {
  params: Promise<{ tab: string }>
}

export default async function TabPage({ params }: TabPageProps) {
  const { tab: tabId } = await params
  const tab = getTab(tabId)

  if (!tab) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-[#efefef]">{tab.title}</h1>
        <p className="mt-2 text-sm text-[#555]">{tab.description}</p>
      </div>

      {tab.categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/[0.08] p-16 text-center">
          <p className="text-sm text-[#333]">Content coming soon.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tab.categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${tabId}/${cat.id}`}
              className="group cursor-pointer block press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] rounded-lg"
            >
              <Card className="h-full border border-white/[0.07] bg-[#0d0d0f] transition-all duration-150 group-hover:border-white/[0.14] group-hover:bg-[#111116]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[#e0e0e0] transition-colors duration-150 group-hover:text-[#efefef]">
                    {cat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-[#444]">{cat.description}</p>
                  <Badge
                    variant="secondary"
                    className="border-white/[0.06] bg-white/[0.04] text-[10px] text-[#444]"
                  >
                    {cat.concepts.length} concept{cat.concepts.length !== 1 ? 's' : ''}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
