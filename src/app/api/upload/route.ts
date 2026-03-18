import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'

// Helper to get session from cookie
function getSession(request: NextRequest) {
  const cookie = request.cookies.get('admin-session')?.value
  if (!cookie) return null
  try {
    return JSON.parse(Buffer.from(cookie, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'member', 'tournament-pdf', 'tournament-logo', 'tournament-poster'
    const id = formData.get('id') as string | null // memberId or tournamentId

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate based on type
    const isPdf = file.type === 'application/pdf'
    const isImage = file.type.startsWith('image/')

    console.log('Upload request:', { type, fileType: file.type, fileSize: file.size, fileName: file.name })

    if (type === 'tournament-pdf') {
      if (!isPdf) {
        return NextResponse.json({ error: `File must be a PDF (got: ${file.type})` }, { status: 400 })
      }
      // Max 10MB for PDFs
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)` }, { status: 400 })
      }
    } else {
      if (!isImage) {
        return NextResponse.json({ error: `File must be an image (got: ${file.type})` }, { status: 400 })
      }
      // Max 2MB for images
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 2MB)` }, { status: 400 })
      }
    }

    // Generate filename based on type
    const ext = file.name.split('.').pop() || (isPdf ? 'pdf' : 'jpg')
    let filename: string

    switch (type) {
      case 'tournament-pdf':
        filename = id
          ? `tournaments/${id}/results.pdf`
          : `tournaments/${Date.now()}-results.pdf`
        break
      case 'tournament-logo':
        filename = id
          ? `tournaments/${id}/logo.${ext}`
          : `tournaments/${Date.now()}-logo.${ext}`
        break
      case 'tournament-poster':
        filename = id
          ? `tournaments/${id}/poster.${ext}`
          : `tournaments/${Date.now()}-poster.${ext}`
        break
      case 'member':
      default:
        filename = id
          ? `members/${id}.${ext}`
          : `members/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    }

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// DELETE endpoint to remove old images
export async function DELETE(request: NextRequest) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete failed:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
