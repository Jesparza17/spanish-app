import { Fragment, type ReactNode } from "react";

// Minimal renderer for the small markdown subset grammarTopics.seed.ts
// actually uses: **bold**, *italic*, "- " bullet lists, blank-line
// paragraphs. Not a general markdown parser — intentionally narrow.

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter((p) => p !== "");
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function renderMiniMarkdown(markdown: string): ReactNode[] {
  const blocks = markdown.trim().split(/\n\n+/);
  return blocks.map((block, i) => {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length > 0 && lines.every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={i} className="list-disc pl-5 space-y-1">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.trim().replace(/^- /, ""))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i}>
        {lines.map((l, j) => (
          <Fragment key={j}>
            {renderInline(l)}
            {j < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    );
  });
}
