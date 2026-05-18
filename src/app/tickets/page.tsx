"use client"

import * as React from "react"
import { Task, Priority, Status } from "@/lib/mock-data"
import { useJiraTasks } from "@/hooks/use-jira-tasks"
import { useTodayTickets, MAX_TODAY } from "@/hooks/use-today-tickets"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Filter,
  Search,
  ArrowUpCircle,
  Circle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Pin,
  PinOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_ORDER: Record<Status, number> = {
  "In Progress": 0,
  "Todo": 1,
  "Blocked": 2,
  "Done": 3,
}

const PRIORITY_ORDER: Record<Priority, number> = {
  "Urgent": 0,
  "High": 1,
  "Medium": 2,
  "Low": 3,
}

const statusConfig: Record<Status, { icon: React.ReactNode; color: string; bg: string }> = {
  "In Progress": {
    icon: <ArrowUpCircle className="w-3.5 h-3.5" />,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
  },
  "Todo": {
    icon: <Circle className="w-3.5 h-3.5" />,
    color: "text-muted-foreground",
    bg: "bg-secondary/20 border-border/50",
  },
  "Blocked": {
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
  },
  "Done": {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/20",
  },
}

const priorityVariant: Record<Priority, "destructive" | "default" | "secondary" | "outline"> = {
  "Urgent": "destructive",
  "High": "default",
  "Medium": "secondary",
  "Low": "outline",
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (statusDiff !== 0) return statusDiff
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  })
}

export default function TicketsPage() {
  const { tasks, loading } = useJiraTasks()
  const { addToday, removeToday, isToday, count, hydrated } = useTodayTickets()
  const [search, setSearch] = React.useState("")
  const [completedIds, setCompletedIds] = React.useState<string[]>([])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("focus-completed-tickets")
      if (stored) {
        const parsed = JSON.parse(stored) as { ticketId: string }[]
        setCompletedIds(parsed.map(e => e.ticketId))
      }
    } catch {}
  }, [])

  const filteredTasks = sortTasks(
    tasks.filter(t =>
      !completedIds.includes(t.id) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()))
    )
  )

  const inProgressCount = tasks.filter(t => t.status === "In Progress").length
  const isFull = count >= MAX_TODAY

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading
              ? "Cargando tickets de Jira…"
              : `${tasks.length} tickets · ${inProgressCount} en progreso`}
          </p>
        </div>
        {hydrated && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 bg-card/20">
            <Pin className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">
              {count}/{MAX_TODAY} para hoy
            </span>
            {isFull && <Badge variant="destructive" className="text-[9px] h-4 px-1">Lleno</Badge>}
          </div>
        )}
      </header>

      <div className="flex items-center gap-4 bg-card/20 p-2 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por título o número de ticket…"
            className="pl-10 h-10 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm" className="gap-2 h-9 text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {loading ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-card/40 border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground text-sm">No se encontraron tickets.</div>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
        >
          {filteredTasks.map((task) => {
            const cfg = statusConfig[task.status]
            const pinned = isToday(task.id)
            return (
              <div
                key={task.id}
                className={cn(
                  "group relative flex flex-col gap-2 p-3 rounded-xl border transition-all",
                  pinned
                    ? "border-primary/40 bg-primary/8 shadow-[0_0_10px_rgba(88,166,255,0.1)]"
                    : `${cfg.bg} hover:scale-[1.02] hover:shadow-lg`
                )}
              >
                {/* Pin indicator */}
                {pinned && (
                  <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                )}

                {/* Top row: ticket + priority */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground pl-2">{task.ticketNumber}</span>
                  <Badge
                    variant={priorityVariant[task.priority]}
                    className="text-[8px] h-4 px-1.5 leading-none"
                  >
                    {task.priority}
                  </Badge>
                </div>

                {/* Title */}
                <p className="text-[11px] font-semibold leading-snug line-clamp-3 flex-1">
                  {task.title}
                </p>

                {/* Bottom row: status + project */}
                <div className="flex items-center justify-between pt-1 border-t border-border/20">
                  <div className={`flex items-center gap-1 ${cfg.color}`}>
                    {cfg.icon}
                    <span className="text-[9px] font-medium">{task.status}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground truncate max-w-[50px]">{task.project}</span>
                </div>

                {/* Action row */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={() => pinned ? removeToday(task.id) : addToday(task.id)}
                    disabled={!pinned && isFull}
                    className={cn(
                      "flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-all",
                      pinned
                        ? "border-primary/40 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                        : isFull
                          ? "border-border/30 text-muted-foreground/40 cursor-not-allowed"
                          : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    {pinned ? (
                      <><PinOff className="w-2.5 h-2.5" /> Quitar</>
                    ) : (
                      <><Pin className="w-2.5 h-2.5" /> {isFull ? "Lleno" : "Al día"}</>
                    )}
                  </button>

                  <a
                    href={`https://payevo.atlassian.net/browse/${task.ticketNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

