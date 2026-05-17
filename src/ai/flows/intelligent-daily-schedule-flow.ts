'use server';
/**
 * @fileOverview An AI agent that suggests an optimized daily schedule for tasks.
 *
 * - suggestDailySchedule - A function that generates an intelligent daily schedule based on input.
 * - IntelligentDailyScheduleInput - The input type for the suggestDailySchedule function.
 * - IntelligentDailyScheduleOutput - The return type for the suggestDailySchedule function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  id: z.string().describe('Unique identifier for the task.'),
  title: z.string().describe('The title or description of the task.'),
  dueDate: z.string().optional().describe('Optional ISO formatted due date for the task.'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('Priority level of the task.'),
  estimatedHours: z.number().min(0.1).describe('Estimated hours to complete the task.'),
  actualHours: z.number().optional().describe('Actual hours spent on the task previously, if available, for historical context.'),
  project: z.string().describe('The project the task belongs to.'),
  type: z.string().describe('Type of task, e.g., \'feature\', \'bug\', \'meeting\', \'personal\'.'),
});

const IntelligentDailyScheduleInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of tasks to be scheduled for the day.'),
  availableHoursToday: z.number().min(1).max(16).describe('Total available hours for work today.'),
  historicalWorkPatterns: z.string().optional().describe('A description of the user\'s typical work patterns and preferences, e.g., \'User works best on coding tasks in the morning (9 AM - 1 PM) and prefers meetings in the afternoon (2 PM - 5 PM). Focus is generally better on Tuesdays and Thursdays.\''),
  currentTime: z.string().describe('The current time in HH:MM AM/PM format, e.g., \'09:00 AM\'. The schedule should start from this time or later.'),
});
export type IntelligentDailyScheduleInput = z.infer<typeof IntelligentDailyScheduleInputSchema>;

const ScheduledTaskSchema = z.object({
  taskId: z.string().describe('The ID of the scheduled task.'),
  title: z.string().describe('The title of the scheduled task.'),
  startTime: z.string().describe('The start time of the task in HH:MM AM/PM format.'),
  durationHours: z.number().describe('The duration of the task in hours.'),
  reasoning: z.string().describe('Brief explanation for scheduling this task at this time.'),
  isOptimalFocusWindow: z.boolean().describe('True if this task is scheduled within an optimal focus window based on historical patterns.'),
});

const IntelligentDailyScheduleOutputSchema = z.object({
  scheduledItems: z.array(ScheduledTaskSchema).describe('An ordered list of tasks and breaks scheduled for the day.'),
  overallRecommendation: z.string().describe('A summary recommendation for the day\'s schedule, including tips for productivity or burnout prevention.'),
});
export type IntelligentDailyScheduleOutput = z.infer<typeof IntelligentDailyScheduleOutputSchema>;

export async function suggestDailySchedule(input: IntelligentDailyScheduleInput): Promise<IntelligentDailyScheduleOutput> {
  return intelligentDailyScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentDailySchedulePrompt',
  input: { schema: IntelligentDailyScheduleInputSchema },
  output: { schema: IntelligentDailyScheduleOutputSchema },
  prompt: `You are an intelligent scheduling assistant designed to create an optimized daily work schedule for a developer.
Your goal is to help the user efficiently plan their day and avoid burnout, considering their tasks, deadlines, priorities, and historical work patterns.

Current Time: {{{currentTime}}}
Available Work Hours Today: {{{availableHoursToday}}} hours
Historical Work Patterns: {{{historicalWorkPatterns}}}

Tasks to Schedule:
{{#each tasks}}
- ID: {{{id}}}, Title: {{{title}}}, Project: {{{project}}}, Type: {{{type}}}, Priority: {{{priority}}}, Estimated: {{{estimatedHours}}}h, Due: {{{dueDate}}} {{#if actualHours}}(Previously took: {{{actualHours}}}h){{/if}}
{{/each}}

Instructions:
1. Create a schedule starting from the Current Time (or later) for today, filling up to the Available Work Hours Today.
2. Prioritize tasks based on 'High' priority first, then 'Medium', then 'Low'. Consider deadlines heavily.
3. Break down the day into reasonable blocks, including short breaks if appropriate. Aim for a balanced workload.
4. Incorporate the Historical Work Patterns to suggest optimal focus windows for specific task types where applicable.
5. For each scheduled item, provide a brief 'reasoning' for its placement.
6. For each scheduled item, indicate 'isOptimalFocusWindow' if it aligns with the user's historical work patterns for focused work.
7. Do not exceed the total available hours. If tasks exceed available hours, indicate which tasks were left unscheduled in the 'overallRecommendation'.
8. Provide an 'overallRecommendation' summarizing the schedule and offering productivity or burnout prevention tips.
9. Ensure the output strictly adheres to the provided JSON schema.`,
});

const intelligentDailyScheduleFlow = ai.defineFlow(
  {
    name: 'intelligentDailyScheduleFlow',
    inputSchema: IntelligentDailyScheduleInputSchema,
    outputSchema: IntelligentDailyScheduleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate intelligent daily schedule.');
    }
    return output;
  },
);
