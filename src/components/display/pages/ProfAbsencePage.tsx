import type { DisplayPage, ProfAbsenceContent, DayAbsence } from '@/db/schema'
import { formatDateShortFr } from '@/lib/dates'
import { addDays } from 'date-fns'
import { ArrowRight } from 'lucide-react'

interface Props { page: DisplayPage }

export default function ProfAbsencePage({ page }: Props) {
  const content = page.content as ProfAbsenceContent
  const days = (content.absences ?? []).filter(Boolean)

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      <header className="flex items-center justify-between px-8 py-4 bg-card border-b border-border shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {page.title || 'Absences des professeurs'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Semaine du {formatDateShortFr(content.week_start)} au {formatDateShortFr(addDays(new Date(content.week_start), 4).toISOString().split('T')[0])}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Collège</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">Jacques Prévert</p>
        </div>
      </header>

      <div className="flex-1 p-2 overflow-hidden">
        {days.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Aucune absence signalée cette semaine</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 h-full">
            {days.map((d: DayAbsence) => <DayColumn key={d.date} dayEntry={d} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function DayColumn({ dayEntry }: { dayEntry: DayAbsence }) {
  const hasAbsences = dayEntry.teachers?.length > 0

  return (
    <div className="flex flex-col rounded-sm border border-border bg-card overflow-hidden">
      <div className={`px-3 py-2 border-b border-border text-center shrink-0 ${hasAbsences ? 'bg-secondary' : 'bg-card'}`}>
        <p className="text-lg font-semibold uppercase tracking-wider text-foreground">{dayEntry.day}</p>
        <p className="text-sm text-foreground mt-0.5">{formatDateShortFr(dayEntry.date)}</p>
      </div>

      <div className="flex-1 overflow-hidden">
        {!hasAbsences ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground/40 text-sm">—</span>
          </div>
        ) : dayEntry.teachers.map((teacher, i) => (
          <div key={i} className="p-2 border-b border-border">
            <p className="text-lg font-bold text-foreground leading-tight">{teacher.name}</p>
            {teacher.subject && <p className="text-md font-semibold text-muted-foreground mt-0.5">{teacher.subject}</p>}
            {teacher.replacement && (
              <p className="text-sm text-green-500 flex items-center gap-1 mt-1">
                <ArrowRight className="h-2.5 w-2.5 shrink-0" /> {teacher.replacement}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
