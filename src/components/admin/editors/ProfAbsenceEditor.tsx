import { useState } from 'react'
import type { ProfAbsenceContent, DayAbsence, TeacherAbsence } from '@/db/schema'
import { getWeekDays, getCurrentWeekMonday } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  initial?: ProfAbsenceContent
  onChange: (content: ProfAbsenceContent) => void
}

function emptyContent(weekStart: string): ProfAbsenceContent {
  return { week_start: weekStart, absences: getWeekDays(weekStart).map(({ day, date }) => ({ day, date, teachers: [] })) }
}

export default function ProfAbsenceEditor({ initial, onChange }: Props) {
  const [content, setContent] = useState<ProfAbsenceContent>(initial ?? emptyContent(getCurrentWeekMonday()))

  function update(next: ProfAbsenceContent) { setContent(next); onChange(next) }

  function handleWeekChange(weekStart: string) {
    update({
      week_start: weekStart,
      absences: getWeekDays(weekStart).map(({ day, date }) => {
        const ex = content.absences.find(a => a.day === day)
        return ex ? { ...ex, date } : { day, date, teachers: [] }
      }),
    })
  }

  function addTeacher(di: number) {
    update({ ...content, absences: content.absences.map((da, i) => i !== di ? da : { ...da, teachers: [...da.teachers, { name: '', subject: '', replacement: '' }] }) })
  }

  function removeTeacher(di: number, ti: number) {
    update({ ...content, absences: content.absences.map((da, i) => i !== di ? da : { ...da, teachers: da.teachers.filter((_, j) => j !== ti) }) })
  }

  function updateTeacher(di: number, ti: number, field: keyof TeacherAbsence, value: string) {
    update({ ...content, absences: content.absences.map((da: DayAbsence, i: number) =>
      i !== di ? da : { ...da, teachers: da.teachers.map((t, j) => j !== ti ? t : { ...t, [field]: value }) }
    ) })
  }

  return (
    <div className="space-y-5">
      {/* Week picker */}
      <div className="flex items-center gap-3">
        <Label htmlFor="week" className="shrink-0">Semaine du lundi :</Label>
        <Input
          id="week"
          type="date"
          value={content.week_start}
          onChange={e => handleWeekChange(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Days */}
      <div className="space-y-3">
        {content.absences.map((dayEntry, di) => (
          <div key={dayEntry.date} className="rounded-lg border border-border overflow-hidden">
            {/* Day header */}
            <div className="flex items-center justify-between px-3 py-2 bg-secondary/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{dayEntry.day}</span>
                <span className="text-xs text-muted-foreground">{dayEntry.date}</span>
                {dayEntry.teachers.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1.5">
                    {dayEntry.teachers.length}
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addTeacher(di)}
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </Button>
            </div>

            {/* Teacher rows */}
            {dayEntry.teachers.length > 0 && (
              <div className="p-2 space-y-2 bg-card">
                {dayEntry.teachers.map((teacher, ti) => (
                  <div key={ti} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                    <Input
                      value={teacher.name}
                      onChange={e => updateTeacher(di, ti, 'name', e.target.value)}
                      placeholder="Professeur"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={teacher.subject}
                      onChange={e => updateTeacher(di, ti, 'subject', e.target.value)}
                      placeholder="Matière"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={teacher.replacement ?? ''}
                      onChange={e => updateTeacher(di, ti, 'replacement', e.target.value)}
                      placeholder="Remplaçant"
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeTeacher(di, ti)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
