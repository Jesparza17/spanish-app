// Thin wrapper around the Claude API for the content pipeline. Two-step
// pattern per batch: (1) a free-text drafting turn with web_search enabled,
// so generation can ground itself in real usage rather than the model's
// unaided memory; (2) a second, tool-forced turn that extracts that draft
// into the exact structured shape we need — forcing structure and allowing
// web search don't mix well in a single turn, so they're split.

import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY in .env.local — required to run the content pipeline.");
}

export const anthropic = new Anthropic({ apiKey });
export const MODEL = "claude-opus-5";

export async function researchAndDraft(instructions: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 8 }],
    messages: [{ role: "user", content: instructions }],
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

export async function extractStructured<T>(
  draftText: string,
  toolName: string,
  toolDescription: string,
  schema: Anthropic.Tool.InputSchema
): Promise<T> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    tool_choice: { type: "tool", name: toolName },
    tools: [{ name: toolName, description: toolDescription, input_schema: schema }],
    messages: [
      {
        role: "user",
        content: `Extract the drafted content below into the ${toolName} tool call. Preserve the wording exactly as drafted — do not paraphrase, translate again, or invent new items.\n\n${draftText}`,
      },
    ],
  });

  const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
  if (!toolUse) throw new Error(`Model did not call ${toolName} while extracting structured output.`);
  return toolUse.input as T;
}

export interface Verdict {
  pass: boolean;
  reason: string;
}

const VERDICT_SCHEMA: Anthropic.Tool.InputSchema = {
  type: "object",
  properties: {
    pass: { type: "boolean", description: "True only if every criterion is met with no doubt." },
    reason: { type: "string", description: "One sentence: why it passed, or the specific defect that failed it." },
  },
  required: ["pass", "reason"],
  additionalProperties: false,
};

/** One independent, fresh-context critic pass — no shared history with generation or other verifiers. */
export async function verifyCandidate(candidateDescription: string, criteria: string): Promise<Verdict> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    tool_choice: { type: "tool", name: "emit_verdict" },
    tools: [{ name: "emit_verdict", description: "Report whether the candidate passes review.", input_schema: VERDICT_SCHEMA }],
    messages: [
      {
        role: "user",
        content: `You are a strict, skeptical Mexican Spanish grammar and register critic. You did not write the candidate below and have no stake in it passing — the default when uncertain is to fail it.\n\nCandidate:\n${candidateDescription}\n\nCriteria (ALL must hold for pass=true):\n${criteria}\n\nCall emit_verdict.`,
      },
    ],
  });

  const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
  if (!toolUse) throw new Error("Verifier did not return a verdict.");
  return toolUse.input as Verdict;
}

/** Requires unanimous agreement across N independent verifier passes — stricter than majority vote. */
export async function passesUnanimousVerification(candidateDescription: string, criteria: string, panelSize = 3): Promise<boolean> {
  const verdicts = await Promise.all(
    Array.from({ length: panelSize }, () => verifyCandidate(candidateDescription, criteria))
  );
  return verdicts.every((v) => v.pass);
}
