import { NextResponse } from 'next/server'
import { fetchBurnRates } from '@/lib/supabase'

// Endpoint API zwracający zagregowane statystyki oszczędności spalania (burn rate)
// dla dzisiaj i wczoraj. Zwraca sumę oszczędności oraz średnie godzinowe.
export async function GET() {
  // Aktualna data i czas
  const now = new Date()
  // Początek dzisiejszego dnia (00:00)
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  // Początek wczorajszego dnia (00:00)
  const startYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)

  /**
   * Funkcja pomocnicza pobierająca i agregująca dane spalania w zadanym przedziale czasu.
   * Zwraca:
   *  - hourly: tablicę średnich wartości oszczędności dla każdej godziny
   *  - total: sumę wszystkich wartości minutowych z danego okresu
   *
   * @param start - początek zakresu (timestamp)
   * @param end - koniec zakresu (timestamp)
   */
  async function groupAndSum(start: Date, end: Date) {
    let rows: { timestamp: number; value: number }[] = []
    try {
      // Pobierz wszystkie rekordy spalania z danego okresu
      rows = await fetchBurnRates(start.getTime(), end.getTime())
    } catch (err) {
      console.error(err)
    }
    // Grupowanie wartości według godzin
    const map = new Map<number, number[]>()
    for (const r of rows) {
      const h = new Date(r.timestamp).getHours()
      const arr = map.get(h) || []
      arr.push(r.value)
      map.set(h, arr)
    }
    // Wylicz średnią wartość dla każdej godziny
    const hourly: { hour: number; avg: number }[] = []
    for (const [hour, vals] of map) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
      hourly.push({ hour, avg })
    }
    hourly.sort((a, b) => a.hour - b.hour)
    // Suma wszystkich wartości minutowych z danego okresu
    const total = rows.reduce((s, r) => s + r.value, 0)
    return { hourly, total }
  }

  // Oblicz statystyki dla dzisiaj i wczoraj
  const today = await groupAndSum(startToday, now)
  const yesterday = await groupAndSum(startYesterday, startToday)

  // Zwróć dane w formacie JSON
  return NextResponse.json({
    hourly: today.hourly,
    totalToday: today.total,
    totalYesterday: yesterday.total,
  })
}
