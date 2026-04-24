export async function uploadToCloudinary(file) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  const formData = new FormData()
  formData.append('file', dataUri)
  formData.append('upload_preset', 'diffuse_products')
  formData.append('folder', 'diffuse')

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    throw new Error('Cloudinary upload failed')
  }

  const data = await res.json()
  return data.secure_url
}

export async function uploadToCloudinaryAuth(file) {
  const crypto = await import('crypto')
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'diffuse'

  const toSign = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`
  const signature = crypto.createHash('sha1').update(toSign).digest('hex')

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  const formData = new FormData()
  formData.append('file', dataUri)
  formData.append('api_key', process.env.CLOUDINARY_API_KEY)
  formData.append('timestamp', String(timestamp))
  formData.append('folder', folder)
  formData.append('signature', signature)

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudinary upload failed: ${err}`)
  }

  const data = await res.json()
  return data.secure_url
}
