import { NextResponse } from 'next/server'
import { uploadToCloudinaryAuth } from '../../../lib/cloudinary.js'

export async function POST(request) {
  const role = request.headers.get('x-user-role')
  if (!['seller', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const urls = await Promise.all(
      files.slice(0, 5).map(file => uploadToCloudinaryAuth(file))
    )

    return NextResponse.json({ urls })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed: ' + err.message }, { status: 500 })
  }
}
