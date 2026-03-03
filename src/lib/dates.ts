/**
 * Get the Monday (start) of the current week in ISO format (YYYY-MM-DD).
 */
export function getCurrentWeekMonday(): string {
  const today = new Date()
  const day = today.getDay() // 0 = Sunday, 1 = Monday...
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split('T')[0]
}

/**
 * Build the 5 working days of the week given a Monday date string.
 */
export const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

export function getWeekDays(mondayStr: string): { day: string; date: string }[] {
  const monday = new Date(mondayStr)
  return DAYS_FR.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      day,
      date: d.toISOString().split('T')[0],
    }
  })
}

/**
 * Format a date string (YYYY-MM-DD) to French locale display.
 */
export function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/**
 * Format a date string (YYYY-MM-DD) short: "lun. 24 fév."
 */
export function formatDateShortFr(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
