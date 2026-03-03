import { supabase } from './supabase'
import type { DisplayPage, NewDisplayPage } from '../db/schema'

const TABLE = 'display_pages'

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function fetchActivePages(): Promise<DisplayPage[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) throw error
  return (data ?? []) as DisplayPage[]
}

export async function fetchAllPages(): Promise<DisplayPage[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('order', { ascending: true })

  if (error) throw error
  return (data ?? []) as DisplayPage[]
}

export async function fetchPageById(id: string): Promise<DisplayPage> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as DisplayPage
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createPage(page: Omit<NewDisplayPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<DisplayPage> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      type: page.type,
      title: page.title,
      order: page.order ?? 0,
      is_active: page.isActive ?? true,
      duration_seconds: page.durationSeconds ?? 20,
      content: page.content,
    })
    .select()
    .single()

  if (error) throw error
  return data as DisplayPage
}

export async function updatePage(id: string, updates: Partial<Omit<NewDisplayPage, 'id' | 'createdAt'>>): Promise<DisplayPage> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      ...(updates.durationSeconds !== undefined && { duration_seconds: updates.durationSeconds }),
      ...(updates.content !== undefined && { content: updates.content }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as DisplayPage
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function reorderPages(orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, index) => ({ id, order: index }))
  // upsert with onConflict on id to only update the order column
  const { error } = await supabase
    .from(TABLE)
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}

export async function togglePageActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
