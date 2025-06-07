import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // in minutes
  status: text("status").notNull().default("uploaded"), // uploaded, processing, transcribed, error
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  actionItems: json("action_items").$type<ActionItem[]>().default([]),
  meetingType: text("meeting_type"),
  participants: json("participants").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const actionItems = pgTable("action_items", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").references(() => meetings.id),
  title: text("title").notNull(),
  description: text("description"),
  assignee: text("assignee"),
  status: text("status").notNull().default("pending"), // pending, completed
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({
  id: true,
  createdAt: true,
});

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;

// Additional types for API responses
export type MeetingWithActionItems = Meeting & {
  actionItemsCount: number;
  pendingActionItems: number;
};

export type AnalyticsData = {
  totalMeetings: number;
  totalHours: number;
  completedActions: number;
  avgDuration: number;
  productivityScore: number;
  weeklyMeetings: number;
  meetingFrequency: { date: string; count: number }[];
  actionItemCompletion: { completed: number; pending: number };
  meetingsPerWeek: number;
  actionItemsPerMeeting: number;
};
