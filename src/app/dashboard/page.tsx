
"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  Play, Pause, RotateCcw, Clock, AlertTriangle,
  CheckCircle2, ArrowUpCircle, Circle, XCircle, ExternalLink,
  PlusCircle, Plus, Bug, Users, ClipboardList, History, Layout, Pin,
  Trophy, Timer
} from "lucide-react"
import { Priority, Status } from "@/lib/mock-data"
import { useJiraTasks } from "@/hooks/use-jira-tasks"
import { useTodayTickets, MAX_TODAY } from "@/hooks/use-today-tickets"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const DAILY_LIMIT = 8 * 3600

type LogEntry = {
  id: string
  title: string
  type: "bug" | "meeting" | "task"
  durationMin: number
  loggedAt: string
}

type CompletedTicket = {
  id: string
  ticketId: string
  ticketNumber: string
  title: string
  project: string
  priority: Priority
  realDurationMin: number
  loggedDurationMin: number
  completedAt: string
}

const LOG_KEY = "focus-quick-log"
const COMPLETED_KEY = "focus-completed-tickets"
const TIMER_KEY = "focus-ticket-timers"

const priorityBadge: Record<Priority, string> = {
  Urgent: "bg-destructive/20 text-destructive border-destructive/30",
  High:   "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Medium: "bg-primary/20 text-primary border-primary/30",
  Low:    "bg-muted text-muted-foreground border-border",
}

const statusIcon: Record<Status, React.ReactNode> = {
  "In Progress": <ArrowUpCircle className="w-3 h-3 text-primary" />,
  "Todo":        <Circle className="w-3 h-3 text-muted-foreground" />,
  "Blocked":     <XCircle className="w-3 h-3 text-destructive" />,
  "Done":        <CheckCircle2 className="w-3 h-3 text-green-500" />,
}

