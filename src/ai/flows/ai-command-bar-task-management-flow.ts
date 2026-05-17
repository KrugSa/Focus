'use server';
/**
 * @fileOverview This file implements a Genkit flow for an AI-powered global command bar,
 * enabling users to quickly create and manage tasks using natural language commands.
 *
 * - aiCommandBarTaskManagement - The main function to process natural language task commands.
 * - AiCommandBarInput - The input type for the aiCommandBarTaskManagement function.
 * - AiCommandBarOutput - The return type for the aiCommandBarTaskManagement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCommandBarInputSchema = z.object({
  command: z.string().describe('The natural language command to create or manage a task.'),
});
export type AiCommandBarInput = z.infer<typeof AiCommandBarInputSchema>;

const AiCommandBarOutputSchema = z.object({
  action: z
    .enum(['create', 'update', 'query', 'none'])
    .describe('The action to perform based on the command. "none" if the command is not understood or actionable.'),
  taskDetails:
    z.object({
      id: z.string().optional().describe('The ID of the task to update or query, if explicitly provided in the command.'),
      taskTitle: z.string().optional().describe('The title of the task.'),
      ticketNumber:
        z.string().optional().describe('Associated Jira or PR ticket number (e.g., PR-1234, JIRA-5678).'),
      priority:
        z.enum(['High', 'Medium', 'Low', 'Urgent']).optional().describe('The priority of the task.'),
      estimatedHours:
        z.number().optional().describe('Estimated hours to complete the task.'),
      tags: z.array(z.string()).optional().describe('Relevant tags for the task.'),
      project: z.string().optional().describe('The project the task belongs to.'),
      dueDate: z.string().optional().describe('The due date for the task in YYYY-MM-DD format (e.g., 2024-12-31).'),
      status: z.enum(['To Do', 'In Progress', 'Done', 'Blocked']).optional().describe('The status of the task.'),
    })
    .optional()
    .describe('Details of the task to be created, updated, or queried.'),
  feedback:
    z.string().optional().describe('A message to the user if the command was ambiguous, incomplete, or needs clarification.'),
});
export type AiCommandBarOutput = z.infer<typeof AiCommandBarOutputSchema>;

export async function aiCommandBarTaskManagement(input: AiCommandBarInput): Promise<AiCommandBarOutput> {
  return aiCommandBarTaskManagementFlow(input);
}

const aiCommandBarTaskManagementPrompt = ai.definePrompt({
  name: 'aiCommandBarTaskManagementPrompt',
  input: {schema: AiCommandBarInputSchema},
  output: {schema: AiCommandBarOutputSchema},
  prompt: `You are an intelligent task management assistant for a developer dashboard.
Your goal is to parse natural language commands from a user, identify the intended action (create, update, query), and extract all relevant task details.

Here are the fields you can extract:
- action: 'create', 'update', 'query', or 'none' if the command is not understood.
- taskDetails.id: (Optional) The ID of an existing task if the command refers to one.
- taskDetails.taskTitle: (Optional) The main title or description of the task.
- taskDetails.ticketNumber: (Optional) A Jira or Pull Request ticket number, e.g., 'PR-1234' or 'JIRA-5678'.
- taskDetails.priority: (Optional) 'High', 'Medium', 'Low', or 'Urgent'.
- taskDetails.estimatedHours: (Optional) A number representing estimated hours.
- taskDetails.tags: (Optional) An array of strings for tags.
- taskDetails.project: (Optional) The project name the task belongs to.
- taskDetails.dueDate: (Optional) The due date in YYYY-MM-DD format.
- taskDetails.status: (Optional) 'To Do', 'In Progress', 'Done', or 'Blocked'.
- feedback: (Optional) A message to the user if you need clarification or the command was ambiguous.

If the command is primarily about creating a new task, set 'action' to 'create'.
If the command is about modifying an existing task, set 'action' to 'update'.
If the command is asking for information about tasks, set 'action' to 'query'.
If the command is unclear or not actionable, set 'action' to 'none' and provide 'feedback'.

When extracting ticket numbers, ensure they follow common patterns like 'PR-XXXX' or 'JIRA-XXXX'.
If a due date is specified relative to 'today' or 'tomorrow', interpret it as a specific date in YYYY-MM-DD format.

Example commands and expected output:
1. Command: "Create: fix payment summary for PR-5234, high priority, 4 hours, due tomorrow, project 'Payments'."
   Output: { action: 'create', taskDetails: { taskTitle: 'fix payment summary', ticketNumber: 'PR-5234', priority: 'High', estimatedHours: 4, dueDate: 'YYYY-MM-DD (tomorrow)', project: 'Payments' } }
2. Command: "Update task 'Kendo Migration' status to 'Done' and add tag 'frontend'."
   Output: { action: 'update', taskDetails: { taskTitle: 'Kendo Migration', status: 'Done', tags: ['frontend'] } }
3. Command: "Show me all tasks for project 'Analytics'."
   Output: { action: 'query', taskDetails: { project: 'Analytics' } }
4. Command: "Urgent: debug production issue PR-9999, due today."
   Output: { action: 'create', taskDetails: { taskTitle: 'debug production issue', ticketNumber: 'PR-9999', priority: 'Urgent', dueDate: 'YYYY-MM-DD (today)' } }
5. Command: "What's up?"
   Output: { action: 'none', feedback: 'I can help create, update, or query tasks. What would you like to do?' }

Analyze the following command and provide a JSON response:
Command: {{{command}}}`,
});

const aiCommandBarTaskManagementFlow = ai.defineFlow(
  {
    name: 'aiCommandBarTaskManagementFlow',
    inputSchema: AiCommandBarInputSchema,
    outputSchema: AiCommandBarOutputSchema,
  },
  async input => {
    const {output} = await aiCommandBarTaskManagementPrompt(input);
    return output!;
  }
);
