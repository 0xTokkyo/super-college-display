import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { fetchPageById, createPage, updatePage } from '@/lib/pages'
import { getCurrentWeekMonday, getWeekDays } from '@/lib/dates'
import { addDays } from 'date-fns'
import type { DisplayPage, ProfAbsenceContent, ShowDocumentContent, PageContent } from '@/db/schema'
import ProfAbsenceEditor from '@/components/admin/editors/ProfAbsenceEditor'
import ShowDocumentEditor from '@/components/admin/editors/ShowDocumentEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, Loader2, Users, FileImage } from 'lucide-react'

type PageType = 'prof_absence' | 'show_document'

function defaultContent(type: PageType): PageContent {
  if (type === 'prof_absence') {
    const weekStart = getCurrentWeekMonday()
    const weekEnd = addDays(new Date(weekStart), 4).toISOString().split('T')[0]
    return { week_start: weekStart, week_end: weekEnd, absences: getWeekDays(weekStart).map(({ day, date }) => ({ day, date, teachers: [] })) } as ProfAbsenceContent
  }
  return { media_type: 'image', storage_path: '', public_url: '', caption: '' } as ShowDocumentContent
}

export default function PageEditorRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [page, setPage] = useState<Partial<DisplayPage> | null>(null)
  const [content, setContent] = useState<PageContent | null>(null)
  const [selectedType, setSelectedType] = useState<PageType>('prof_absence')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) {
      setPage({ title: '', isActive: true, durationSeconds: 20, order: 0 })
      setContent(defaultContent(selectedType))
      return
    }
    fetchPageById(id!).then(data => {
      setPage(data); setContent(data.content); setSelectedType(data.type); setLoading(false)
    }).catch(() => { toast.error('Page introuvable.'); navigate('/admin') })
  }, [id, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!content) return
    setSaving(true)
    try {
      isNew
        ? await createPage({ type: selectedType, title: page?.title ?? '', order: page?.order ?? 0, isActive: page?.isActive ?? true, durationSeconds: page?.durationSeconds ?? 20, content })
        : await updatePage(id!, { title: page?.title, isActive: page?.isActive, durationSeconds: page?.durationSeconds, content })
      toast.success('Page sauvegardée')
      navigate('/admin')
    } catch (err) {
      console.error(err)
      toast.error(`Erreur : ${err instanceof Error ? err.message : 'inconnue'}`)
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <span className="font-semibold text-sm flex-1">{isNew ? 'Nouvelle page' : 'Modifier la page'}</span>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />}
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* General settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Paramètres généraux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={page?.title ?? ''}
                onChange={e => setPage(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex : Absences semaine 8"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durée d'affichage (secondes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={300}
                  value={page?.durationSeconds ?? 20}
                  onChange={e => setPage(p => ({ ...p, durationSeconds: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-3">
                  <Switch
                    id="active"
                    checked={page?.isActive ?? true}
                    onCheckedChange={checked => setPage(p => ({ ...p, isActive: checked }))}
                  />
                  <Label htmlFor="active" className="cursor-pointer">Page active</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type selector (new only) */}
        {isNew && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Type de page</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { type: 'prof_absence' as PageType, label: 'Absences professeurs', desc: 'Tableau hebdomadaire des absences', Icon: Users },
                  { type: 'show_document' as PageType, label: 'Document / Média', desc: 'Image, PDF ou vidéo plein écran', Icon: FileImage },
                ] as const).map(({ type, label, desc, Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setSelectedType(type); setContent(defaultContent(type)) }}
                    className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedType === type
                        ? 'border-ring bg-accent/50'
                        : 'border-border hover:bg-accent/30'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${selectedType === type ? 'text-foreground' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contenu</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedType === 'prof_absence' && content && (
              <ProfAbsenceEditor initial={content as ProfAbsenceContent} onChange={setContent} />
            )}
            {selectedType === 'show_document' && (
              <ShowDocumentEditor initial={content as ShowDocumentContent} onChange={setContent} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
