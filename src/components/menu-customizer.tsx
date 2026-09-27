import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type MenuCustomization = {
  quantity: number;
  additions: string[];
  removals: string;
  notes: string;
  total: number;
};

type Addition = { name: string; price: number };

const additionsByCategory: Record<string, Addition[]> = {
  "Entradas": [
    { name: "Molho da casa", price: 3 },
    { name: "Queijo extra", price: 4 },
    { name: "Bacon crocante", price: 6 },
    { name: "Ervas frescas", price: 2 },
  ],
  "Pratos principais": [
    { name: "Batatas rústicas extra", price: 7 },
    { name: "Legumes extra", price: 6 },
    { name: "Molho da casa", price: 3 },
    { name: "Queijo extra", price: 4 },
  ],
  "Massas": [
    { name: "Parmesão extra", price: 4 },
    { name: "Cogumelos extra", price: 6 },
    { name: "Molho extra", price: 3 },
    { name: "Bacon crocante", price: 6 },
  ],
  "Hambúrgueres": [
    { name: "Queijo extra", price: 4 },
    { name: "Bacon crocante", price: 6 },
    { name: "Cebola caramelizada", price: 4 },
    { name: "Molho extra", price: 3 },
    { name: "Pimenta defumada", price: 2 },
  ],
  "Sobremesas": [
    { name: "Sorvete de creme", price: 6 },
    { name: "Calda de chocolate", price: 4 },
    { name: "Morangos frescos", price: 5 },
    { name: "Chantilly", price: 3 },
  ],
  "Bebidas": [
    { name: "Gelo extra", price: 0 },
    { name: "Limão fresco", price: 2 },
    { name: "Frutas extras", price: 4 },
    { name: "Xarope de frutas", price: 3 },
  ],
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function MenuCustomizer({
  open,
  onOpenChange,
  dish,
  category,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dish: { name: string; description: string; price: string; image: string } | null;
  category: string;
  onConfirm: (customization: MenuCustomization) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [additions, setAdditions] = useState<string[]>([]);
  const [removals, setRemovals] = useState("");
  const [notes, setNotes] = useState("");

  const options = additionsByCategory[category] ?? [];
  const basePrice = useMemo(() => Number(dish?.price.replace(/[^d,]/g, "").replace(",", ".") || 0), [dish]);
  const additionsTotal = options
    .filter((option) => additions.includes(option.name))
    .reduce((sum, option) => sum + option.price, 0);
  const unitTotal = basePrice + additionsTotal;
  const total = unitTotal * quantity;

  const reset = () => {
    setQuantity(1);
    setAdditions([]);
    setRemovals("");
    setNotes("");
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const confirm = () => {
    onConfirm({ quantity, additions, removals, notes, total });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-orange-400/20 bg-zinc-950 text-white sm:max-w-xl">
        {dish && (
          <>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img src={dish.image} alt={dish.name} className="aspect-[16/8] w-full object-cover" />
            </div>

            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-3xl">{dish.name}</DialogTitle>
              <DialogDescription className="text-zinc-400">{dish.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quantidade</p>
                    <p className="text-xs text-zinc-500">Preço unitário: {money(unitTotal)}</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 p-1">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10" aria-label="Diminuir quantidade">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-semibold">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((q) => q + 1)} className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500/20 hover:bg-orange-500/30" aria-label="Aumentar quantidade">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Adicionais</p>
                    <p className="text-xs text-zinc-500">Toque para adicionar ou retirar.</p>
                  </div>
                  <span className="text-xs text-orange-300">{money(additionsTotal)}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {options.map((option) => {
                    const selected = additions.includes(option.name);
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setAdditions((current) => selected ? current.filter((item) => item !== option.name) : [...current, option.name])}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 ${selected ? "border-orange-400/60 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.12)]" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                      >
                        <span className="text-sm">{option.name}</span>
                        <span className="text-xs text-zinc-400">{option.price ? `+${money(option.price)}` : "grátis"}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Retirar ingredientes</span>
                  <input value={removals} onChange={(e) => setRemovals(e.target.value)} placeholder="Ex.: sem cebola, sem tomate" className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm outline-none transition focus:border-orange-400/50" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Observações</span>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Algum pedido especial?" className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm outline-none transition focus:border-orange-400/50" />
                </label>
              </section>

              <div className="flex items-center justify-between rounded-2xl border border-orange-400/20 bg-gradient-to-r from-orange-500/10 to-transparent p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Total</p>
                  <p className="text-2xl font-semibold text-orange-300">{money(total)}</p>
                </div>
                <Button type="button" onClick={confirm} className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white hover:opacity-90">
                  <ShoppingBag className="mr-2 h-4 w-4" /> Adicionar ao pedido
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
