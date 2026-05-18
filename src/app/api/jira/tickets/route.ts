import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import type { Task, Priority, Status } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

const execFileAsync = promisify(execFile)
const ACLI = path.join(process.cwd(), 'acli.exe')

// Maps key prefix → readable project name
const PROJECT_NAMES: Record<string, string> = {
  BBB: 'B2B',
  ADMNAPI: 'AdminAPI',
}

function projectName(key: string): string {
  const prefix = key.split('-')[0]
  return PROJECT_NAMES[prefix] ?? prefix
}

function mapPriority(name: string | undefined): Priority {
  const p = (name || '').toLowerCase()
  if (p === 'highest' || p === 'urgent') return 'Urgent'
  if (p === 'high') return 'High'
  if (p === 'low' || p === 'lowest') return 'Low'
  return 'Medium'
}

function mapStatus(name: string | undefined): Status {
  const s = (name || '').toLowerCase()
  if (s.includes('progress') || s.includes('review')) return 'In Progress'
  if (s === 'done' || s === 'closed' || s === 'resolved') return 'Done'
  if (s === 'blocked' || s === 'rejected') return 'Blocked'
  return 'Todo'
}

export async function GET() {
  try {
    const jql = 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC'
    const { stdout, stderr } = await execFileAsync(ACLI, [
      'jira', 'workitem', 'search',
      '--jql', jql,
      '--limit', '50',
      '--json',
    ], { maxBuffer: 10 * 1024 * 1024 })

    if (!stdout || stdout.trim().length === 0) {
      return NextResponse.json({ error: 'acli returned empty output', stderr }, { status: 500 })
    }

    let issues: any[]
    try {
      issues = JSON.parse(stdout)
    } catch (parseErr: any) {
      return NextResponse.json({ error: 'Failed to parse acli JSON', detail: parseErr.message, raw: stdout.slice(0, 300) }, { status: 500 })
    }

    const tasks: Task[] = issues.map((issue) => {
      const f = issue.fields ?? {}
      return {
        id: issue.key,
        ticketNumber: issue.key,
        title: f.summary ?? '',
        project: projectName(issue.key),
        priority: mapPriority(f.priority?.name),
        status: mapStatus(f.status?.name),
        estimatedHours: 0,
        actualHoursSpent: 0,
        dueDate: undefined,
        tags: [f.issuetype?.name?.toLowerCase() ?? 'task'],
      }
    })

    return NextResponse.json(tasks)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stderr: err.stderr ?? null, code: err.code ?? null },
      { status: 500 }
    )
  }
}
