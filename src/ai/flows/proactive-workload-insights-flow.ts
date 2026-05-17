'use server';
/**
 * @fileOverview Provides proactive insights into a developer's workload, task estimations,
 * and potential areas for improvement to optimize productivity.
 *
 * - proactiveWorkloadInsights - A function that generates AI-powered workload insights.
 * - ProactiveWorkloadInsightsInput - The input type for the proactiveWorkloadInsights function.
 * - ProactiveWorkloadInsightsOutput - The return type for the proactiveWorkloadInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  id: z.string().describe('Unique identifier for the task.'),
  title: z.string().describe('The title or description of the task.'),
  estimatedHours: z.number().describe('The estimated time in hours to complete the task.').nullable(),
  actualHoursSpent: z.number().optional().describe('The actual time in hours spent on the task.'),
  priority: z.enum(['Urgent', 'High', 'Medium', 'Low']).describe('The priority level of the task.'),
  dueDate: z.string().optional().describe('The due date of the task in YYYY-MM-DD format.'),
  status: z.enum(['Todo', 'In Progress', 'Done', 'Blocked']).describe('The current status of the task.'),
  isJiraTicket: z.boolean().optional().describe('True if the task originates from Jira.'),
  isUrgent: z.boolean().optional().describe('True if the task is marked as urgent.'),
});

const ProactiveWorkloadInsightsInputSchema = z.object({
  dailyCapacityHours: z.number().describe('The total number of hours the developer has available for work today.'),
  tasks: z.array(TaskSchema).describe('A list of tasks for the developer, including estimated and actual hours, priority, and status.'),
  todayDate: z.string().describe('The current date in YYYY-MM-DD format (e.g., "2023-10-27").'),
});
export type ProactiveWorkloadInsightsInput = z.infer<typeof ProactiveWorkloadInsightsInputSchema>;

const ProactiveWorkloadInsightsOutputSchema = z.object({
  overallWorkloadStatus: z.string().describe('An overall assessment of the developer\'s workload, e.g., "You are overloaded today", "Your workload is balanced."'),
  overloadLevel: z.enum(['optimal', 'underloaded', 'moderately_overloaded', 'heavily_overloaded']).describe('Categorization of the current workload level.'),
  estimatedVsActualComparison: z.array(z.object({
    taskId: z.string().describe('The ID of the task.'),
    title: z.string().describe('The title of the task.'),
    estimationInsight: z.string().describe('Insight regarding estimation accuracy for this specific task, e.g., "Exceeded estimate by 2 hours", "Completed within estimate."'),
  })).optional().describe('Insights on individual task estimation accuracy for completed or in-progress tasks.'),
  suggestions: z.array(z.string()).describe('Actionable suggestions to optimize productivity, e.g., "Move low priority tasks to tomorrow", "Focus on frontend tasks first".'),
  focusWindowRecommendations: z.array(z.string()).describe('Recommendations for optimal focus periods, e.g., "Best uninterrupted focus window: 9AM - 12PM".'),
  criticalAlerts: z.array(z.string()).describe('Critical alerts, e.g., "Urgent task \'Fix critical bug\' due today and not started."'),
  productivityScoreInsight: z.string().describe('A general insight about the developer\'s productivity score or patterns.'),
});
export type ProactiveWorkloadInsightsOutput = z.infer<typeof ProactiveWorkloadInsightsOutputSchema>;

export async function proactiveWorkloadInsights(input: ProactiveWorkloadInsightsInput): Promise<ProactiveWorkloadInsightsOutput> {
  return proactiveWorkloadInsightsFlow(input);
}

const proactiveWorkloadInsightsPrompt = ai.definePrompt({
  name: 'proactiveWorkloadInsightsPrompt',
  input: { schema: ProactiveWorkloadInsightsInputSchema },
  output: { schema: ProactiveWorkloadInsightsOutputSchema },
  prompt: `You are an AI assistant designed to help developers optimize their productivity. You will analyze a developer's daily workload and provide proactive, actionable insights and recommendations.

Today's Date: {{{todayDate}}}

Developer's Daily Capacity: {{{dailyCapacityHours}}} hours

Current Tasks:
{{#if tasks}}
  {{#each tasks}}
    - Task ID: {{{id}}}
      Title: {{{title}}}
      Estimated Hours: {{#if estimatedHours}}{{{estimatedHours}}}{{else}}Not estimated{{/if}}
      {{#if actualHoursSpent}}Actual Hours Spent: {{{actualHoursSpent}}}{{/if}}
      Priority: {{{priority}}}
      {{#if dueDate}}Due Date: {{{dueDate}}}{{/if}}
      Status: {{{status}}}
      {{#if isJiraTicket}} (Jira Ticket){{/if}}
      {{#if isUrgent}} (Urgent){{/if}}

  {{/each}}
{{else}}
  No tasks provided for analysis.
{{/if}}

Based on the provided information, generate comprehensive insights into the developer's workload, task estimations, and provide actionable suggestions to improve productivity.

Consider the following:
1.  **Workload Assessment**: Calculate the total estimated hours for all 'Todo' and 'In Progress' tasks. Compare this total against the 'dailyCapacityHours'.
2.  **Overload Detection**: Determine if the developer's estimated workload exceeds their daily capacity significantly.
3.  **Prioritization**: Highlight urgent or high-priority tasks, especially if they are due today, overdue, or not yet started.
4.  **Estimation Accuracy**: For 'Done' or 'In Progress' tasks where both 'estimatedHours' and 'actualHoursSpent' are available, provide specific feedback on estimation accuracy (e.g., "Exceeded estimate by 2 hours", "Completed within estimate").

Analyze the workload and provide the response in the requested JSON format.`,
});

const proactiveWorkloadInsightsFlow = ai.defineFlow(
  {
    name: 'proactiveWorkloadInsightsFlow',
    inputSchema: ProactiveWorkloadInsightsInputSchema,
    outputSchema: ProactiveWorkloadInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await proactiveWorkloadInsightsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate proactive workload insights.');
    }
    return output;
  }
);