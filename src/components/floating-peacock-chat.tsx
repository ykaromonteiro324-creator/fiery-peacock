import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X, Grip } from "lucide-react";
import { ChatBubbles, type ChatMessage } from "@/components/ui/chat-bubbles";
import { cn } from "@/lib/utils";

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Olá! 🔥🦚 Sou o assistente do Pavão Flamejante. Pode me perguntar qualquer coisa sobre nossos produtos, pedidos ou serviços.",
  },
];

export function FloatingPeacockChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const movedRef = useRef(false);

  useEffect(() => {
    const clamp = () => {
      setPosition((p) =>
        p
          ? {
              x: Math.min(p.x, Math.max(0, window.innerWidth - 110)),
              y: Math.min(p.y, Math.max(0, window.innerHeight - 110)),
            }
          : p,
      );
    };
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, []);

  const current = position ?? (typeof window !== "undefined"
    ? { x: window.innerWidth - 102, y: window.innerHeight - 102 }
    : { x: 0, y: 0 });

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const dx = event.clientX - dragRef.current.startX;
      const dy = event.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
      setPosition({
        x: Math.min(Math.max(12, dragRef.current.originX + dx), Math.max(12, window.innerWidth - 100)),
        y: Math.min(Math.max(12, dragRef.current.originY + dy), Math.max(12, window.innerHeight - 100)),
      });
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: current.x,
      originY: current.y,
    };
    movedRef.current = false;
    setDragging(true);
  };

  const toggle = () => {
    if (!movedRef.current) setOpen((value) => !value);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, text }) => ({ role, text })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível responder agora.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Não consegui responder agora. Tente novamente em alguns segundos.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed z-[100] w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-orange-400/30 bg-zinc-950/95 shadow-[0_20px_80px_rgba(0,0,0,0.55),0_0_45px_rgba(249,115,22,0.18)] backdrop-blur-xl"
          style={{
            ...(position
              ? {
                  left: Math.max(12, Math.min(position.x - 300, window.innerWidth - 402)),
                  top: Math.max(12, Math.min(position.y - 470, window.innerHeight - 480)),
                }
              : { right: 12, bottom: 104 }),
          }}
        >
          <div className="relative overflow-hidden border-b border-white/10 px-5 py-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(249,115,22,0.28),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.22),transparent_45%)]" />
            <div className="relative flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-orange-300/30 bg-gradient-to-br from-orange-500 via-red-500 to-sky-500 text-xl shadow-[0_0_25px_rgba(249,115,22,0.35)]">
                🦚
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base text-white">Conversa com IA</p>
                <p className="text-xs text-zinc-400">Seu guia pelo Pavão Flamejante</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar conversa"
                className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[330px] overflow-y-auto p-4">
            <ChatBubbles messages={messages} typing={typing} />
          </div>

          <div className="border-t border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 focus-within:border-orange-400/50">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Digite sua dúvida..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
                aria-label="Digite sua dúvida"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || typing}
                aria-label="Enviar dúvida"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="fixed z-[101] select-none"
        style={position ? { left: position.x, top: position.y, touchAction: "none" } : { right: 24, bottom: 24, touchAction: "none" }}
      >
        <button
          type="button"
          onPointerDown={startDrag}
          onClick={toggle}
          aria-label={open ? "Fechar assistente do Pavão Flamejante" : "Tirar dúvidas com o Pavão Flamejante"}
          className={cn(
            "group relative grid h-[78px] w-[78px] cursor-grab place-items-center rounded-full active:cursor-grabbing",
            dragging && "scale-110",
          )}
        >
          <span className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl transition duration-500 group-hover:bg-orange-400/40" />
          <span className="absolute inset-0 rounded-full border border-orange-300/30 bg-gradient-to-br from-orange-500 via-red-600 to-sky-600 p-[3px] shadow-[0_0_30px_rgba(249,115,22,0.45)] transition duration-300 group-hover:scale-110 group-hover:rotate-3">
            <span className="grid h-full w-full place-items-center rounded-full bg-zinc-950">
              <span className="relative text-[31px] drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">🦚</span>
            </span>
          </span>
          <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full border border-sky-300/30 bg-sky-500 text-white shadow-lg">
            {open ? <X className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
          </span>
          <span className="pointer-events-none absolute -bottom-9 whitespace-nowrap rounded-full border border-orange-300/20 bg-zinc-950/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-200 opacity-0 shadow-xl backdrop-blur transition duration-200 group-hover:opacity-100">
            Tirar dúvidas
          </span>
          <Sparkles className="absolute -left-1 -top-1 h-4 w-4 animate-pulse text-orange-300" />
          <Grip className="absolute -bottom-1 -left-1 h-4 w-4 text-zinc-400/70" />
        </button>
      </div>
    </>
  );
}
