import { useState, useRef } from 'react'
import type { ShowDocumentContent } from '@/db/schema'
import { uploadFile, detectMediaType } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, ImageIcon, Video, X, Loader2 } from 'lucide-react'

interface Props {
  initial?: ShowDocumentContent
  onChange: (content: ShowDocumentContent) => void
}

const MEDIA_ICONS = {
  image: ImageIcon,
  pdf: FileText,
  video: Video,
}

export default function ShowDocumentEditor({ initial, onChange }: Props) {
  const [content, setContent] = useState<Partial<ShowDocumentContent>>(initial ?? {})
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update(next: Partial<ShowDocumentContent>) {
    const merged = { ...content, ...next }
    setContent(merged)
    if (merged.media_type && merged.storage_path && merged.public_url) onChange(merged as ShowDocumentContent)
  }

  async function handleFile(file: File) {
    setUploadError(null); setUploading(true)
    try {
      const mediaType = detectMediaType(file)
      const result = await uploadFile(file)
      update({ media_type: mediaType, storage_path: result.path, public_url: result.publicUrl })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors de l'upload")
    } finally { setUploading(false) }
  }

  function clearFile() {
    setContent(prev => ({ caption: prev.caption }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const MediaIcon = content.media_type ? MEDIA_ICONS[content.media_type] : null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Fichier</Label>

        {content.public_url ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="h-40 flex items-center justify-center bg-black">
              {content.media_type === 'image' && (
                <img src={content.public_url} alt="Aperçu" className="max-h-full max-w-full object-contain" />
              )}
              {content.media_type === 'pdf' && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileText className="h-10 w-10 text-destructive/70" />
                  <span className="text-xs">PDF chargé</span>
                </div>
              )}
              {content.media_type === 'video' && (
                <video src={content.public_url} className="max-h-full max-w-full" controls muted />
              )}
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {MediaIcon && <MediaIcon className="h-4 w-4" />}
                <span className="capitalize">{content.media_type}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearFile}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-ring bg-accent/30' : 'border-border hover:border-muted-foreground/50 hover:bg-accent/20'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload en cours…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Déposez un fichier ou cliquez</p>
                  <p className="text-xs text-muted-foreground mt-1">Images · PDF · Vidéo (MP4, WebM)</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,video/*"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        )}

        {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Légende (optionnel)</Label>
        <Input
          id="caption"
          value={content.caption ?? ''}
          onChange={e => update({ caption: e.target.value })}
          placeholder="Texte affiché en bas de l'écran…"
        />
      </div>
    </div>
  )
}
