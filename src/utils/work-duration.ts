function toMonthIndex(value: string): number {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) throw new Error(`Invalid year-month value: ${value}`)

  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) throw new Error(`Invalid year-month value: ${value}`)

  return year * 12 + month - 1
}

interface WorkPeriod {
  start: string
  end: string | null
}

function getWorkDurationMonths(
  start: string,
  end: string | null,
  currentDate: Date,
): number {
  const startMonth = toMonthIndex(start)
  const endMonth = end
    ? toMonthIndex(end)
    : currentDate.getFullYear() * 12 + currentDate.getMonth()
  const totalMonths = endMonth - startMonth + 1

  if (totalMonths < 1)
    throw new Error(`Work end date cannot precede start date: ${start}`)

  return totalMonths
}

function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return [years > 0 && `${years} 年`, months > 0 && `${months} 個月`]
    .filter(Boolean)
    .join(' ')
}

export function formatWorkDuration(
  start: string,
  end: string | null,
  currentDate = new Date(),
): string {
  return formatDuration(getWorkDurationMonths(start, end, currentDate))
}

export function formatWorkPeriodsDuration(
  periods: WorkPeriod[],
  currentDate = new Date(),
): string {
  const totalMonths = periods.reduce(
    (total, period) =>
      total + getWorkDurationMonths(period.start, period.end, currentDate),
    0,
  )
  return formatDuration(totalMonths)
}
