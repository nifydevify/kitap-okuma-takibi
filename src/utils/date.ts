/** Tüm tarih işlemleri yerel saate göre yapılır; toISOString() UTC kaydırması yapacağı için kullanılmaz. */

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function todayDateStr(): string {
  return dateToStr(new Date())
}

export function dateToStr(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function nowTimeStr(): string {
  const now = new Date()
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
}

export function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return monthKeyOf(date)
}

const MONTH_NAMES_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

export function monthKeyLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return `${MONTH_NAMES_TR[month - 1]} ${year}`
}

export function dateStrLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${day} ${MONTH_NAMES_TR[month - 1]} ${year}`
}

export function shortDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number)
  return `${day} ${MONTH_NAMES_TR[month - 1].slice(0, 3)}`
}

export function daysInMonthKey(monthKey: string): string[] {
  const [year, month] = monthKey.split('-').map(Number)
  const count = new Date(year, month, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${year}-${pad(month)}-${pad(i + 1)}`)
}
