"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MOCK_TASKS } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground text-sm mt-1">Multi-view calendar for long-term planning.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="border-border/50 bg-card/40 p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-none"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
                day_today: "bg-accent/20 text-accent",
              }}
            />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/40">
            <CardHeader>
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_TASKS.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/10 group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/50 flex flex-col items-center justify-center border border-border/50">
                       <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Mar</span>
                       <span className="text-sm font-bold leading-none mt-1">14</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold truncate max-w-[200px] md:max-w-sm">{task.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">{task.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={task.priority === 'Urgent' ? 'destructive' : 'outline'} className="text-[9px]">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 p-6 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Brain className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-sm font-bold tracking-tight">AI Schedule Sync</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">Veloce can automatically block focus time between your meetings based on task difficulty.</p>
             </div>
             <Button className="h-8 text-[11px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" variant="outline">Connect Outlook / Google</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
