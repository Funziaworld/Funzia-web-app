import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Placeholder for OAuth-style installs. Loyverse often uses long-lived Access Tokens
 * from Back Office instead; store tokens in `loyverse_integration_state` when you add the exchange.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
  if (!code) {
    return NextResponse.json({ error: 'missing code' }, { status: 400 })
  }
  return NextResponse.json({
    message:
      'Loyverse OAuth callback received. Configure token exchange or use LOYVERSE_ACCESS_TOKEN from Back Office.',
    hasCode: true,
  })
}
