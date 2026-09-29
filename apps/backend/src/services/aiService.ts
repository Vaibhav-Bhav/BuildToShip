import Groq from "groq-sdk";
import type { Case } from "@workspace/db";
import { z } from "zod";

const triageSchema = z.object({
  category: z.string(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

export async function triageTicket(title: string, description: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { category: "Other", priority: "Medium" };
  }

  const groq = new Groq({ apiKey });

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a ticket triage assistant. Return a JSON object with `category` (e.g., 'Hardware', 'Software', 'Billing', 'Delivery') and `priority` (e.g., 'Low', 'Medium', 'High', 'Critical') based on the ticket content. Only return JSON.",
        },
        {
          role: "user",
          content: `Title: ${title}\nDescription: ${description}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = triageSchema.safeParse(JSON.parse(content));
    if (parsed.success) {
      return parsed.data;
    }
    return { category: "Other", priority: "Medium" };
  } catch (error) {
    console.error("Groq triage error:", error);
    return { category: "Other", priority: "Medium" };
  }
}

export async function generateDraftReply(ticketContext: string, messageHistory: any[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return "Thank you for reaching out. An agent will be with you shortly.";
  }

  const groq = new Groq({ apiKey });

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a polite, empathetic customer support agent. Draft a brief, helpful reply to the customer's latest message based on the ticket context and message history. Do not include signature placeholders.",
        },
        {
          role: "user",
          content: `Ticket Context:\n${ticketContext}\n\nMessage History:\n${JSON.stringify(messageHistory)}`,
        },
      ],
    });

    return response.choices[0]?.message?.content || "Thank you for reaching out. An agent will be with you shortly.";
  } catch (error) {
    console.error("Groq reply error:", error);
    return "Thank you for reaching out. An agent will be with you shortly.";
  }
}

// Keep generateResolutionPlan for existing routes that use it
export async function generateResolutionPlan(caseData: Case): Promise<string[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return ["Verify the order details", "Review evidence", "Confirm resolution"];
  const groq = new Groq({ apiKey });
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a resolution copilot. Return JSON format {\"steps\": [\"...\"]} with 4 to 6 steps." },
        { role: "user", content: `Create a practical resolution plan for this case:\n${JSON.stringify(caseData)}` },
      ],
    });
    const parsed = z.object({ steps: z.array(z.string()) }).safeParse(JSON.parse(response.choices[0]?.message?.content || "{}"));
    return parsed.success ? parsed.data.steps : ["Verify the order details", "Review evidence"];
  } catch {
    return ["Verify the order details", "Review evidence"];
  }
}
