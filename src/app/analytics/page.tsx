"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { Badge } from "@/components/ui/badge"

const dataVelocity = [
  { day: 'Mon', completed: 4, target: 5 },
  { day: 'Tue', completed: 6, target: 5 },
  { day: 'Wed', completed: 3, target: 5 },
  { day: 'Thu', completed: 5, target: 5 },
  { day: 'Fri', completed: 7, target: 5 },
  { day: 'Sat', completed: 2, target: 5 },
  { day: 'Sun', completed: 1, target: 5 },
]

const dataProjects = [
  { name: 'Auth', value: 400, color: '#7C71FF' },
  { name: 'Payments', value: 300, color: '#00D1FF' },
  { name: 'UI Kit', value: 300, color: '#FFD700' },
  { name: 'Bugs', value: 200, color: '#FF4D4D' },
]

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Performance Intelligence</h1>
        <p className="text-muted-foreground text-sm mt-1">Deep dive into velocity metrics, estimation accuracy, and project distribution.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Output Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold">12 Days</div>
            <p className="text-[10px] text-green-400 mt-1">New personal record</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Est. vs Actual Drift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold"> -12%</div>
            <p className="text-[10px] text-primary mt-1">Tasks completed faster than estimated</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Flow Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-headline font-bold">94.2</div>
            <p className="text-[10px] text-accent mt-1">Exceptional focus maintenance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card/40 p-6 h-[400px]">
          <CardHeader className="px-0 pt-0">
             <CardTitle className="text-base">Weekly Completion Velocity</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={dataVelocity}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0D0D11', border: '1px solid #333' }}
                itemStyle={{ color: '#7C71FF' }}
              />
              <Bar dataKey="completed" fill="#7C71FF" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="target" fill="#333" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border/50 bg-card/40 p-6 h-[400px]">
          <CardHeader className="px-0 pt-0">
             <CardTitle className="text-base">Project Distribution</CardTitle>
          </CardHeader>
          <div className="flex h-[80%] items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataProjects}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataProjects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 w-40">
               {dataProjects.map((p) => (
                 <div key={p.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}} />
                    <span className="text-[11px] font-medium">{p.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border-border/50 bg-card/40 p-6">
            <CardHeader className="px-0 pt-0">
               <CardTitle className="text-base">Interruption Heatmap</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-12 gap-1 h-32">
               {Array.from({length: 48}).map((_, i) => (
                 <div 
                  key={i} 
                  className={`rounded-sm border border-border/10 ${
                    i % 7 === 0 ? 'bg-primary/60' : i % 5 === 0 ? 'bg-primary/30' : 'bg-secondary/20'
                  }`}
                  title={`${i % 24}:00`}
                 />
               ))}
            </div>
            <div className="flex justify-between mt-4">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Low Distraction</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">High Distraction</span>
            </div>
         </Card>
         <Card className="border-border/50 bg-card/40 p-6">
            <CardHeader className="px-0 pt-0">
               <CardTitle className="text-base">AI Insight</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
               <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-[11px] leading-relaxed text-foreground/90">
                    "Your estimation drift is decreasing on Wednesdays. You perform best on React-based tasks during morning blocks. Consider batching bug-fixes for Thursday afternoons."
                  </p>
               </div>
               <Badge className="bg-accent/20 text-accent border-accent/20 text-[9px]">Calculated 2m ago</Badge>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
