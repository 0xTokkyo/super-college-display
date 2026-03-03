import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import type { DisplayPage } from '@/db/schema'
import { fetchAllPages, togglePageActive, deletePage, reorderPages } from '@/lib/pages'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Monitor, Plus, GripVertical, Pencil, Trash2, LogOut,
  Users, FileImage, Eye, EyeOff, Loader2, ExternalLink,
} from 'lucide-react'

const TYPE_META = {
  prof_absence: { label: 'Absences', icon: Users },
  show_document: { label: 'Média', icon: FileImage },
} as const

export default function DashboardPage() {
  const navigate = useNavigate()
  const [pages, setPages] = useState<DisplayPage[]>([])
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = useCallback(async () => {
    try { setPages(await fetchAllPages()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const reordered = arrayMove(pages, pages.findIndex(p => p.id === active.id), pages.findIndex(p => p.id === over.id))
    setPages(reordered)
    await reorderPages(reordered.map(p => p.id))
  }

  async function handleToggle(id: string, current: boolean) {
    setPages(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p))
    await togglePageActive(id, !current)
    toast.success(current ? 'Page masquée' : 'Page rendue visible')
  }

  async function handleDelete(id: string) {
    await deletePage(id)
    setPages(prev => prev.filter(p => p.id !== id))
    toast.success('Page supprimée')
  }

  const activeCount = pages.filter(p => p.isActive).length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Administration</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Aperçu TV
            </a>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => { await signOut(); navigate('/admin/login') }}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-base">Pages d'affichage</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeCount} visible{activeCount !== 1 ? 's' : ''} · {pages.length} au total
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/admin/pages/new')}>
            <Plus className="h-4 w-4" />
            Nouvelle page
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border rounded-lg text-muted-foreground">
            <Monitor className="h-8 w-8 opacity-30" />
            <div className="text-center">
              <p className="font-medium text-sm">Aucune page créée</p>
              <p className="text-xs mt-1">Cliquez sur "Nouvelle page" pour commencer.</p>
            </div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {pages.map(page => (
                  <SortablePageRow
                    key={page.id}
                    page={page}
                    onToggle={handleToggle}
                    onEdit={() => navigate(`/admin/pages/${page.id}`)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  )
}

interface RowProps {
  page: DisplayPage
  onToggle: (id: string, current: boolean) => void
  onEdit: () => void
  onDelete: (id: string) => void
}

function SortablePageRow({ page, onToggle, onEdit, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })
  const meta = TYPE_META[page.type as keyof typeof TYPE_META]
  const Icon = meta?.icon ?? Monitor

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card transition-colors ${isDragging ? 'opacity-80 shadow-md' : 'hover:bg-accent/30'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Badge variant="secondary" className="gap-1.5 flex-shrink-0">
        <Icon className="h-3 w-3" />
        {meta?.label}
      </Badge>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{page.title || '(Sans titre)'}</p>
        <p className="text-xs text-muted-foreground">{page.durationSeconds}s</p>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 text-xs flex-shrink-0 ${page.isActive ? 'text-green-500 hover:text-green-400' : 'text-muted-foreground'}`}
            onClick={() => onToggle(page.id, page.isActive)}
          >
            {page.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {page.isActive ? 'Visible' : 'Masquée'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{page.isActive ? 'Masquer la page' : 'Rendre visible'}</TooltipContent>
      </Tooltip>

      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onEdit}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la page ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La page "{page.title || 'Sans titre'}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(page.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
