
"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Bug, 
  Users, 
  ClipboardList,
  History,
  Layout,
  Database
} from "lucide-react"
import { MOCK_TASKS, Task } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isTomorrow, isBefore, startOfDay, parseISO } from "date-fns"

export default function FocusDashboard() {
  const [tasks, setTasks] = React.useState<Task[]>(MOCK_TASKS)
  const [activeTicketId, setActiveTicketId] = React.useState<string>(MOCK_TASKS[0].id)
  
  const [isChronoRunning, setIsChronoRunning] = React.useState(false)
  const [chronoSeconds, setChronoSeconds] = React.useState(0)

  const [dailySeconds, setDailySeconds] = React.useState(5.5 * 3600)
  const DAILY_LIMIT = 8 * 3600

  const [newTitle, setNewTitle] = React.useState("")
  const [newType, setNewType] = React.useState<"bug" | "meeting" | "task">("task")
  const [newDuration, setNewDuration] = React.useState("30")

  const activeTask = tasks.find(t => t.id === activeTicketId) || tasks[0]

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isChronoRunning) {
      interval = setInterval(() => {
        setChronoSeconds(prev => prev + 1)
        setDailySeconds(prev => prev + 1)
        
        setTasks(prevTasks => prevTasks.map(t => 
          t.id === activeTicketId 
            ? { ...t, actualHoursSpent: (t.actualHoursSpent || 0) + (1/3600) }
            : t
        ))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isChronoRunning, activeTicketId])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatHours = (hours: number = 0) => {
    if (hours < 1 && hours > 0) {
      return Math.round(hours * 60) + "m"
    }
    return hours.toFixed(2) + "h"
  }

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: t.status === 'Done' ? 'Todo' : 'Done' } : t
    ))
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const durationMinutes = parseInt(newDuration) || 0
    const durationHours = durationMinutes / 60

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      project: "Quick Entry",
      priority: "High",
      status: "Done",
      estimatedHours: durationHours,
      actualHoursSpent: durationHours,
      tags: [newType],
      ticketNumber: newType === 'bug' ? 'BUG-NEW' : newType === 'meeting' ? 'MTG-NEW' : 'DRAFT',
      dueDate: new Date().toISOString().split('T')[0]
    }

    setTasks([newTask, ...tasks])
    setDailySeconds(prev => prev + (durationMinutes * 60))
    setNewTitle("")
    setNewDuration("30")
  }

  const getTaskStatusInfo = (task: Task) => {
    const actual = task.actualHoursSpent || 0
    const estimated = task.estimatedHours || 0
    const progress = (actual / estimated) * 100
    
    let timeColor = "bg-primary"
    let statusBorderColor = "border-primary"
    let statusBgColor = "bg-primary"
    let glowClass = "glow-selected-primary"
    let deadlineLabel = ""
    
    if (actual >= estimated) {
      timeColor = actual > estimated ? "bg-accent" : "bg-green-500"
    }

    if (task.dueDate) {
      const due = startOfDay(parseISO(task.dueDate))
      const today = startOfDay(new Date())
      
      if (isBefore(due, today)) {
        statusBorderColor = "border-destructive"
        statusBgColor = "bg-destructive"
        glowClass = "glow-selected-destructive"
        deadlineLabel = "Overdue"
      } else if (isTomorrow(due)) {
        statusBorderColor = "border-accent"
        statusBgColor = "bg-accent"
        glowClass = "glow-selected-accent"
        deadlineLabel = "Due Tomorrow"
      }
    }

    return { progress, timeColor, statusBorderColor, statusBgColor, glowClass, deadlineLabel }
  }

  const activeTickets = tasks.filter(t => t.status !== 'Done')
  const finishedTickets = tasks.filter(t => t.status === 'Done')
  const dailyProgress = (dailySeconds / DAILY_LIMIT) * 100
  const isOverLimit = dailySeconds >= DAILY_LIMIT

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-12 px-4 pb-20">
      <header className="mb-8 text-center flex flex-col items-center gap-2">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground">Veloce Focus</h1>
        <p className="text-muted-foreground">GitHub Dark Aesthetic • Simplified Performance</p>
        <Badge variant="outline" className="gap-1 bg-secondary/30 border-border">
          <Database className="w-3 h-3" /> Firestore Integrated
        </Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-primary tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Active Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <span className="text-[10px] text-muted-foreground font-mono block mb-1">
                {activeTask.ticketNumber || 'INTERNAL'}
              </span>
              <h3 className="text-sm font-bold mb-4 line-clamp-1">{activeTask.title}</h3>
              <div className="text-5xl font-headline font-bold tabular-nums tracking-tighter">
                {formatTime(chronoSeconds)}
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Button 
                size="lg" 
                className={cn("w-32", isChronoRunning ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground")}
                onClick={() => setIsChronoRunning(!isChronoRunning)}
              >
                {isChronoRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isChronoRunning ? "Pause" : "Start"}
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11 border-border bg-card" onClick={() => { setIsChronoRunning(false); setChronoSeconds(0); }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-border bg-card", isOverLimit && "border-destructive/50 bg-destructive/5")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-widest flex items-center justify-between">
              Daily Capacity
              {isOverLimit && <AlertTriangle className="w-4 h-4 text-destructive" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl font-headline font-bold tabular-nums tracking-tighter">
                {formatTime(dailySeconds)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Limit: 08:00:00</p>
            </div>
            <div className="space-y-2">
              <Progress value={dailyProgress} className={cn("h-2 bg-secondary", isOverLimit ? "indicator-destructive" : "indicator-primary")} />
              {isOverLimit ? (
                <p className="text-[11px] text-destructive font-semibold text-center mt-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Health first. Time to rest.
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  {Math.max(0, Math.floor((DAILY_LIMIT - dailySeconds) / 3600))}h remaining
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="focus" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border p-1 h-12">
          <TabsTrigger value="focus" className="gap-2 data-[state=active]:bg-secondary">
            <Layout className="w-4 h-4" /> Work
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-secondary">
            <History className="w-4 h-4" /> Time Logs
          </TabsTrigger>
          <TabsTrigger value="backlog" className="gap-2 data-[state=active]:bg-secondary">
            <Plus className="w-4 h-4" /> Quick Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="focus" className="space-y-6 pt-4">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Priority</h3>
            {activeTickets.length > 0 ? activeTickets.map((task) => {
              const { progress, timeColor, statusBorderColor, statusBgColor, glowClass, deadlineLabel } = getTaskStatusInfo(task)
              const isActive = activeTicketId === task.id
              
              return (
                <div 
                  key={task.id} 
                  className={cn(
                    "relative flex flex-col p-4 pl-6 rounded-lg border transition-all cursor-pointer group space-y-3 overflow-hidden",
                    statusBorderColor,
                    isActive 
                      ? cn("bg-secondary/40 scale-[1.01]", glowClass) 
                      : "bg-card hover:bg-secondary/20"
                  )}
                  onClick={() => {
                    setActiveTicketId(task.id)
                    setIsChronoRunning(false)
                    setChronoSeconds(0)
                  }}
                >
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", statusBgColor)} />
                  
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                          {task.ticketNumber || 'INTERNAL'}
                        </span>
                        <h4 className="text-sm font-semibold truncate text-foreground">{task.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {deadlineLabel && (
                        <Badge variant="outline" className={cn("text-[9px] h-5 px-1.5 border-current", deadlineLabel === 'Overdue' ? 'text-destructive' : 'text-accent')}>
                          {deadlineLabel}
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-primary/20 hover:text-primary rounded-full"
                        onClick={(e) => { e.stopPropagation(); handleToggleComplete(task.id); }}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                      <span>{formatHours(task.actualHoursSpent)} / {formatHours(task.estimatedHours)}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-secondary" indicatorClassName={timeColor} />
                  </div>
                </div>
              )
            }) : (
              <div className="p-8 text-center border border-dashed border-border rounded-xl bg-card">
                <p className="text-sm text-muted-foreground">No active tasks. Time to focus!</p>
              </div>
            )}
          </div>

          {finishedTickets.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Finished Today</h3>
              {finishedTickets.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/40 opacity-70">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground line-through">{task.ticketNumber}</span>
                      <h4 className="text-sm font-medium line-through text-muted-foreground">{task.title}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground">{formatHours(task.actualHoursSpent)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] hover:bg-secondary"
                      onClick={() => handleToggleComplete(task.id)}
                    >
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="pt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Work History Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {tasks.filter(t => (t.actualHoursSpent || 0) > 0).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 hover:bg-secondary/10">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">{task.ticketNumber}</p>
                      <p className="text-sm font-medium truncate">{task.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-primary">{formatHours(task.actualHoursSpent)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Logged</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlog" className="pt-4 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Plus className="w-4 h-4 text-primary" /> Log Unexpected Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Description</Label>
                  <Input 
                    placeholder="Unexpected bug or meeting..." 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-secondary/20 border-border focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Type</Label>
                  <div className="flex gap-2">
                    {[
                      { id: 'bug', icon: Bug, label: 'Bug' },
                      { id: 'meeting', icon: Users, label: 'Meeting' },
                      { id: 'task', icon: ClipboardList, label: 'Other' }
                    ].map(type => (
                      <Button 
                        key={type.id}
                        type="button" 
                        variant={newType === type.id ? 'default' : 'outline'}
                        className={cn("flex-1 gap-2 text-xs h-9 border-border", newType === type.id && "bg-primary text-primary-foreground")}
                        onClick={() => setNewType(type.id as any)}
                      >
                        <type.icon className="w-3 h-3" /> {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Duration (Minutes)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      placeholder="30"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-24 bg-secondary/20 border-border"
                    />
                    <div className="flex flex-1 gap-1">
                      {["5", "15", "30", "60"].map(min => (
                        <Button 
                          key={min}
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={cn("flex-1 text-[10px] border border-border bg-card", newDuration === min && "bg-primary text-primary-foreground border-primary")}
                          onClick={() => setNewDuration(min)}
                        >
                          {min}m
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11">
                  Save to Time Logs
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
