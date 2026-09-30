import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type SyntheticEvent } from "react";
import { ImageAccordion } from "@/components/ui/image-accordion";
import { Button } from "@/components/ui/button";
import { MenuCustomizer, type MenuCustomization } from "@/components/menu-customizer";
import { menuCategories } from "@/lib/menu-data";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Trash2 } from "lucide-react";
import bruschetta from "@/assets/menu/bruschetta.jpg.asset.json";
import bolinhoCostela from "@/assets/menu/bolinho-costela.jpg.asset.json";
import tartare from "@/assets/menu/tartare.jpg.asset.json";
import saladaHorta from "@/assets/menu/salada-horta.jpg.asset.json";
import rolinhos from "@/assets/menu/rolinhos.jpg.asset.json";
import legumesAssados from "@/assets/menu/legumes-assados.jpg.asset.json";
import ancho from "@/assets/menu/ancho.jpg.asset.json";
import peixe from "@/assets/menu/peixe.jpg.asset.json";
import frango from "@/assets/menu/frango.jpg.asset.json";
import costela from "@/assets/menu/costela.jpg.asset.json";
import file from "@/assets/menu/file.jpg.asset.json";
import curry from "@/assets/menu/curry.jpg.asset.json";
import penne from "@/assets/menu/penne.jpg.asset.json";
import fettuccine from "@/assets/menu/fettuccine.jpg.asset.json";
import pappardelle from "@/assets/menu/pappardelle.jpg.asset.json";
import farfalle from "@/assets/menu/farfalle.jpg.asset.json";
import fusilli from "@/assets/menu/fusilli.jpg.asset.json";
import espaguete from "@/assets/menu/espaguete.jpg.asset.json";
import burgerClassico from "@/assets/menu/burger-classico.jpg.asset.json";
import burgerFlamejante from "@/assets/menu/burger-flamejante.jpg.asset.json";
import burgerSmash from "@/assets/menu/burger-smash.jpg.asset.json";
import burgerFrango from "@/assets/menu/burger-frango.jpg.asset.json";
import burgerSalada from "@/assets/menu/burger-salada.jpg.asset.json";
import burgerBacon from "@/assets/menu/burger-bacon.jpg.asset.json";
import petitGateau from "@/assets/menu/petit-gateau.jpg.asset.json";
import pannaCotta from "@/assets/menu/panna-cotta.jpg.asset.json";
import boloFrutas from "@/assets/menu/bolo-frutas.jpg.asset.json";
import cookie from "@/assets/menu/cookie.jpg.asset.json";
import crepe from "@/assets/menu/crepe.jpg.asset.json";
import donut from "@/assets/menu/donut.jpg.asset.json";
import caipirinha from "@/assets/menu/caipirinha.jpg.asset.json";
import drinkCasa from "@/assets/menu/drink-casa.jpg.asset.json";
import sucoLaranja from "@/assets/menu/suco-laranja.jpg.asset.json";
import whisky from "@/assets/menu/whisky.jpg.asset.json";
import coquetel from "@/assets/menu/coquetel.jpg.asset.json";
import semAlcool from "@/assets/menu/sem-alcool.jpg.asset.json";

type Dish = { name: string; description: string; price: string; originalPrice?: string; image: string };
type Category = { title: string; subtitle: string; image: string; dishes: Dish[] };
type OrderLine = Dish & { category: string; customization: MenuCustomization };

const categoryImages = [bruschetta.url, ancho.url, penne.url, burgerClassico.url, boloFrutas.url, semAlcool.url];
const dishImages: string[][] = [
  [bruschetta.url, bolinhoCostela.url, tartare.url, saladaHorta.url, rolinhos.url, legumesAssados.url],
  [ancho.url, peixe.url, frango.url, costela.url, file.url, curry.url],
  [penne.url, fettuccine.url, pappardelle.url, farfalle.url, fusilli.url, espaguete.url],
  [burgerClassico.url, burgerFlamejante.url, burgerSmash.url, burgerFrango.url, burgerSalada.url, burgerBacon.url],
  [petitGateau.url, pannaCotta.url, boloFrutas.url, cookie.url, crepe.url, donut.url],
  [caipirinha.url, drinkCasa.url, sucoLaranja.url, whisky.url, coquetel.url, semAlcool.url],
];

