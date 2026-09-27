import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ChatMessage { id: string; role: "user" | "assistant"; text: string }

/** Chat thread for an AI assistant: bubbles, typing dots and the last answer streaming in word by word. */
export function ChatBubbles({ messages, typing = false, stream = true, className }: { messages: ChatMessage[]; typing?: boolean; stream?: boolean; className?: string }) {
  const end = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  const [shown, setShown] = useState(last?.text ?? "");
  useEffect(() => {
    if (!stream || !last || last.role !== "assistant") { setShown(last?.text ?? ""); return; }
    const words = last.text.split(" "); let i = 0; setShown("");
    const t = setInterval(() => { i++; setShown(words.slice(0, i).join(" ")); if (i >= words.length) clearInterval(t); }, 45);
    return () => clearInterval(t);
  }, [last?.id, last?.text, last?.role, stream]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [shown, typing, messages.length]);
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {messages.map(m => (
        <div key={m.id} className={cn("max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed", m.role === "user" ? "self-end rounded-br-md bg-zinc-900 text-white" : "self-start rounded-bl-md bg-zinc-100 text-zinc-900")}>
          {m === last && m.role === "assistant" ? shown : m.text}
        </div>
      ))}
      {typing && (
        <div className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-3" aria-label="Digitando">
          {[0, 1, 2].map(i => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
