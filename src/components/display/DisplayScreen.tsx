import { useState, useEffect, useCallback, useRef } from 'react'
import type { DisplayPage } from '@/db/schema'
import { fetchActivePages } from '@/lib/pages'
import { supabase } from '@/lib/supabase'
import ProgressBar from './ProgressBar'
import ProfAbsencePage from './pages/ProfAbsencePage'
import ShowDocumentPage from './pages/ShowDocumentPage'
import { Loader2, Monitor } from 'lucide-react'

const TRANSITION_MS = 400

export default function DisplayScreen() {
  const [pages, setPages] = useState<DisplayPage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadPages = useCallback(async () => {
    try {
      const data = await fetchActivePages()
      setPages(data); setCurrentIndex(0); setError(null)
    } catch (err) {
      setError('Impossible de charger les pages.'); console.error(err)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadPages() }, [loadPages])

  useEffect(() => {
    const channel = supabase
      .channel('display_pages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'display_pages' }, () => loadPages())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadPages])

  const goToNext = useCallback(() => {
    if (pages.length <= 1) return
    setIsTransitioning(true)
    setTimeout(() => { setCurrentIndex(p => (p + 1) % pages.length); setIsTransitioning(false) }, TRANSITION_MS)
  }, [pages.length])

  useEffect(() => {
    if (pages.length === 0) return
    const ms = (pages[currentIndex]?.durationSeconds ?? 20) * 1000
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(goToNext, ms)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [currentIndex, pages, goToNext])

  const navTo = (i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsTransitioning(true)
    setTimeout(() => { setCurrentIndex(i); setIsTransitioning(false) }, TRANSITION_MS)
  }

  if (loading) return (
    <div className="w-screen h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )

  if (error) return (
    <div className="w-screen h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center px-8">
        <Monitor className="h-10 w-10 text-destructive/60" />
        <p className="font-medium">Erreur de connexion</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    </div>
  )

  if (pages.length === 0) return (
    <div className="w-screen h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Monitor className="h-12 w-12 text-muted-foreground/30" />
      <div className="text-center">
        <p className="font-medium">Aucune page active</p>
        <p className="text-sm text-muted-foreground mt-1">Ajoutez des pages depuis le panneau d'administration.</p>
      </div>
      <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Accéder à l'administration →
      </a>
    </div>
  )

  const currentPage = pages[currentIndex]

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-background">
      <ProgressBar durationSeconds={currentPage.durationSeconds} animationKey={`${currentPage.id}-${currentIndex}`} />

      <div
        className="flex-1 overflow-hidden"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: `opacity ${TRANSITION_MS}ms ease`,
        }}
      >
        <PageRenderer page={currentPage} />
      </div>

      {pages.length > 1 && (
        <div className="h-8 flex items-center justify-center gap-1.5 bg-background border-t border-border shrink-0">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => navTo(i)}
              className={`rounded-full border-none cursor-pointer h-1 transition-all duration-300 ${
                i === currentIndex ? 'w-5 bg-primary' : 'w-1 bg-border hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PageRenderer({ page }: { page: DisplayPage }) {
  switch (page.type) {
    case 'prof_absence':  return <ProfAbsencePage page={page} />
    case 'show_document': return <ShowDocumentPage page={page} />
    default: return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        Type inconnu : {page.type}
      </div>
    )
  }
}
