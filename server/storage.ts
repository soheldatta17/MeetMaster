import { meetings, actionItems, type Meeting, type InsertMeeting, type ActionItem, type InsertActionItem, type MeetingWithActionItems, type AnalyticsData } from "@shared/schema";
import { subDays, format, startOfWeek, endOfWeek } from "date-fns";

export interface IStorage {
  // Meeting operations
  getMeeting(id: number): Promise<Meeting | undefined>;
  getAllMeetings(): Promise<MeetingWithActionItems[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<Meeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;
  searchMeetings(query: string): Promise<MeetingWithActionItems[]>;

  // Action item operations
  getActionItem(id: number): Promise<ActionItem | undefined>;
  getActionItemsByMeeting(meetingId: number): Promise<ActionItem[]>;
  getAllActionItems(): Promise<ActionItem[]>;
  getPendingActionItems(): Promise<ActionItem[]>;
  createActionItem(actionItem: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: number, actionItem: Partial<ActionItem>): Promise<ActionItem | undefined>;
  deleteActionItem(id: number): Promise<boolean>;

  // Analytics
  getAnalytics(): Promise<AnalyticsData>;
}

export class MemStorage implements IStorage {
  private meetings: Map<number, Meeting>;
  private actionItems: Map<number, ActionItem>;
  private currentMeetingId: number;
  private currentActionItemId: number;

  constructor() {
    this.meetings = new Map();
    this.actionItems = new Map();
    this.currentMeetingId = 1;
    this.currentActionItemId = 1;
  }

  // Meeting operations
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getAllMeetings(): Promise<MeetingWithActionItems[]> {
    const meetings = Array.from(this.meetings.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return meetings.map(meeting => {
      const meetingActionItems = Array.from(this.actionItems.values()).filter(
        item => item.meetingId === meeting.id
      );
      return {
        ...meeting,
        actionItemsCount: meetingActionItems.length,
        pendingActionItems: meetingActionItems.filter(item => item.status === 'pending').length,
      };
    });
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.currentMeetingId++;
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      createdAt: new Date(),
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meetingUpdate: Partial<Meeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { ...meeting, ...meetingUpdate };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    // Also delete associated action items
    const meetingActionItems = Array.from(this.actionItems.values()).filter(
      item => item.meetingId === id
    );
    meetingActionItems.forEach(item => this.actionItems.delete(item.id));
    
    return this.meetings.delete(id);
  }

  async searchMeetings(query: string): Promise<MeetingWithActionItems[]> {
    const allMeetings = await this.getAllMeetings();
    const lowerQuery = query.toLowerCase();
    
    return allMeetings.filter(meeting => 
      meeting.title.toLowerCase().includes(lowerQuery) ||
      (meeting.transcription && meeting.transcription.toLowerCase().includes(lowerQuery)) ||
      (meeting.participants && meeting.participants.some(p => p.toLowerCase().includes(lowerQuery)))
    );
  }

  // Action item operations
  async getActionItem(id: number): Promise<ActionItem | undefined> {
    return this.actionItems.get(id);
  }

  async getActionItemsByMeeting(meetingId: number): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values()).filter(
      item => item.meetingId === meetingId
    );
  }

  async getAllActionItems(): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPendingActionItems(): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values())
      .filter(item => item.status === 'pending')
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      });
  }

  async createActionItem(insertActionItem: InsertActionItem): Promise<ActionItem> {
    const id = this.currentActionItemId++;
    const actionItem: ActionItem = {
      ...insertActionItem,
      id,
      createdAt: new Date(),
    };
    this.actionItems.set(id, actionItem);
    return actionItem;
  }

  async updateActionItem(id: number, actionItemUpdate: Partial<ActionItem>): Promise<ActionItem | undefined> {
    const actionItem = this.actionItems.get(id);
    if (!actionItem) return undefined;
    
    const updatedActionItem = { ...actionItem, ...actionItemUpdate };
    this.actionItems.set(id, updatedActionItem);
    return updatedActionItem;
  }

  async deleteActionItem(id: number): Promise<boolean> {
    return this.actionItems.delete(id);
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const allMeetings = Array.from(this.meetings.values());
    const allActionItems = Array.from(this.actionItems.values());
    
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    const recentMeetings = allMeetings.filter(
      meeting => new Date(meeting.date) >= thirtyDaysAgo
    );
    
    const weeklyMeetings = allMeetings.filter(
      meeting => new Date(meeting.date) >= weekStart && new Date(meeting.date) <= weekEnd
    );
    
    const totalHours = allMeetings.reduce((sum, meeting) => 
      sum + (meeting.duration || 0), 0
    ) / 60; // Convert minutes to hours
    
    const completedActions = allActionItems.filter(
      item => item.status === 'completed'
    ).length;
    
    const avgDuration = allMeetings.length > 0 
      ? allMeetings.reduce((sum, meeting) => sum + (meeting.duration || 0), 0) / allMeetings.length
      : 0;
    
    // Generate meeting frequency data for last 30 days
    const meetingFrequency = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dayMeetings = allMeetings.filter(
        meeting => format(new Date(meeting.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      meetingFrequency.push({
        date: format(date, 'MMM dd'),
        count: dayMeetings.length,
      });
    }
    
    return {
      totalMeetings: allMeetings.length,
      totalHours: Math.round(totalHours * 10) / 10,
      completedActions,
      avgDuration: Math.round(avgDuration),
      productivityScore: allActionItems.length > 0 
        ? Math.round((completedActions / allActionItems.length) * 100)
        : 0,
      weeklyMeetings: weeklyMeetings.length,
      meetingFrequency,
      actionItemCompletion: {
        completed: completedActions,
        pending: allActionItems.filter(item => item.status === 'pending').length,
      },
      meetingsPerWeek: Math.round((recentMeetings.length / 4) * 10) / 10,
      actionItemsPerMeeting: allMeetings.length > 0 
        ? Math.round((allActionItems.length / allMeetings.length) * 10) / 10
        : 0,
    };
  }
}

export const storage = new MemStorage();
