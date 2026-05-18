"use client"

import * as React from "react"
import { useJiraTasks } from "@/hooks/use-jira-tasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Plus, Check } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const STATIC_SCHEDULE = {
  overallRecommendation: "You have a solid mix of engineering work and architecture review today. Starting with the critical Auth bug is recommended to clear the path for deep focus on the Payment layout.",
  scheduledItems: [
    {
      taskId: '5',
      title: 'Fix critical Auth timeout bug in Production',
      startTime: '09:00 AM',
      durationHours: 2,
      reasoning: "Urgent bug fix prioritized to minimize production impact.",
      isOptimalFocusWindow: true
    },
    {
      taskId: '1',
      title: 'Fix Payment Summary responsive layout issues',
      startTime: '11:00 AM',
      durationHours: 2.5,
      reasoning: "High priority task scheduled during the late morning peak focus window.",
      isOptimalFocusWindow: true
    },
    {
      taskId: '4',
      title: 'Internal Meeting with David regarding Architecture',
      startTime: '02:00 PM',
      durationHours: 1,
      reasoning: "Scheduled for early afternoon when focus shifts to collaborative work.",
      isOptimalFocusWindow: false
    }
  ]
}

export default function PlannerPage() {
  const { tasks } = useJiraTasks()
  const [schedule, setSchedule] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate a brief delay instead of calling the AI flow
    const timer = setTimeout(() => {
      setSchedule(STATIC_SCHEDULE)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Today's Canvas</h1>
          <p className="text-muted-foreground text-sm mt-1">Interactive timeline and AI-optimized focus windows.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 border-border/50 text-xs">
            Export Calendar
          </Button>
          <Button className="h-9 bg-primary text-primary-foreground font-medium text-xs">
            Finalize Day
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: AI Summary (Static) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm font-semibold">Optimizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-12 bg-muted rounded-md" />
                  <div className="h-4 bg-muted rounded-md w-3/4" />
                </div>
              ) : (
                <>
                  <p className="text-[11px] leading-relaxed italic text-foreground/80">
                    {schedule?.overallRecommendation}
                  </p>
                  <div className="pt-2 border-t border-primary/10">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Focus Sessions</h5>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-primary/20">
                          <span className="text-[10px]">Deep Focus Block</span>
                          <span className="text-[10px] text-primary font-bold">9:00 - 11:30</span>
                       </div>
                       <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50 opacity-50">
                          <span className="text-[10px]">Administrative Block</span>
                          <span className="text-[10px]">2:00 - 3:30</span>
                       </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border border-dashed border-border/50 bg-secondary/5">
             <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Unscheduled Pool</h4>
             <div className="space-y-2">
                {tasks.slice(3).map(task => (
                  <div key={task.id} className="p-2.5 rounded-lg border border-border/50 bg-card/40 flex items-center justify-between group cursor-grab active:cursor-grabbing">
                    <span className="text-[11px] font-medium truncate pr-4">{task.title}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100"><Plus className="w-3 h-3"/></Button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Timeline Canvas */}
        <div className="lg:col-span-3">
          <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/20 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/20">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">09:00 AM - 05:00 PM</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-accent">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Now: 10:42 AM
                </div>
              </div>
            </div>
            
            <div className="p-0">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground text-sm italic">
                  Calculating optimal schedule flow...
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {schedule?.scheduledItems.map((item: any, idx: number) => (
                    <div key={idx} className={`relative flex gap-6 p-6 group transition-colors ${item.isOptimalFocusWindow ? 'bg-primary/5' : ''}`}>
                      <div className="w-16 flex flex-col items-center">
                        <span className="text-xs font-headline font-bold text-foreground/80">{item.startTime}</span>
                        <div className="w-px h-full bg-border/50 mt-2" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold tracking-tight">{item.title}</h3>
                            {item.isOptimalFocusWindow && (
                              <Badge className="h-5 bg-accent/20 text-accent border-accent/20 text-[9px]">Optimal Focus</Badge>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{item.durationHours}h block</span>
                        </div>
                        
                        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-lg">
                          {item.reasoning}
                        </p>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-primary hover:text-primary hover:bg-primary/10">Start session</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground">Reschedule</Button>
                        </div>
                      </div>

                      {/* Check mark for completed feel */}
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-6 h-6 rounded-full border border-border/50 flex items-center justify-center cursor-pointer hover:bg-primary hover:border-primary transition-all">
                            <Check className="w-3 h-3 text-transparent group-hover:text-primary-foreground" />
                         </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty gap for afternoon if any */}
                  <div className="p-8 text-center border-t border-dashed border-border/50 bg-secondary/5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">No more tasks scheduled for today</p>
                    <Button variant="outline" className="mt-4 h-8 border-border/50 text-[10px] gap-2">
                      <Plus className="w-3 h-3" /> Insert Break or Personal Task
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
