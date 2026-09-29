import { getCollection, type CollectionEntry } from 'astro:content'
import { dateString } from '~/utils'

export async function getSortedNotes() {
  const notes = await getCollection('notes', ({ data }) => !data.draft)
  return notes.sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
}

interface NoteMonth {
  month: string
  notes: CollectionEntry<'notes'>[]
}

interface NoteYear {
  year: string
  count: number
  months: NoteMonth[]
}

export function groupNotesByDate(notes: CollectionEntry<'notes'>[]): NoteYear[] {
  const years = new Map<string, NoteYear>()

  for (const note of [...notes].sort(
    (a, b) => b.data.published.getTime() - a.data.published.getTime(),
  )) {
    // Use Taipei dates so entries near midnight stay in the displayed month.
    const [year, month] = dateString(note.data.published).split('-')
    let yearGroup = years.get(year)
    if (!yearGroup) {
      yearGroup = { year, count: 0, months: [] }
      years.set(year, yearGroup)
    }
    let monthGroup = yearGroup.months.find((group) => group.month === month)
    if (!monthGroup) {
      monthGroup = { month, notes: [] }
      yearGroup.months.push(monthGroup)
    }
    monthGroup.notes.push(note)
    yearGroup.count += 1
  }

  return [...years.values()]
}
