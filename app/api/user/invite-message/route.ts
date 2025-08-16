import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invite_message } = await req.json()
    if (typeof invite_message !== 'string') {
      return NextResponse.json({ error: 'invite_message must be a string' }, { status: 400 })
    }

    // Sanitize common copy-paste artifacts (quotes, postgres casts, code fences)
    const sanitized = sanitizeInviteMessage(invite_message)

    // Basic constraints
    const trimmed = sanitized.trim()
    if (trimmed.length === 0 || trimmed.length > 1000) {
      return NextResponse.json({ error: 'Invite message must be between 1 and 1000 characters' }, { status: 400 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ invite_message: trimmed })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save invite message' }, { status: 500 })
  }
}

// Remove leading/trailing quotes, code fences, casts, and normalize token
function sanitizeInviteMessage(raw: string): string {
  let s = String(raw)
  // Strip surrounding code fences ``` ... ```
  s = s.replace(/^```[\s\S]*?\n?/, '').replace(/```\s*$/, '')
  // Trim whitespace
  s = s.trim()
  // Remove leading/trailing single/double quotes (1-3)
  s = s.replace(/^['"`]{1,3}/, '').replace(/['"`]{1,3}$/, '')
  // Remove trailing Postgres casts like ::text or ::varchar
  s = s.replace(/(::[a-zA-Z_][a-zA-Z0-9_]*?)+\s*$/g, '')
  // Collapse doubled single quotes from SQL-escaped strings
  s = s.replace(/''/g, "'")
  // Ensure [link] token exists
  if (!s.includes('[link]')) {
    // If there is a URL, replace the first URL with [link]
    const urlRegex = /(https?:\/\/[^\s]+)/
    if (urlRegex.test(s)) {
      s = s.replace(urlRegex, '[link]')
    } else {
      // Append token if none found
      s = `${s} [link]`.trim()
    }
  }
  return s.trim()
}