export default function FocusDashboard() {
  const { tasks: jiraTasks, loading } = useJiraTasks()
  const { todayIds, removeToday, hydrated } = useTodayTickets()
  const [activeTicketId, setActiveTicketId] = React.useState<string>("")
  const [isRunning, setIsRunning] = React.useState(false)
  const [chronoSec, setChronoSec] = React.useState(0)
  const [dailySec, setDailySec] = React.useState(0)

  // Per-ticket saved times — ref for sync reads, state for card badges
  const ticketTimersRef = React.useRef<Record<string, number>>({})
  const [ticketTimers, setTicketTimers] = React.useState<Record<string, number>>({})

  // Quick entry state
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [newTitle, setNewTitle] = React.useState("")
  const [newType, setNewType] = React.useState<"bug" | "meeting" | "task">("task")
  const [newDuration, setNewDuration] = React.useState("30")

  // Completed tickets state
  const [completed, setCompleted] = React.useState<CompletedTicket[]>([])
  const [completeDialog, setCompleteDialog] = React.useState<{ taskId: string } | null>(null)
  const [loggedMin, setLoggedMin] = React.useState("60")

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem(LOG_KEY)
      if (stored) setLogs(JSON.parse(stored))
      const storedCompleted = sessionStorage.getItem(COMPLETED_KEY)
      if (storedCompleted) setCompleted(JSON.parse(storedCompleted))
      const storedTimers = sessionStorage.getItem(TIMER_KEY)
      if (storedTimers) {
        const parsed = JSON.parse(storedTimers)
        ticketTimersRef.current = parsed
        setTicketTimers(parsed)
      }
    } catch {}
  }, [])

  React.useEffect(() => {
    if (!hydrated || todayIds.length === 0) return
    setActiveTicketId(prev => {
      const id = prev && todayIds.includes(prev) ? prev : todayIds[0]
      setChronoSec(ticketTimersRef.current[id] ?? 0)
      return id
    })
  }, [hydrated, todayIds])

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setChronoSec(s => {
          const next = s + 1
          ticketTimersRef.current = { ...ticketTimersRef.current, [activeTicketId]: next }
          sessionStorage.setItem(TIMER_KEY, JSON.stringify(ticketTimersRef.current))
          setTicketTimers({ ...ticketTimersRef.current })
          return next
        })
        setDailySec(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, activeTicketId])

  const fmt = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, "0")
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0")
    const s = Math.floor(sec % 60).toString().padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const entry: LogEntry = {
      id: Math.random().toString(36).slice(2),
      title: newTitle.trim(),
      type: newType,
      durationMin: parseInt(newDuration) || 0,
      loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    const updated = [entry, ...logs]
    setLogs(updated)
    sessionStorage.setItem(LOG_KEY, JSON.stringify(updated))
    setDailySec(s => s + entry.durationMin * 60)
    setNewTitle("")
    setNewDuration("30")
  }

  const totalLoggedMin = logs.reduce((acc, l) => acc + l.durationMin, 0)

  const todayTasks = jiraTasks.filter(t => todayIds.includes(t.id))
  const activeTask = todayTasks.find(t => t.id === activeTicketId)

  const handleOpenComplete = (taskId: string) => {
    const realMin = Math.round(chronoSec / 60)
    const suggested = realMin < 60 ? "60" : String(realMin)
    setLoggedMin(suggested)
    setCompleteDialog({ taskId })
    setIsRunning(false)
  }

  const handleSwitchTicket = (newId: string) => {
    setIsRunning(false)
    setActiveTicketId(newId)
    setChronoSec(ticketTimersRef.current[newId] ?? 0)
  }

  const handleConfirmComplete = () => {
    if (!completeDialog) return
    const task = todayTasks.find(t => t.id === completeDialog.taskId)
    if (!task) return
    const realMin = Math.round(chronoSec / 60)
    const logged = parseInt(loggedMin) || 0
    const entry: CompletedTicket = {
      id: Math.random().toString(36).slice(2),
      ticketId: task.id,
      ticketNumber: task.ticketNumber ?? "",
      title: task.title,
      project: task.project,
      priority: task.priority,
      realDurationMin: realMin,
      loggedDurationMin: logged,
      completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    const updated = [entry, ...completed]
    setCompleted(updated)
    sessionStorage.setItem(COMPLETED_KEY, JSON.stringify(updated))
    setDailySec(s => s + logged * 60)
    removeToday(task.id)
    // Clear saved timer for this ticket
    delete ticketTimersRef.current[task.id]
    sessionStorage.setItem(TIMER_KEY, JSON.stringify(ticketTimersRef.current))
    setTicketTimers({ ...ticketTimersRef.current })
    if (activeTicketId === task.id) {
      setActiveTicketId("")
      setChronoSec(0)
    }
    setCompleteDialog(null)
  }

  const dailyPct = Math.min((dailySec / DAILY_LIMIT) * 100, 100)
  const isOver = dailySec >= DAILY_LIMIT

  return (
    <div className="space-y-6">
      {/* Hero section: capacity (left) + timer (right) */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-stretch">

        {/* Daily capacity — compact left card */}
        <Card className={cn(
          "border-border/50 bg-card flex flex-col justify-between",
          isOver && "border-destructive/40 bg-destructive/5"
        )}>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
              Capacidad Diaria
              {isOver && <AlertTriangle className="w-3 h-3 text-destructive" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3 flex-1 flex flex-col justify-end">
            <div>
              <span className="font-headline text-3xl font-bold tabular-nums">{fmt(dailySec)}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">/ 08:00:00</p>
            </div>
            <Progress
              value={dailyPct}
              className={cn("h-2 bg-secondary", isOver ? "[&>div]:bg-destructive" : "[&>div]:bg-primary/70")}
            />
            <p className={cn("text-[10px] font-medium", isOver ? "text-destructive" : "text-muted-foreground")}>
              {isOver
                ? "⚠ Límite alcanzado — descansa."
                : `${Math.max(0, Math.floor((DAILY_LIMIT - dailySec) / 3600))}h ${Math.floor(((DAILY_LIMIT - dailySec) % 3600) / 60)}m restantes`}
            </p>
          </CardContent>
        </Card>

        {/* Big timer — main card */}
        <Card className={cn(
          "border-primary/20 bg-primary/5 transition-all",
          isRunning && "border-primary/50 shadow-[0_0_40px_rgba(88,166,255,0.12)]"
        )}>
          <CardContent className="px-8 py-8 flex flex-col items-center gap-5">
            {/* Active ticket info */}
            <div className="text-center space-y-1">
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isRunning ? "text-primary" : "text-muted-foreground"
              )}>
                <Clock className="inline w-3 h-3 mr-1 -mt-0.5" />
                {isRunning ? "Sesión activa" : "Sesión pausada"}
              </p>
              {activeTask ? (
                <>
                  <p className="font-mono text-xs text-muted-foreground">{activeTask.ticketNumber}</p>
                  <p className="text-base font-semibold max-w-lg">{activeTask.title}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Selecciona un ticket abajo para comenzar</p>
              )}
            </div>

            {/* Big clock */}
            <span
              className={cn(
                "font-headline font-black tabular-nums tracking-tight leading-none transition-colors select-none",
                isRunning ? "text-primary" : "text-foreground/80"
              )}
              style={{ fontSize: "clamp(4rem, 12vw, 8rem)" }}
            >
              {fmt(chronoSec)}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                variant={isRunning ? "secondary" : "default"}
                className="gap-2 px-8 h-11 text-sm font-semibold"
                disabled={!activeTask}
                onClick={() => setIsRunning(r => !r)}
              >
                {isRunning ? <><Pause className="w-4 h-4" /> Pausar</> : <><Play className="w-4 h-4" /> Iniciar</>}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-11 w-11"
                onClick={() => {
                  setIsRunning(false)
                  setChronoSec(0)
                  if (activeTicketId) {
                    delete ticketTimersRef.current[activeTicketId]
                    sessionStorage.setItem(TIMER_KEY, JSON.stringify(ticketTimersRef.current))
                    setTicketTimers({ ...ticketTimersRef.current })
                  }
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Tabs: Tickets del día / Quick Entry / Time Logs */}
      <Tabs defaultValue="focus" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card border border-border/50 p-1 h-11">
          <TabsTrigger value="focus" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
            <Layout className="w-3.5 h-3.5" /> Tickets del Día
            <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1">{todayIds.length}/{MAX_TODAY}</Badge>
          </TabsTrigger>
          <TabsTrigger value="quick" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
            <Plus className="w-3.5 h-3.5" /> Entrada Rápida
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
            <History className="w-3.5 h-3.5" /> Registro
            {logs.length > 0 && <Badge variant="outline" className="ml-1 text-[9px] h-4 px-1">{logs.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5 text-xs data-[state=active]:bg-secondary">
            <Trophy className="w-3.5 h-3.5" /> Completados
            {completed.length > 0 && <Badge variant="outline" className="ml-1 text-[9px] h-4 px-1 border-green-500/40 text-green-400">{completed.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* --- Tickets del Día --- */}
        <TabsContent value="focus" className="pt-4 space-y-3">
          <div className="flex items-center justify-end">
            <Link href="/tickets">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <PlusCircle className="w-3.5 h-3.5" />
                Agregar tickets
              </Button>
            </Link>
          </div>

          {!loading && todayIds.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-14 border border-dashed border-border/40 rounded-2xl text-center">
              <span className="text-3xl">📋</span>
              <p className="text-sm font-semibold">No hay tickets para hoy</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Ve a <strong>Tickets</strong> y usa el botón 📌 para agregar hasta {MAX_TODAY} tickets.
              </p>
              <Link href="/tickets">
                <Button size="sm" className="mt-1 gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" /> Ir a Tickets
                </Button>
              </Link>
            </div>
          )}

          {loading && todayIds.length > 0 && (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {todayIds.map(id => (
                <div key={id} className="h-24 rounded-xl bg-card/40 border border-border/50 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && todayTasks.length > 0 && (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {todayTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleSwitchTicket(task.id)}
                  className={cn(
                    "group relative flex flex-col gap-2.5 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]",
                    activeTicketId === task.id
                      ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(88,166,255,0.2)]"
                      : "border-border/50 bg-card/60 hover:border-border hover:bg-card/80"
                  )}
                >
                  {activeTicketId === task.id && (
                    <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[9px] text-muted-foreground">{task.ticketNumber}</span>
                    <div className="flex items-center gap-1.5">
                      {(ticketTimers[task.id] ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-[8px] font-mono text-primary/70">
                          <Timer className="w-2.5 h-2.5" />
                          {Math.floor((ticketTimers[task.id] ?? 0) / 60)}m
                        </span>
                      )}
                      <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border font-semibold", priorityBadge[task.priority])}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-[12px] font-semibold leading-snug line-clamp-2 flex-1">{task.title}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/20">
                    <div className="flex items-center gap-1">
                      {statusIcon[task.status]}
                      <span className="text-[9px] text-muted-foreground">{task.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground">{task.project}</span>
                      <button
                        onClick={e => { e.stopPropagation(); removeToday(task.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive text-[9px]"
                        title="Quitar del día"
                      >✕</button>
                      <button
                        onClick={e => { e.stopPropagation(); handleOpenComplete(task.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-green-400"
                        title="Marcar como completado"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`https://payevo.atlassian.net/browse/${task.ticketNumber}`}
                        target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- Quick Entry --- */}
        <TabsContent value="quick" className="pt-4">
          <Card className="border-border/50 bg-card max-w-lg">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Registrar Interrupción
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <form onSubmit={handleAddLog} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Descripción</Label>
                  <Input
                    placeholder="Bug inesperado, reunión, tarea extra…"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="bg-secondary/20 border-border h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Tipo</Label>
                  <div className="flex gap-2">
                    {([
                      { id: "bug",     Icon: Bug,          label: "Bug" },
                      { id: "meeting", Icon: Users,        label: "Reunión" },
                      { id: "task",    Icon: ClipboardList, label: "Otro" },
                    ] as const).map(({ id, Icon, label }) => (
                      <Button
                        key={id} type="button"
                        variant={newType === id ? "default" : "outline"}
                        className={cn("flex-1 gap-1.5 text-xs h-9 border-border", newType === id && "bg-primary text-primary-foreground")}
                        onClick={() => setNewType(id)}
                      >
                        <Icon className="w-3 h-3" /> {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Duración (minutos)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number" placeholder="30"
                      value={newDuration}
                      onChange={e => setNewDuration(e.target.value)}
                      className="w-20 bg-secondary/20 border-border h-9"
                    />
                    <div className="flex flex-1 gap-1">
                      {["5", "15", "30", "60"].map(min => (
                        <Button
                          key={min} type="button" variant="secondary" size="sm"
                          className={cn("flex-1 text-[10px] border border-border bg-card h-9", newDuration === min && "bg-primary text-primary-foreground border-primary")}
                          onClick={() => setNewDuration(min)}
                        >{min}m</Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 font-semibold">
                  Guardar en registro
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Time Logs --- */}
        <TabsContent value="logs" className="pt-4">
          {logs.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-border/40 rounded-2xl">
              <p className="text-sm text-muted-foreground">Aún no hay registros de hoy.</p>
            </div>
          ) : (
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" /> Interrupciones del Día
                </CardTitle>
                <span className="text-[10px] text-muted-foreground font-mono">{totalLoggedMin}m en total</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {logs.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {entry.type === "bug"     && <Bug className="w-3.5 h-3.5 text-destructive shrink-0" />}
                        {entry.type === "meeting" && <Users className="w-3.5 h-3.5 text-primary shrink-0" />}
                        {entry.type === "task"    && <ClipboardList className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                        <p className="text-[11px] font-medium truncate">{entry.title}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-mono text-primary font-bold">{entry.durationMin}m</span>
                        <span className="text-[9px] text-muted-foreground">{entry.loggedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* --- Completados --- */}
        <TabsContent value="completed" className="pt-4">
          {completed.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-border/40 rounded-2xl space-y-2">
              <span className="text-3xl">🏆</span>
              <p className="text-sm font-semibold">Nada completado aún</p>
              <p className="text-xs text-muted-foreground">Marca tickets como completados desde la pestaña <strong>Tickets del Día</strong>.</p>
            </div>
          ) : (
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-400" /> Tickets Completados Hoy
                </CardTitle>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {completed.reduce((a, c) => a + c.loggedDurationMin, 0)}m registrados
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {completed.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium truncate">{entry.title}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">{entry.ticketNumber} · {entry.project}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-green-400 font-bold">{entry.loggedDurationMin}m</p>
                          {entry.realDurationMin !== entry.loggedDurationMin && (
                            <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 justify-end">
                              <Timer className="w-2.5 h-2.5" />{entry.realDurationMin}m real
                            </p>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground">{entry.completedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* --- Complete Ticket Dialog --- */}
      {(() => {
        const dialogTask = completeDialog ? todayTasks.find(t => t.id === completeDialog.taskId) : null
        return (
          <Dialog open={!!completeDialog} onOpenChange={open => !open && setCompleteDialog(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" /> Completar Ticket
                </DialogTitle>
              </DialogHeader>
              {dialogTask && (
                <div className="space-y-4 py-1">
                  <div className="rounded-lg bg-secondary/30 px-4 py-3 space-y-1">
                    <p className="text-[9px] font-mono text-muted-foreground">{dialogTask.ticketNumber}</p>
                    <p className="text-[12px] font-semibold leading-snug">{dialogTask.title}</p>
                  </div>
                  {chronoSec > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Timer className="w-3.5 h-3.5" />
                      Tiempo real en cronómetro: <span className="font-mono text-foreground font-semibold">{Math.round(chronoSec / 60)}m</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      Tiempo a registrar (minutos)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={loggedMin}
                        onChange={e => setLoggedMin(e.target.value)}
                        className="w-20 bg-secondary/20 border-border h-9"
                      />
                      <div className="flex flex-1 gap-1">
                        {["30", "60", "90", "120"].map(min => (
                          <Button
                            key={min} type="button" variant="secondary" size="sm"
                            className={cn("flex-1 text-[10px] border border-border bg-card h-9", loggedMin === min && "bg-primary text-primary-foreground border-primary")}
                            onClick={() => setLoggedMin(min)}
                          >{min}m</Button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground">Puedes registrar más tiempo del que tardaste realmente.</p>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => setCompleteDialog(null)}>Cancelar</Button>
                <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-500 text-white" onClick={handleConfirmComplete}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}
    </div>
  )
}
