"use client"

import { Card } from "@/components/ui/card"
import { MOCK_STATS } from "@/lib/mock-data"
import { CheckCircle2, Clock, Zap, Target, AlertCircle } from "lucide-react"

export function StatsGrid() {
  const stats = [
    {
      title: "Today's Progress",
      value: `${MOCK_STATS.completedTasks}/${MOCK_STATS.totalTasks}`,
      sub: "tasks completed",
      icon: CheckCircle2,
      color: "text-green-400"
    },
    {
      title: "Focus Hours",
      value: `${MOCK_STATS.focusHours}h`,
      sub: "tracked today",
      icon: Clock,
      color: "text-primary"
    },
    {
      title: "Productivity Score",
      value: `${MOCK_STATS.productivityScore}%`,
      sub: "+5% from yesterday",
      icon: Target,
      color: "text-accent"
    },
    {
      title: "Urgent Issues",
      value: "2",
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
