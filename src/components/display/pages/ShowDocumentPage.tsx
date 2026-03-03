import type { DisplayPage, ShowDocumentContent } from '@/db/schema'
import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Props { page: DisplayPage }

export default function ShowDocumentPage({ page }: Props) {
  const content = page.content as ShowDocumentContent

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        {content.media_type === 'image' && (
          <img src={content.public_url} alt={content.caption ?? page.title} className="w-full h-full object-contain" />
        )}
        {content.media_type === 'pdf' && (
          <iframe src={`${content.public_url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-0" title={page.title} />
        )}
        {content.media_type === 'video' && (
          <video src={content.public_url} className="w-full h-full object-contain" autoPlay muted loop playsInline />
        )}

        {content.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-8 py-6">
            <p className="text-white text-base font-medium">{content.caption}</p>
          </div>
        )}

        {content.media_type === 'pdf' && (
          <div className="absolute top-3 right-3">
            <Badge variant="destructive" className="gap-1.5">
              <FileText className="h-3 w-3" /> PDF
            </Badge>
          </div>
        )}
      </div>

      {page.title && (
        <div className="bg-card border-t border-border px-8 py-2.5 shrink-0">
          <p className="text-sm font-medium text-foreground">{page.title}</p>
        </div>
      )}
    </div>
  )
}
