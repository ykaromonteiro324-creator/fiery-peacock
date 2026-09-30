import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bike, Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MenuCustomization } from "@/components/menu-customizer";
import { supabase } from "@/lib/supabase";
import { money, saveOrder } from "@/lib/order-status";

export type CartLine = { name: string; category: string; customization: MenuCustomization };

const field = "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm outline-none transition focus:border-orange-400/50";

export function CheckoutDialog({ open, onOpenChange, lines, onDone }: {
  open: boolean; onOpenChange: (o: boolean) => void; lines: CartLine[]; onDone: () => void;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"dados" | "resumo">("dados");
  const [tipo, setTipo] = useState<"entrega" | "retirada">("entrega");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [obs, setObs] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const subtotal = lines.reduce((s, l) => s + l.customization.total, 0);
  const digits = telefone.replace(/\D/g, "");

  const validate = () => {
    if (nome.trim().length < 2) return "Informe seu nome.";
    if (digits.length < 10 || digits.length > 13) return "Informe um telefone com DDD.";
    if (tipo === "entrega" && endereco.trim().length < 5) return "Informe o endereço completo para entrega.";
    return "";
  };

  const next = () => { const e = validate(); setError(e); if (!e) setStep("resumo"); };

  const confirm = async () => {
    if (!supabase) { setError("Pedidos indisponíveis no momento."); return; }
    setSending(true); setError("");
    const { data, error: err } = await supabase.rpc("criar_pedido", {
      p: {
        nome: nome.trim(), telefone: digits, tipo, endereco: tipo === "entrega" ? endereco.trim() : null, observacoes: obs.trim(),
        itens: lines.map((l) => ({
          nome: l.name, categoria: l.category, quantidade: l.customization.quantity,
          preco_unitario: l.customization.unitPrice,
          adicionais: l.customization.additionDetails.map((a) => ({ nome: a.name, preco: a.price })),
          retirar: l.customization.removals, observacoes: l.customization.notes,
        })),
      },
    });
    setSending(false);
    if (err || !data) { setError("Não foi possível enviar o pedido. Tente novamente."); return; }
    const { codigo, token } = data as { codigo: string; token: string };
    saveOrder({ codigo, token, at: new Date().toISOString() });
    onDone();
    onOpenChange(false);
    setStep("dados");
    navigate({ to: "/pedido/$codigo", params: { codigo }, search: { t: token } });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setStep("dados"); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-orange-400/20 bg-zinc-950 text-white sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-3xl">{step === "dados" ? "Finalizar pedido" : "Confira seu pedido"}</DialogTitle>
          <DialogDescription className="text-zinc-400">{step === "dados" ? "Sem cadastro. Só o necessário para preparar e entregar." : "Revise tudo antes de confirmar."}</DialogDescription>
        </DialogHeader>

        {step === "dados" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de atendimento">
              {([["entrega", "Entrega", Bike], ["retirada", "Retirada", Store]] as const).map(([v, label, Icon]) => (
                <button key={v} type="button" role="radio" aria-checked={tipo === v} onClick={() => setTipo(v)}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm transition ${tipo === v ? "border-orange-400/60 bg-orange-500/10" : "border-white/10 hover:border-white/20"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            <label className="block space-y-1.5"><span className="text-sm">Nome</span><input className={field} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} autoComplete="name" /></label>
            <label className="block space-y-1.5"><span className="text-sm">Telefone / WhatsApp</span><input className={field} value={telefone} onChange={(e) => setTelefone(e.target.value)} inputMode="tel" placeholder="(11) 91234-5678" autoComplete="tel" /></label>
            {tipo === "entrega" && (
              <label className="block space-y-1.5"><span className="text-sm">Endereço de entrega</span><textarea className={`${field} h-20 py-2`} value={endereco} onChange={(e) => setEndereco(e.target.value)} maxLength={300} placeholder="Rua, número, complemento, bairro" /></label>
            )}
            <label className="block space-y-1.5"><span className="text-sm">Observações do pedido (opcional)</span><input className={field} value={obs} onChange={(e) => setObs(e.target.value)} maxLength={500} /></label>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <Button type="button" onClick={next} className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white">Revisar pedido</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
              {lines.map((l, i) => (
                <div key={i} className="flex justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{l.customization.quantity}x {l.name}</p>
                    {l.customization.additionDetails.length > 0 && <p className="text-xs text-orange-200/80">+ {l.customization.additionDetails.map((a) => a.name).join(", ")}</p>}
                    {l.customization.removals && <p className="text-xs text-zinc-500">Sem: {l.customization.removals}</p>}
                    {l.customization.notes && <p className="text-xs text-zinc-500">Obs.: {l.customization.notes}</p>}
                  </div>
                  <span className="shrink-0">{money(l.customization.total)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 rounded-2xl border border-white/10 p-3 text-sm">
              <p><span className="text-zinc-500">Cliente:</span> {nome} · {telefone}</p>
              <p><span className="text-zinc-500">Atendimento:</span> {tipo === "entrega" ? `Entrega — ${endereco}` : "Retirada no restaurante"}</p>
              {obs && <p><span className="text-zinc-500">Obs.:</span> {obs}</p>}
            </div>
            <div className="rounded-2xl border border-orange-400/20 bg-orange-500/5 p-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              {tipo === "entrega" && <p className="mt-1 text-xs text-zinc-500">Taxa de entrega, se houver, será confirmada pelo restaurante.</p>}
              <div className="mt-2 flex justify-between text-lg font-semibold text-orange-300"><span>Total</span><span>{money(subtotal)}</span></div>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("dados")} className="rounded-xl border-white/15 bg-transparent">Voltar</Button>
              <Button type="button" onClick={confirm} disabled={sending} className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar pedido"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
