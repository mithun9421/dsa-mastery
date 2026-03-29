import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.JDOODLE_CLIENT_ID
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET

export async function POST(req: NextRequest) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Missing JDOODLE_CLIENT_ID or JDOODLE_CLIENT_SECRET environment variables.' },
      { status: 503 }
    )
  }

  let body: { language: string; versionIndex: string; script: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        script: body.script,
        language: body.language,
        versionIndex: body.versionIndex,
      }),
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Network error reaching JDoodle: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 502 }
    )
  }

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message ?? `JDoodle API error ${res.status}` },
      { status: res.status }
    )
  }

  return NextResponse.json(data)
}
