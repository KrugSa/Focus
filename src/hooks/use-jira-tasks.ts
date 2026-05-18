'use client'

import * as React from 'react'
import type { Task } from '@/lib/mock-data'

export function useJiraTasks() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch('/api/jira/tickets')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(`Jira API returned ${res.status}: ${JSON.stringify(body)}`)
        }
        return res.json()
      })
      .then((data: Task[]) => {
        setTasks(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        console.error('useJiraTasks error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { tasks, setTasks, loading, error }
}
