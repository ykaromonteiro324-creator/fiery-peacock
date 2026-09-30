import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellOff, Bike, Search, Store } from "lucide-react";
import { AdminRoute } from "@/components/auth-routes";
import { supabase } from "@/lib/supabase";
import { money, ORDER_STATUSES, STATUS_LABEL, STATUS_TONE, type OrderStatus } from "@/lib/order-status";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos — Painel Pavão Flamejante" },
      { name: "description", content: "Pedidos em tempo real do Pavão Flamejante." },
      { property: "og:title", content: "Pedidos — Painel Pavão Flamejante" },
      { property: "og:description", content: "Pedidos em tempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AdminRoute><OrdersBoard /></AdminRoute>,
});

type Item = { id: string; nome: string; quantidade: number; adicionais: { nome: string; preco: number }[]; retirar: string | null; observacoes: string | null; total: number };
type Order = {
  id: string; codigo: string; cliente_nome: string; cliente_telefone: string; tipo: string; endereco: string | null;
  status: OrderStatus; subtotal: number; taxa_entrega: number; total: number; observacoes: string | null; created_at: string;
  pedido_itens: Item[];
};

const NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  recebido: ["confirmado", "cancelado"],
  confirmado: ["em_preparo", "cancelado"],
  em_preparo: ["pronto", "cancelado"],
  pronto: ["saiu_para_entrega", "concluido"],
  saiu_para_entrega: ["concluido"],
};

