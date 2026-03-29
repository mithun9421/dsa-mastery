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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#f0f0f0]">{tab.title}</h1>
        <p className="mt-2 text-[#888]">{tab.description}</p>
      </div>

      {tab.categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#333] p-12 text-center">
          <p className="text-[#555]">Content coming soon. Check back shortly.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tab.categories.map((cat) => (
            <Link key={cat.id} href={`/${tabId}/${cat.id}`}>
              <Card className="h-full border-[#1f1f1f] bg-[#111] transition-colors hover:border-[#333] hover:bg-[#161616]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[#f0f0f0]">
                    {cat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 line-clamp-2 text-sm text-[#888]">{cat.description}</p>
                  <Badge
                    variant="secondary"
                    className="border-[#1f1f1f] bg-[#1a1a1a] text-xs text-[#666]"
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
