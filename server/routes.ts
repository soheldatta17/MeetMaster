import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertMeetingSchema, insertActionItemSchema } from "@shared/schema";
import { transcribeAudio, extractActionItems } from "./openai";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|m4a)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3, WAV, and M4A files are allowed.'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Meeting routes
  app.get("/api/meetings", async (req, res) => {
    try {
      const meetings = await storage.getAllMeetings();
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const meeting = await storage.getMeeting(parseInt(req.params.id));
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  app.post("/api/meetings", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      const meetingData = {
        title: req.body.title,
        date: new Date(req.body.date),
        meetingType: req.body.meetingType,
        participants: req.body.participants ? JSON.parse(req.body.participants) : [],
        status: "uploaded" as const,
        audioUrl: req.file.path,
        duration: null,
        transcription: null,
        actionItems: [],
      };

      const validatedData = insertMeetingSchema.parse(meetingData);
      const meeting = await storage.createMeeting(validatedData);

      // Start background processing
      processAudioFile(meeting.id, req.file.path, req.body.autoAnalysis === 'true');

      res.status(201).json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.patch("/api/meetings/:id", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.id);
      const updatedMeeting = await storage.updateMeeting(meetingId, req.body);
      
      if (!updatedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json(updatedMeeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.id);
      const deleted = await storage.deleteMeeting(meetingId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  app.get("/api/meetings/search/:query", async (req, res) => {
    try {
      const meetings = await storage.searchMeetings(req.params.query);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to search meetings" });
    }
  });

  // Action item routes
  app.get("/api/action-items", async (req, res) => {
    try {
      const actionItems = await storage.getAllActionItems();
      res.json(actionItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch action items" });
    }
  });

  app.get("/api/action-items/pending", async (req, res) => {
    try {
      const actionItems = await storage.getPendingActionItems();
      res.json(actionItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending action items" });
    }
  });

  app.get("/api/action-items/meeting/:meetingId", async (req, res) => {
    try {
      const actionItems = await storage.getActionItemsByMeeting(parseInt(req.params.meetingId));
      res.json(actionItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch action items for meeting" });
    }
  });

  app.post("/api/action-items", async (req, res) => {
    try {
      const validatedData = insertActionItemSchema.parse(req.body);
      const actionItem = await storage.createActionItem(validatedData);
      res.status(201).json(actionItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to create action item" });
    }
  });

  app.patch("/api/action-items/:id", async (req, res) => {
    try {
      const actionItemId = parseInt(req.params.id);
      const updatedActionItem = await storage.updateActionItem(actionItemId, req.body);
      
      if (!updatedActionItem) {
        return res.status(404).json({ message: "Action item not found" });
      }

      res.json(updatedActionItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update action item" });
    }
  });

  app.delete("/api/action-items/:id", async (req, res) => {
    try {
      const actionItemId = parseInt(req.params.id);
      const deleted = await storage.deleteActionItem(actionItemId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Action item not found" });
      }

      res.json({ message: "Action item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete action item" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Export routes
  app.get("/api/export/meetings", async (req, res) => {
    try {
      const meetings = await storage.getAllMeetings();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="meetings.json"');
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to export meetings" });
    }
  });

  app.get("/api/export/action-items", async (req, res) => {
    try {
      const actionItems = await storage.getAllActionItems();
      
      // Convert to CSV format
      const csvHeader = 'ID,Meeting ID,Title,Description,Assignee,Status,Due Date,Created At\n';
      const csvRows = actionItems.map(item => 
        `${item.id},"${item.meetingId}","${item.title}","${item.description || ''}","${item.assignee || ''}","${item.status}","${item.dueDate || ''}","${item.createdAt}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="action-items.csv"');
      res.send(csvHeader + csvRows);
    } catch (error) {
      res.status(500).json({ message: "Failed to export action items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background processing function
async function processAudioFile(meetingId: number, audioPath: string, autoAnalysis: boolean) {
  try {
    // Update status to processing
    await storage.updateMeeting(meetingId, { status: "processing" });

    // Transcribe audio
    const transcriptionResult = await transcribeAudio(audioPath);
    
    // Update meeting with transcription
    await storage.updateMeeting(meetingId, { 
      transcription: transcriptionResult.text,
      duration: Math.round(transcriptionResult.duration || 0),
      status: "transcribed" 
    });

    // Extract action items if requested
    if (autoAnalysis && transcriptionResult.text) {
      const actionItems = await extractActionItems(transcriptionResult.text);
      
      // Create action items in storage
      for (const item of actionItems) {
        await storage.createActionItem({
          meetingId,
          title: item.title,
          description: item.description,
          assignee: item.assignee,
          status: "pending",
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
        });
      }
    }

    // Clean up uploaded file
    fs.unlink(audioPath, (err) => {
      if (err) console.error("Failed to delete uploaded file:", err);
    });

  } catch (error) {
    console.error("Error processing audio file:", error);
    await storage.updateMeeting(meetingId, { status: "error" });
  }
}
