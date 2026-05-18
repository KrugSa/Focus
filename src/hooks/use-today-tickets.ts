"use client"
import * as React from "react"

const STORAGE_KEY = "focus-today-ids"
export const MAX_TODAY = 5

export function useTodayTickets() {
  const [todayIds, setTodayIds] = React.useState<string[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) setTodayIds(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  const save = (ids: string[]) => {
    setTodayIds(ids)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }

  const addToday = (id: string) => {
    if (todayIds.includes(id) || todayIds.length >= MAX_TODAY) return
    save([...todayIds, id])
  }

  const removeToday = (id: string) => save(todayIds.filter(i => i !== id))

  const isToday = (id: string) => todayIds.includes(id)

  return { todayIds, addToday, removeToday, isToday, count: todayIds.length, hydrated }
}