const fmtPhone = (d: string) => d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}` : d;

function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.18].forEach((t) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(0.15, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.16);
    });
  } catch {}
}

function OrdersBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "ativos" | "todos">("ativos");
  const [q, setQ] = useState("");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [sound, setSound] = useState(false);
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const soundRef = useRef(sound); soundRef.current = sound;

  const fetchOne = useCallback(async (id: string) => {
    if (!supabase) return null;
    const { data } = await supabase.from("pedidos").select("*, pedido_itens(*)").eq("id", id).maybeSingle();
    return data as Order | null;
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;
    sb.from("pedidos").select("*, pedido_itens(*)").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setOrders((data as Order[]) ?? []); setLoading(false); });

    const ch = sb.channel("admin-pedidos")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pedidos" }, async (p) => {
        const id = (p.new as { id: string }).id;
        // itens são gravados na mesma transação; buscamos o pedido completo
        const full = await fetchOne(id);
        if (!full) return;
        setOrders((cur) => cur.some((o) => o.id === id) ? cur : [full, ...cur]);
        setFresh((s) => new Set(s).add(id));
        setTimeout(() => setFresh((s) => { const n = new Set(s); n.delete(id); return n; }), 12000);
        if (soundRef.current) beep();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pedidos" }, (p) => {
        const n = p.new as Order;
        setOrders((cur) => cur.map((o) => o.id === n.id ? { ...o, ...n, pedido_itens: o.pedido_itens } : o));
      })
      .subscribe((s) => setLive(s === "SUBSCRIBED"));
    return () => { sb.removeChannel(ch); };
  }, [fetchOne]);

  const setStatus = async (o: Order, status: OrderStatus) => {
    if (!supabase) return;
    if (status === "cancelado" && !confirm(`Cancelar o pedido ${o.codigo}?`)) return;
    setBusy(o.id);
    const { error } = await supabase.from("pedidos").update({ status }).eq("id", o.id);
    setBusy(null);
    if (error) alert("Não foi possível alterar o status.");
    else setOrders((cur) => cur.map((x) => x.id === o.id ? { ...x, status } : x));
  };

  const counts = useMemo(() => {
    const c = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
    orders.forEach((o) => c[o.status]++);
    return c;
  }, [orders]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase(); const digits = term.replace(/\D/g, "");
    return orders.filter((o) => {
      if (filter === "ativos" && (o.status === "concluido" || o.status === "cancelado")) return false;
      if (filter !== "ativos" && filter !== "todos" && o.status !== filter) return false;
      if (!term) return true;
      return o.codigo.toLowerCase().includes(term) || o.cliente_nome.toLowerCase().includes(term) || (!!digits && o.cliente_telefone.includes(digits));
    });
  }, [orders, filter, q]);

  const chip = (active: boolean) => `shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${active ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`;

  return (
    <main className="min-h-screen px-4 pb-16 pt-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground">← Painel</Link>
            <h1 className="mt-1 font-display text-4xl sm:text-5xl">Pedidos</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-400 motion-safe:animate-pulse" : "bg-zinc-500"}`} />
              {live ? "Ao vivo — novos pedidos aparecem automaticamente" : "Conectando..."}
            </p>
          </div>
          <button type="button" onClick={() => { setSound((s) => !s); if (!sound) beep(); }} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted">
            {sound ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4" />} Som {sound ? "ligado" : "desligado"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {ORDER_STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => setFilter(s)} className={`rounded-xl border p-3 text-left transition ${filter === s ? "ring-1 ring-primary" : ""} ${STATUS_TONE[s]}`}>
              <p className="text-[11px] uppercase tracking-wider opacity-80">{STATUS_LABEL[s]}</p>
              <p className="mt-1 text-2xl font-semibold">{counts[s]}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button type="button" className={chip(filter === "ativos")} onClick={() => setFilter("ativos")}>Em andamento</button>
            <button type="button" className={chip(filter === "todos")} onClick={() => setFilter("todos")}>Todos</button>
          </div>
          <label className="relative sm:ml-auto sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Código, nome ou telefone" className="h-10 w-full rounded-xl border border-border bg-transparent pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </label>
        </div>

        {loading ? <p className="mt-10 text-center text-muted-foreground">Carregando pedidos...</p> : !shown.length ? (
          <p className="mt-10 rounded-2xl border border-border p-10 text-center text-muted-foreground">Nenhum pedido aqui.</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((o) => (
              <article key={o.id} className={`flex flex-col rounded-2xl border bg-card p-5 transition-all duration-700 ${fresh.has(o.id) ? "border-orange-400 shadow-[0_0_0_3px_rgba(251,146,60,.25),0_20px_50px_rgba(249,115,22,.15)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2" : "border-border"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg font-semibold">{o.codigo} {fresh.has(o.id) && <span className="ml-1 rounded bg-orange-500 px-1.5 py-0.5 align-middle text-[10px] font-sans text-white">NOVO</span>}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs ${STATUS_TONE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  <p className="font-medium">{o.cliente_nome}</p>
                  <a href={`tel:${o.cliente_telefone}`} className="text-muted-foreground hover:text-foreground">{fmtPhone(o.cliente_telefone)}</a>
                  <p className="flex items-start gap-2 text-muted-foreground">
                    {o.tipo === "entrega" ? <Bike className="mt-0.5 h-4 w-4 shrink-0" /> : <Store className="mt-0.5 h-4 w-4 shrink-0" />}
                    {o.tipo === "entrega" ? o.endereco : "Retirada"}
                  </p>
                </div>
                <ul className="mt-4 divide-y divide-border border-y border-border text-sm">
                  {o.pedido_itens?.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p>{i.quantidade}x {i.nome}</p>
                        {i.adicionais?.length > 0 && <p className="text-xs text-orange-300/80">+ {i.adicionais.map((a) => a.nome).join(", ")}</p>}
                        {i.retirar && <p className="text-xs text-muted-foreground">Sem: {i.retirar}</p>}
                        {i.observacoes && <p className="text-xs text-muted-foreground">Obs.: {i.observacoes}</p>}
                      </div>
                      <span className="shrink-0">{money(i.total)}</span>
                    </li>
                  ))}
                </ul>
                {o.observacoes && <p className="mt-3 rounded-lg bg-muted/40 p-2 text-xs">Obs. do pedido: {o.observacoes}</p>}
                <p className="mt-3 flex justify-between font-semibold"><span>Total</span><span className="text-primary">{money(o.total)}</span></p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(NEXT[o.status] ?? []).filter((s) => !(o.tipo === "retirada" && s === "saiu_para_entrega")).map((s) => (
                    <button key={s} type="button" disabled={busy === o.id} onClick={() => setStatus(o, s)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${s === "cancelado" ? "border-red-400/30 text-red-300 hover:bg-red-500/10" : "border-primary/40 bg-primary/10 hover:bg-primary/20"}`}>
                      {s === "cancelado" ? "Cancelar" : `→ ${STATUS_LABEL[s]}`}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
