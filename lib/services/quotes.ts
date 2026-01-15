/**
 * Quote Service - Three-tier fallback system
 * 
 * Tier 1: OpenAI API (primary) - Unique AI-generated quotes
 * Tier 2: Quotable API (fallback) - Free quote service
 * Tier 3: Simple message (final fallback) - Always works
 */

interface QuoteResult {
  quote: string;
  source: "openai" | "quotable" | "fallback";
  error?: string;
}

/**
 * Get daily quote using OpenAI API
 */
async function getOpenAIQuote(): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const prompt = `Generate a short, motivational quote (1-2 sentences) suitable for a family good morning message. Make it uplifting and inspiring. Keep it under 150 characters. Return only the quote text, no additional explanation.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const quote = data.choices?.[0]?.message?.content?.trim();

    if (!quote) {
      throw new Error("OpenAI API returned empty quote");
    }

    return quote;
  } catch (error: any) {
    console.error("[Quote Service] OpenAI error:", error);
    throw error;
  }
}

/**
 * Get daily quote using Quotable API (free service)
 */
async function getQuotableQuote(): Promise<string> {
  try {
    const response = await fetch(
      "https://api.quotable.io/random?tags=motivational,inspirational&maxLength=150",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Quotable API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const quote = data.content?.trim();

    if (!quote) {
      throw new Error("Quotable API returned empty quote");
    }

    return quote;
  } catch (error: any) {
    console.error("[Quote Service] Quotable API error:", error);
    throw error;
  }
}

/**
 * Get fallback message (always works)
 */
function getFallbackMessage(): string {
  return "Have a wonderful day filled with joy and positivity!";
}

/**
 * Get daily quote with three-tier fallback system
 * 
 * @returns Quote result with source information
 */
export async function getDailyQuote(): Promise<QuoteResult> {
  // Tier 1: Try OpenAI API
  try {
    console.log("[Quote Service] Attempting OpenAI API...");
    const quote = await getOpenAIQuote();
    console.log("[Quote Service] OpenAI quote retrieved successfully");
    return {
      quote,
      source: "openai",
    };
  } catch (error: any) {
    console.log("[Quote Service] OpenAI failed, trying Quotable API...");
    
    // Tier 2: Try Quotable API
    try {
      const quote = await getQuotableQuote();
      console.log("[Quote Service] Quotable quote retrieved successfully");
      return {
        quote,
        source: "quotable",
        error: error.message,
      };
    } catch (quotableError: any) {
      console.log("[Quote Service] Quotable failed, using fallback message...");
      
      // Tier 3: Use fallback message
      return {
        quote: getFallbackMessage(),
        source: "fallback",
        error: `OpenAI: ${error.message}, Quotable: ${quotableError.message}`,
      };
    }
  }
}

