import { supabase } from './supabase'

const BUCKET = 'display-documents'

export type UploadResult = {
  path: string
  publicUrl: string
}

/**
 * Upload a file to Supabase Storage and return its path + public URL.
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `documents/${filename}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return {
    path,
    publicUrl: data.publicUrl,
  }
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

/**
 * Detect media type from file extension.
 */
export function detectMediaType(file: File): 'image' | 'pdf' | 'video' {
  const type = file.type
  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf') return 'pdf'
  if (type.startsWith('video/')) return 'video'
  throw new Error(`Type de fichier non supporté: ${type}`)
}