const categories: Category[] = menuCategories.map((category, categoryIndex) => ({
  ...category,
  image: categoryImages[categoryIndex] ?? "",
  dishes: category.dishes.map((dish, dishIndex) => ({
    ...dish,
    image: dishImages[categoryIndex]?.[dishIndex] ?? "",
  })),
}));

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function AnimatedDishImage({ src, alt }: { src: string; alt: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x, y });
  };

  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      className="group relative overflow-hidden bg-zinc-900 [perspective:900px]"
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerDown={(event) => {
        if (event.pointerType === "touch") setTilt({ x: 3, y: -3 });
      }}
      onPointerUp={(event) => {
        if (event.pointerType === "touch") setTilt({ x: 0, y: 0 });
      }}
      style={{ transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`, transition: "transform 380ms cubic-bezier(.2,.8,.2,1)" }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={900}
        height={640}
        className="aspect-[3/2] w-full object-cover transition duration-700 ease-out motion-safe:group-hover:scale-[1.045]"
      />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.25),transparent_28%),linear-gradient(120deg,transparent_35%,rgba(255,180,80,.10),transparent_60%)] opacity-0 transition-opacity duration-500 motion-safe:group-hover:opacity-100" />
      <span className="pointer-events-none absolute -inset-x-1/2 top-0 h-full -rotate-12 translate-x-[-80%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 motion-safe:group-hover:translate-x-[80%]" />
    </div>
  );
}

export function MenuSection() {
  const [remoteCategories, setRemoteCategories] = useState<Category[] | null>(null);
  useEffect(() => { if (!supabase) return; Promise.all([supabase.from("categorias").select("*").eq("ativo", true).order("ordem"), supabase.from("produtos").select("*").eq("ativo", true).order("ordem")]).then(([cr, pr]) => { if (cr.data?.length && pr.data?.length) { const by = new Map<string, Dish[]>(); for (const p of pr.data as any[]) { const arr = by.get(p.categoria_id) ?? []; arr.push({ name:p.nome, description:p.descricao, price: money(p.preco_promocional != null && p.preco_promocional < p.preco ? p.preco_promocional : p.preco), originalPrice: p.preco_promocional != null && p.preco_promocional < p.preco ? money(p.preco) : undefined, image:p.imagens?.[0] ?? "" }); by.set(p.categoria_id, arr); } const cats = (cr.data as any[]).map(c => ({ title:c.nome, subtitle:"", image:by.get(c.id)?.[0]?.image ?? "", dishes:by.get(c.id) ?? [] })).filter(x => x.dishes.length); if (cats.length) setRemoteCategories(cats); } }); }, []);
  const [selected, setSelected] = useState(0);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [order, setOrder] = useState<OrderLine[]>([]);
  const galleryRef = useRef<HTMLDivElement>(null);

  const pick = (event: SyntheticEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button || !galleryRef.current?.contains(button) || !button.parentElement) return;
    const index = Array.from(button.parentElement.children).indexOf(button);
    if (index >= 0) setSelected(index);
  };

  const selectCategory = (index: number) => {
    const buttons = galleryRef.current?.querySelectorAll("button");
    buttons?.[index]?.click();
    setSelected(index);
  };

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const currentTitle = (remoteCategories ?? categories)[selected]?.title ?? "";
  const addToOrder = (customization: MenuCustomization) => {
    if (!selectedDish) return;
    setOrder((current) => [
      ...current,
      { ...selectedDish, category: currentTitle, customization },
    ]);
  };

  const removeOrderLine = (index: number) => setOrder((current) => current.filter((_, i) => i !== index));

  const orderTotal = order.reduce((sum, item) => sum + item.customization.total, 0);

  const sendOrder = () => { if (order.length) setCheckoutOpen(true); };

  const displayedCategories = remoteCategories ?? categories;
  const current = displayedCategories[selected] ?? displayedCategories[0];
  if (!current) return null;

  return (
    <section id="cardapio" className="scroll-mt-20 px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-primary">Cardápio</p>
          <h2 className="mt-4 font-display text-4xl sm:text-6xl">
            Escolha sua <span className="italic text-gradient-ember">chama.</span>
          </h2>
          <p className="mt-4 text-sm font-light text-muted-foreground">Escolha uma categoria e encontre seu prato.</p>
        </div>

        <div ref={galleryRef} className="mt-10" onClick={pick} onFocus={pick}>
          <ImageAccordion
            items={displayedCategories.map(({ image, title, subtitle }) => ({ image, title, subtitle }))}
            className="h-[220px] gap-1 sm:h-[320px] sm:gap-2 lg:h-[420px] lg:gap-3"
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categorias do cardápio">
          {displayedCategories.map((category, index) => (
            <Button key={category.title} type="button" role="tab" aria-selected={selected === index} aria-controls="menu-pratos" variant={selected === index ? "secondary" : "ghost"} size="sm" onClick={() => selectCategory(index)} className={`shrink-0 rounded-sm border px-3.5 text-xs sm:text-sm ${selected === index ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}>
              {category.title}
            </Button>
          ))}
        </div>

        <div className="mt-8 flex items-baseline justify-between gap-4 border-b border-border pb-4">
          <h3 className="font-display text-3xl sm:text-4xl">{current.title}</h3>
          <span className="shrink-0 text-xs uppercase tracking-[0.15em] text-muted-foreground">{current.dishes.length} itens</span>
        </div>

        {order.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-orange-400/20 bg-zinc-950/90 shadow-[0_15px_50px_rgba(0,0,0,.2)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div>
                <p className="flex items-center gap-2 font-medium"><ShoppingBag className="h-4 w-4 text-orange-300" /> Seu pedido</p>
                <p className="text-xs text-zinc-500">{order.length} personalização(ões)</p>
              </div>
              <span className="text-lg font-semibold text-orange-300">{money(orderTotal)}</span>
            </div>
            <div className="divide-y divide-white/10">
              {order.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{item.customization.quantity}x {item.name}</p>
                    {item.customization.additions.length > 0 && <p className="text-xs text-orange-200/80">+ {item.customization.additions.join(", ")}</p>}
                    {item.customization.removals && <p className="text-xs text-zinc-500">Sem: {item.customization.removals}</p>}
                    {item.customization.notes && <p className="text-xs text-zinc-500">Obs.: {item.customization.notes}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm">{money(item.customization.total)}</span>
                    <button type="button" onClick={() => removeOrderLine(index)} className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300" aria-label={`Remover ${item.name} do pedido`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-500">Escolha entrega ou retirada ao finalizar. Sem cadastro.</p>
              <Button type="button" onClick={sendOrder} className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white">Finalizar pedido <span className="ml-2">→</span></Button>
            </div>
          </div>
        )}

        <div id="menu-pratos" role="tabpanel" key={current.title} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {current.dishes.map((dish) => (
            <article key={dish.name} className="animate-in fade-in slide-in-from-bottom-2 flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground duration-500 transition-all hover:-translate-y-1 hover:border-orange-400/30 hover:shadow-[0_18px_45px_rgba(0,0,0,.18)]" onClick={() => setSelectedDish(dish)}>
              <AnimatedDishImage src={dish.image} alt={dish.name} />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h4 className="font-display text-2xl leading-tight">{dish.name}</h4>
                <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-muted-foreground">{dish.description}</p>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="whitespace-nowrap font-medium text-primary">{dish.originalPrice && <span className="mr-2 text-muted-foreground line-through">{dish.originalPrice}</span>}{dish.price}</span>
                  <Button type="button" variant="outline" size="sm" className="rounded-sm border-border bg-transparent text-xs font-medium uppercase tracking-widest" onClick={(event) => { event.stopPropagation(); setSelectedDish(dish); }}>
                    Personalizar <span aria-hidden="true">+</span>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <MenuCustomizer
        open={!!selectedDish}
        onOpenChange={(open) => { if (!open) setSelectedDish(null); }}
        dish={selectedDish}
        category={current.title}
        onConfirm={addToOrder}
      />
      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} lines={order} onDone={() => setOrder([])} />
    </section>
  );
}
