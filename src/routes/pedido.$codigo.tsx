import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { flowFor, money, STATUS_LABEL, type OrderStatus } from "@/lib/order-status";

export const Route = createFileRoute("/pedido/$codigo")({
  validateSearch: z.object({ t: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Acompanhe seu pedido — Pavão Flamejante" },
      { name: "description", content: "Status do seu pedido no Pavão Flamejante em tempo real." },
      { property: "og:title", content: "Acompanhe seu pedido — Pavão Flamejante" },
      { property: "og:description", content: "Status do seu pedido em tempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

type Order = {
  codigo: string; status: OrderStatus; tipo: string; cliente_nome: string; endereco: string | null;
  subtotal: number; taxa_entrega: number; total: number; observacoes: string | null; created_at: string; updated_at: string;
  itens: { nome: string; quantidade: number; adicionais: { nome: string }[]; retirar: string | null; observacoes: string | null; total: number }[];
};

function TrackPage() {
  const { codigo } = Route.useParams();
  const { t } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "notfound">("loading");
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || !t) { setState("notfound"); return; }
    const { data } = await supabase.rpc("obter_pedido", { p_codigo: codigo, p_token: t });
    if (data) { setOrder(data as Order); setState("ok"); } else setState("notfound");
  }, [codigo, t]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!supabase || !t) return;
    const sb = supabase;
    const ch = sb.channel(`pedido-${t}`)
      .on("broadcast", { event: "status" }, () => load())
      .subscribe((s) => setLive(s === "SUBSCRIBED"));
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    const slow = setInterval(load, 60000); // rede de segurança leve
    return () => { sb.removeChannel(ch); clearInterval(slow); document.removeEventListener("visibilitychange", onVisible); };
  }, [t, load]);

  return (
    <main className="min-h-screen px-4 pb-16 pt-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.35em] text-primary">Seu pedido</p>
        <h1 className="mt-3 font-display text-5xl">{codigo.toUpperCase()}</h1>
        {state === "loading" && <p className="mt-6 text-muted-foreground">Carregando...</p>}
        {state === "notfound" && (
          <div className="mt-6 rounded-2xl border border-border p-6">
            <p>Não encontramos este pedido. Use o link recebido ao finalizar o pedido.</p>
            <Link to="/" hash="cardapio" className="mt-4 inline-block text-primary underline">Voltar ao cardápio</Link>
          </div>
        )}
        {order && (
          <>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-400 motion-safe:animate-pulse" : "bg-zinc-500"}`} />
              {live ? "Atualizando ao vivo" : "Conectando..."} · feito às {new Date(order.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>

            {order.status === "cancelado" ? (
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-red-400/40 bg-red-500/10 p-5 text-red-200"><X className="h-5 w-5" /> Pedido cancelado. Em caso de dúvida, fale com o restaurante.</div>
            ) : (
              <ol className="mt-8 space-y-3" aria-label="Etapas do pedido">
                {(() => {
                  const flow = flowFor(order.tipo);
                  const idx = flow.indexOf(order.status);
                  return flow.map((s, i) => {
                    const done = i < idx || order.status === "concluido";
                    const cur = i === idx && order.status !== "concluido";
                    return (
                      <li key={s} className={`flex items-center gap-3 rounded-xl border p-4 transition-colors duration-500 ${cur ? "border-orange-400/60 bg-orange-500/10" : done ? "border-border" : "border-border/50 opacity-50"}`}>
                        <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${done ? "bg-emerald-500/20 text-emerald-300" : cur ? "bg-orange-500/30 text-orange-100" : "bg-muted"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span>
                        <span className={cur ? "font-medium" : ""}>{STATUS_LABEL[s]}</span>
                        {cur && <span className="ml-auto text-xs text-orange-300">agora</span>}
                      </li>
                    );
                  });
                })()}
              </ol>
            )}

            <section className="mt-8 rounded-2xl border border-border p-5">
              <h2 className="font-display text-2xl">Resumo</h2>
              <ul className="mt-3 divide-y divide-border text-sm">
                {order.itens.map((i, k) => (
                  <li key={k} className="flex justify-between gap-3 py-2">
                    <div>
                      <p>{i.quantidade}x {i.nome}</p>
                      {i.adicionais?.length > 0 && <p className="text-xs text-muted-foreground">+ {i.adicionais.map((a) => a.nome).join(", ")}</p>}
                      {i.retirar && <p className="text-xs text-muted-foreground">Sem: {i.retirar}</p>}
                      {i.observacoes && <p className="text-xs text-muted-foreground">Obs.: {i.observacoes}</p>}
                    </div>
                    <span>{money(i.total)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                <p className="text-muted-foreground">{order.tipo === "entrega" ? `Entrega: ${order.endereco}` : "Retirada no restaurante"}</p>
                {Number(order.taxa_entrega) > 0 && <p className="flex justify-between"><span>Taxa de entrega</span><span>{money(order.taxa_entrega)}</span></p>}
                <p className="flex justify-between text-lg font-semibold text-primary"><span>Total</span><span>{money(order.total)}</span></p>
              </div>
            </section>
            <p className="mt-4 text-xs text-muted-foreground">Guarde este link para acompanhar seu pedido.</p>
          </>
        )}
      </div>
    </main>
  );
}
