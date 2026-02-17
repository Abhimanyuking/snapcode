import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("GROQ_API_KEY environment variable is not set");

const groq = new Groq({ apiKey });

const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const TEXT_MODEL = "llama-3.3-70b-versatile";

// Faster alternative vision model (11B = faster inference, less detail)
const VISION_MODEL_FAST = "llama-3.2-11b-vision-preview";

interface ImageInput {
  mimeType: string;
  data: string; // base64
}

/** Generate code from one or more screenshots */
export async function generateFromImages(
  prompt: string,
  images: ImageInput[],
  fast = false
): Promise<string> {
  const content: Groq.Chat.ChatCompletionContentPart[] = [
    { type: "text", text: prompt },
    ...images.map((img) => ({
      type: "image_url" as const,
      image_url: { url: `data:${img.mimeType};base64,${img.data}` },
    })),
  ];

  const model = fast ? VISION_MODEL_FAST : VISION_MODEL;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content }],
    max_tokens: 8192,
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content || "";
}

/** Edit code using text model */
export async function editCode(prompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: TEXT_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 8192,
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content || "";
}
