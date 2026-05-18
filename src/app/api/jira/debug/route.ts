import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

export const dynamic = 'force-dynamic'

const execFileAsync = promisify(execFile)

export async function GET() {
  const cwd = process.cwd()
  const acliLocal = path.join(cwd, 'acli.exe')
  const acliSystem = 'C:\\Windows\\System32\\acli.exe'

  const info: Record<string, any> = {
    cwd,
    acliLocal_exists: fs.existsSync(acliLocal),
    acliSystem_exists: fs.existsSync(acliSystem),
  }

  // Try local acli first, then system
  const acliPath = fs.existsSync(acliLocal) ? acliLocal : acliSystem
  info.acli_used = acliPath

  try {
    const ver = await execFileAsync(acliPath, ['--version'])
    info.version = ver.stdout.trim()
  } catch (e: any) {
    info.version_error = e.message
  }

  try {
    const auth = await execFileAsync(acliPath, ['jira', 'auth', 'status'])
    info.auth = auth.stdout.trim()
  } catch (e: any) {
    info.auth_error = e.message
    info.auth_stderr = e.stderr
  }

  try {
    const search = await execFileAsync(acliPath, [
      'jira', 'workitem', 'search',
      '--jql', 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC',
      '--limit', '2',
      '--json',
    ])
    info.search_stdout_length = search.stdout.length
    info.search_preview = search.stdout.slice(0, 200)
  } catch (e: any) {
    info.search_error = e.message
    info.search_stderr = e.stderr
  }

  return NextResponse.json(info, { status: 200 })
}
