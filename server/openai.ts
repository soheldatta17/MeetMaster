import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export interface ExtractedActionItem {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
}

export async function transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
  try {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error("Audio file not found");
    }

    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      response_format: "verbose_json",
      language: "en", // Can be made configurable
    });

    return {
      text: transcription.text,
      duration: transcription.duration || 0,
    };
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractActionItems(transcriptionText: string): Promise<ExtractedActionItem[]> {
  try {
    if (!transcriptionText || transcriptionText.trim().length === 0) {
      return [];
    }

    const prompt = `
You are an AI assistant specialized in analyzing meeting transcripts and extracting actionable items. 

Please analyze the following meeting transcript and extract all action items, tasks, follow-ups, and commitments mentioned. For each action item, provide:

1. title: A clear, concise description of the action (required)
2. description: Additional context or details if available (optional)
3. assignee: The person responsible if mentioned by name (optional)
4. dueDate: If a specific deadline is mentioned, format as ISO date string (optional)

Return your response as a JSON object with an "actionItems" array. If no action items are found, return an empty array.

Example format:
{
  "actionItems": [
    {
      "title": "Follow up with marketing team on campaign results",
      "description": "Review Q3 campaign performance metrics and prepare summary",
      "assignee": "Sarah",
      "dueDate": "2024-01-15T00:00:00.000Z"
    }
  ]
}

Meeting transcript:
${transcriptionText}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing meeting transcripts and identifying action items. Always respond with valid JSON in the specified format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent extraction
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"actionItems": []}');
    
    // Validate and clean the extracted action items
    const actionItems = result.actionItems || [];
    return actionItems
      .filter((item: any) => item.title && typeof item.title === 'string' && item.title.trim().length > 0)
      .map((item: any) => ({
        title: item.title.trim(),
        description: item.description && typeof item.description === 'string' ? item.description.trim() : undefined,
        assignee: item.assignee && typeof item.assignee === 'string' ? item.assignee.trim() : undefined,
        dueDate: item.dueDate && typeof item.dueDate === 'string' ? item.dueDate : undefined,
      }));

  } catch (error) {
    console.error("Error extracting action items:", error);
    throw new Error(`Failed to extract action items: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function summarizeMeeting(transcriptionText: string): Promise<string> {
  try {
    if (!transcriptionText || transcriptionText.trim().length === 0) {
      return "";
    }

    const prompt = `
Please provide a concise summary of the following meeting transcript. Focus on:
- Key topics discussed
- Important decisions made
- Main outcomes and next steps

Keep the summary professional and factual, highlighting the most important points discussed.

Meeting transcript:
${transcriptionText}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at summarizing meeting content. Provide clear, concise summaries that capture the essential information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";

  } catch (error) {
    console.error("Error summarizing meeting:", error);
    throw new Error(`Failed to summarize meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractKeyTopics(transcriptionText: string): Promise<string[]> {
  try {
    if (!transcriptionText || transcriptionText.trim().length === 0) {
      return [];
    }

    const prompt = `
Please analyze the following meeting transcript and extract the main topics or themes discussed. 

Return your response as a JSON object with a "topics" array containing 3-7 key topics as strings.

Example format:
{
  "topics": ["Budget Planning", "Project Timeline", "Team Assignments", "Marketing Strategy"]
}

Meeting transcript:
${transcriptionText}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing meeting content and identifying key topics. Always respond with valid JSON in the specified format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"topics": []}');
    const topics = result.topics || [];
    
    return topics
      .filter((topic: any) => typeof topic === 'string' && topic.trim().length > 0)
      .map((topic: string) => topic.trim());

  } catch (error) {
    console.error("Error extracting key topics:", error);
    throw new Error(`Failed to extract key topics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Health check function to verify OpenAI API connectivity
export async function checkOpenAIConnection(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5,
    });
    
    return response.choices.length > 0;
  } catch (error) {
    console.error("OpenAI connection check failed:", error);
    return false;
  }
}
