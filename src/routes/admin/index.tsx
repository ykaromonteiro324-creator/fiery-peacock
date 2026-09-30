import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminRoute } from "@/components/auth-routes";
import { supabase } from "@/lib/supabase";

type CountState = { produtos:number; categorias:number; pedidos:number; agendamentos:number; leads:number };

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });
function AdminDashboard(){ return <AdminRoute><Dashboard/></AdminRoute>; }

function Dashboard(){
 const [counts,setCounts]=useState<CountState>({produtos:0,categorias:0,pedidos:0,agendamentos:0,leads:0});
 const [loading,setLoading]=useState(true);
 useEffect(()=>{let alive=true;(async()=>{if(!supabase){setLoading(false);return;}const tables=["produtos","categorias","pedidos_online","agendamentos","leads"] as const;const results=await Promise.all(tables.map(async table=>{const {count}=await supabase.from(table).select("*",{count:"exact",head:true});return count??0;}));if(alive){setCounts({produtos:results[0],categorias:results[1],pedidos:results[2],agendamentos:results[3],leads:results[4]});setLoading(false);}})();return()=>{alive=false}},[]);
 const cards=useMemo(()=>[
  {label:"Produtos",value:counts.produtos,href:"/admin/produtos",icon:"🛍️"},
  {label:"Categorias",value:counts.categorias,href:"/admin/produtos",icon:"🗂️"},
  {label:"Pedidos",value:counts.pedidos,href:"/admin/pedidos",icon:"🧾"},
  {label:"Agendamentos",value:counts.agendamentos,href:"/admin/agendamentos",icon:"📅"},
  {label:"Leads",value:counts.leads,href:"/admin/leads",icon:"👥"}
 ],[counts]);
 return <main className="min-h-screen bg-background px-4 pb-16 pt-24 sm:px-8"><div className="mx-auto max-w-7xl">
  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Fire Peacock</p><h1 className="mt-2 font-display text-5xl tracking-tight sm:text-6xl">Painel ADM</h1><p className="mt-3 max-w-2xl text-muted-foreground">Controle produtos, pedidos, agenda e contatos em um só lugar.</p></div><Link to="/" className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">Ver site</Link></div>
  <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(card=><Link key={card.label} to={card.href as any} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between"><span className="text-2xl">{card.icon}</span><span className="text-xs text-muted-foreground">Abrir →</span></div><p className="mt-7 text-sm text-muted-foreground">{card.label}</p><p className="mt-1 text-3xl font-bold">{loading?"...":card.value}</p></Link>)}</section>
  <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]"><div className="rounded-2xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Ações rápidas</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">
   <Link to="/admin/produtos" className="rounded-xl border border-border p-4 hover:bg-muted"><b>+ Adicionar produto</b><span className="mt-1 block text-sm text-muted-foreground">Foto, preço, promoção e categoria.</span></Link>
   <Link to="/admin/produtos" className="rounded-xl border border-border p-4 hover:bg-muted"><b>🗂️ Organizar catálogo</b><span className="mt-1 block text-sm text-muted-foreground">Ative, desative e reordene produtos.</span></Link>
   <Link to="/admin/pedidos" className="rounded-xl border border-border p-4 hover:bg-muted"><b>🧾 Ver pedidos</b><span className="mt-1 block text-sm text-muted-foreground">Acompanhe os pedidos recebidos.</span></Link>
   <Link to="/admin/agendamentos" className="rounded-xl border border-border p-4 hover:bg-muted"><b>📅 Agenda</b><span className="mt-1 block text-sm text-muted-foreground">Consulte os próximos agendamentos.</span></Link>
  </div></div><div className="rounded-2xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Status</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between rounded-lg bg-muted/40 p-3"><span>Autenticação</span><span className="text-emerald-500">● Ativa</span></div><div className="flex justify-between rounded-lg bg-muted/40 p-3"><span>Proteção ADM</span><span className="text-emerald-500">● Ativa</span></div><div className="flex justify-between rounded-lg bg-muted/40 p-3"><span>Catálogo</span><span className="text-emerald-500">● Conectado</span></div></div></div></section>
 </div></main>;
}