import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach execution API: ${err instanceof Error ? err.message : 'network error'}` },
      { status: 502 }
    )
  }

  const text = await res.text()

  if (!res.ok) {
    return NextResponse.json(
      { error: `Execution API returned ${res.status}: ${text}` },
      { status: res.status }
    )
  }

  try {
    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json({ error: 'Invalid response from execution API' }, { status: 502 })
  }
}
