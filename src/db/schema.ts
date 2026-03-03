import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'

export const pageTypeEnum = pgEnum('page_type', [
  'prof_absence',
  'show_document',
])

// ─── Types for JSONB content ──────────────────────────────────────────────────

export type TeacherAbsence = {
  name: string
  subject: string
  replacement?: string
}

export type DayAbsence = {
  day: string
  date: string
  teachers: TeacherAbsence[]
}

export type ProfAbsenceContent = {
  week_start: string // ISO date: YYYY-MM-DD (Monday)
  absences: DayAbsence[]
}

export type ShowDocumentContent = {
  media_type: 'image' | 'pdf' | 'video'
  storage_path: string
  public_url: string
  caption?: string
}

export type PageContent = ProfAbsenceContent | ShowDocumentContent

// ─── Table ────────────────────────────────────────────────────────────────────

export const displayPages = pgTable('display_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: pageTypeEnum('type').notNull(),
  title: text('title').notNull(),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  durationSeconds: integer('duration_seconds').notNull().default(20),
  content: jsonb('content').$type<PageContent>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type DisplayPage = typeof displayPages.$inferSelect
export type NewDisplayPage = typeof displayPages.$inferInsert
