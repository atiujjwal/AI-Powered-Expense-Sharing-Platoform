// src/lib/ai-services.ts
import { Decimal } from "decimal.js";
import { v4 as uuidv4 } from "uuid";

Decimal.set({ precision: 12 });

// --- AI Service Response Types ---
export interface DraftExpense {
  merchant: string | null;
  date: string | null;
  amount: string | null;
  currency: string;
  category_suggestion: string | null;
  confidence_score: number;
  line_items?: { item: string; amount: string }[];
}

export interface AnalyticsIntent {
  action: "get_summary" | "unknown";
  period: string | null;
  category: string | null;
}

// --- Mock OCR Service ---
export class OcrService {
  /**
   * Mock: Scans a receipt image and returns a draft expense.
   */
  static async scan(imageBuffer: Buffer): Promise<DraftExpense> {
    console.log(`[OcrService] Scanning ${imageBuffer.length} bytes...`);
    // Simulate AI processing time
    await new Promise((res) => setTimeout(res, 1500));

    // Return the mock response from your spec
    return {
      merchant: "PIZZA PALACE",
      date: new Date().toISOString(),
      amount: "35.50",
      currency: "INR",
      category_suggestion: "Food",
      confidence_score: 0.95,
      line_items: [
        { item: "Pepperoni Pizza", amount: "28.00" },
        { item: "Coke", amount: "7.50" },
      ],
    };
  }
}

// --- Mock STT (Speech-to-Text) Service ---
export class SttService {
  /**
   * Mock: Transcribes an audio file and returns the text.
   */
  static async transcribe(audioBuffer: Buffer): Promise<string> {
    console.log(`[SttService] Transcribing ${audioBuffer.length} bytes...`);
    await new Promise((res) => setTimeout(res, 3000));
    return "I spent 500 rupees on groceries at BigBasket";
  }
}

// --- Mock NLP (Natural Language Processing) Service ---
export class NlpService {
  /**
   * Mock: Parses a transcript and returns a draft expense.
   */
  static async parseVoiceExpense(transcript: string): Promise<DraftExpense> {
    console.log(`[NlpService] Parsing transcript: "${transcript}"`);
    await new Promise((res) => setTimeout(res, 1000));

    // This would be done by a real LLM (e.g., GPT-4 Function Calling)
    if (transcript.includes("BigBasket")) {
      return {
        merchant: "BigBasket",
        date: new Date().toISOString(),
        amount: "500.00",
        currency: "INR",
        category_suggestion: "Groceries",
        confidence_score: 0.9,
      };
    }
    // ... more logic
    return {
      merchant: null,
      date: new Date().toISOString(),
      amount: null,
      currency: "INR",
      category_suggestion: null,
      confidence_score: 0.3,
    };
  }

  /**
   * Mock: Parses a user's query to determine their intent (for RAG).
   */
  static async parseQueryIntent(query: string): Promise<AnalyticsIntent> {
    console.log(`[NlpService] Parsing query: "${query}"`);
    await new Promise((res) => setTimeout(res, 500));

    // This is a simplified parser. A real app might use an LLM.
    let period: string | null = null;
    let category: string | null = null;

    if (query.toLowerCase().includes("last month")) {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      period = lastMonth.toISOString().substring(0, 7); // "YYYY-MM"
    }
    if (query.toLowerCase().includes("food")) {
      category = "Food";
    }

    if (period || category) {
      return { action: "get_summary", period, category };
    }
    return { action: "unknown", period: null, category: null };
  }

  /**
   * Mock: Generates a natural language answer based on a prompt and data (RAG).
   */
  static async generateRagResponse(
    userQuery: string,
    data: any
  ): Promise<string> {
    console.log(`[NlpService] Generating RAG response...`);
    await new Promise((res) => setTimeout(res, 1000));

    // This is the core RAG logic from your spec
    const prompt = `
      You are a financial assistant.
      The user asked: "${userQuery}"
      Based *only* on the following data, provide a friendly, natural language answer.
      DATA: ${JSON.stringify(data)}
    `;

    // Simulating LLM response generation
    if (data.total_spent && new Decimal(data.total_spent).greaterThan(0)) {
      return `You spent ₹${data.total_spent} on food last month.`;
    }
    return "You didn't spend any money on food last month.";
  }
}

// --- Mock File Storage Service ---
export class FileStorageService {
  /**
   * Mock: Uploads a file to cloud storage (e.g., S3) and returns its path.
   */
  static async upload(fileBuffer: Buffer, filename: string): Promise<string> {
    console.log(
      `[FileStorage] Uploading ${filename} (${fileBuffer.length} bytes)`
    );
    await new Promise((res) => setTimeout(res, 500));
    const uniqueFilename = `${uuidv4()}-${filename}`;
    return `cloud-storage-path/${uniqueFilename}`;
  }
}
