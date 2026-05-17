"use client"

import * as React from "react"
import { MOCK_TASKS, Priority, Status } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Filter, 
  Search, 
  MoreHorizontal, 
  Clock, 
  ArrowUpCircle, 
  Circle,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusIcons: Record<Status, React.ReactNode> = {
  "Todo": <Circle className="w-4 h-4 text-muted-foreground" />,
  "In Progress": <ArrowUpCircle className="w-4 h-4 text-primary animate-pulse" />,
  "Done": <CheckCircle2 className="w-4 h-4 text-green-500" />,
  "Blocked": <XCircle className="w-4 h-4 text-destructive" />,
}

export default function TicketsPage() {
  const [view, setView] = React.useState<'list' | 'kanban'>('list')
  const [search, setSearch] = React.useState("")

  const filteredTasks = MOCK_TASKS.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.ticketNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Unified Workspace</h1>
          <p className="text-muted-foreground text-sm mt-1">Managing {MOCK_TASKS.length} active work items across all systems.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary/30 rounded-lg p-1 border border-border/50">
            <Button 
              variant={view === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={view === 'kanban' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setView('kanban')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="default" className="h-9 bg-primary text-primary-foreground font-medium px-4">
            Import Jira
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-4 bg-card/20 p-2 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Filter by title, ticket number, or project..." 
            className="pl-10 h-10 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm" className="gap-2 h-9 text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {view === 'list' ? (
        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/50 bg-secondary/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-1">Ticket</div>
            <div className="col-span-5">Task Description</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-1">Est</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          <div className="divide-y divide-border/50">
            {filteredTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/10 transition-colors group cursor-pointer">
                <div className="col-span-1 font-mono text-xs text-muted-foreground ticket-number">
                  {task.ticketNumber || '-'}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <span className="text-sm font-medium">{task.title}</span>
                  <div className="flex gap-1">
                    {task.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded-full bg-secondary/50 text-[9px] text-muted-foreground border border-border/50">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {task.project}
                </div>
                <div className="col-span-1 flex items-center gap-2">
                  {statusIcons[task.status]}
                  <span className="text-[11px] text-foreground/80">{task.status}</span>
                </div>
                <div className="col-span-1">
                  <Badge 
                    variant={task.priority === 'Urgent' ? 'destructive' : task.priority === 'High' ? 'default' : 'secondary'} 
                    className="text-[9px] h-5 px-2"
                  >
                    {task.priority}
                  </Badge>
                </div>
                <div className="col-span-1 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Clock className="w-3 h-3" />
                  {task.estimatedHours}h
                </div>
                <div className="col-span-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Update Status</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(['Todo', 'In Progress', 'Done', 'Blocked'] as Status[]).map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight">{status}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {filteredTasks.filter(t => t.status === status).length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="w-3 h-3"/></Button>
              </div>
              <div className="space-y-3">
                {filteredTasks.filter(t => t.status === status).map((task) => (
                  <Card key={task.id} className="border-border/50 bg-card/40 hover:border-primary/50 transition-all group cursor-pointer shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-mono text-muted-foreground ticket-number">{task.ticketNumber || 'TASK'}</span>
                         <Badge 
                          variant={task.priority === 'Urgent' ? 'destructive' : 'outline'} 
                          className="text-[9px] h-4 px-1.5 border-none"
                         >
                          {task.priority}
                         </Badge>
                      </div>
                      <h4 className="text-xs font-semibold leading-relaxed line-clamp-2">{task.title}</h4>
                      <div className="flex items-center justify-between pt-2 border-t border-border/10">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {task.estimatedHours}h
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-primary/80 font-medium">{task.project}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
