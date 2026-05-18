"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock, Target, AlertCircle } from "lucide-react"
import { useJiraTasks } from "@/hooks/use-jira-tasks"

export function StatsGrid() {
  const { tasks, loading } = useJiraTasks()

  const completedTasks = tasks.filter(t => t.status === 'Done').length
  const totalTasks = tasks.length
  const focusHours = Math.round(tasks.reduce((sum, t) => sum + (t.actualHoursSpent ?? 0), 0) * 10) / 10
  const urgentCount = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Done').length
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats = [
    {
      title: "Today's Progress",
      value: loading ? '…' : `${completedTasks}/${totalTasks}`,
      sub: "tasks completed",
      icon: CheckCircle2,
      color: "text-green-400"
    },
    {
      title: "Focus Hours",
      value: loading ? '…' : `${focusHours}h`,
      sub: "tracked today",
      icon: Clock,
      color: "text-primary"
    },
    {
      title: "Productivity Score",
      value: loading ? '…' : `${productivityScore}%`,
      sub: "based on completed tasks",
      icon: Target,
      color: "text-accent"
    },
    {
      title: "Urgent Issues",
      value: loading ? '…' : String(urgentCount),
      sub: "require attention",
      icon: AlertCircle,
      color: "text-destructive"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6 border-border/50 bg-card/40 hover:bg-card/60 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</span>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-headline font-bold">{stat.value}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
