import { useRef, useState, type SyntheticEvent } from "react";
import { ImageAccordion } from "@/components/ui/image-accordion";
import { Button } from "@/components/ui/button";
import { menuCategories } from "@/lib/menu-data";
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

type Dish = { name: string; description: string; price: string; image: string };
type Category = { title: string; subtitle: string; image: string; dishes: Dish[] };

// Fotos de cada prato, na mesma ordem de src/lib/menu-data.ts (fonte única dos dados).
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

export function MenuSection() {
  const [selected, setSelected] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Keep category selection in sync without changing the gallery component.
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

  const current = categories[selected] ?? categories[0];
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
            items={categories.map(({ image, title, subtitle }) => ({ image, title, subtitle }))}
            className="h-[220px] gap-1 sm:h-[320px] sm:gap-2 lg:h-[420px] lg:gap-3"
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categorias do cardápio">
          {categories.map((category, index) => (
            <Button
              key={category.title}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-controls="menu-pratos"
              variant={selected === index ? "secondary" : "ghost"}
              size="sm"
              onClick={() => selectCategory(index)}
              className={`shrink-0 rounded-sm border px-3.5 text-xs sm:text-sm ${selected === index ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}
            >
              {category.title}
            </Button>
          ))}
        </div>

        <div className="mt-8 flex items-baseline justify-between gap-4 border-b border-border pb-4">
          <h3 className="font-display text-3xl sm:text-4xl">{current.title}</h3>
          <span className="shrink-0 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {current.dishes.length} itens
          </span>
        </div>

        <div id="menu-pratos" role="tabpanel" key={current.title} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {current.dishes.map((dish) => (
            <article key={dish.name} className="animate-in fade-in slide-in-from-bottom-2 flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground duration-500">
              <img src={dish.image} alt={dish.name} loading="lazy" width={900} height={640} className="aspect-[3/2] w-full object-cover" />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h4 className="font-display text-2xl leading-tight">{dish.name}</h4>
                <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-muted-foreground">{dish.description}</p>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="whitespace-nowrap font-medium text-primary">{dish.price}</span>
                  <Button asChild variant="outline" size="sm" className="rounded-sm border-border bg-transparent text-xs font-medium uppercase tracking-widest">
                    <a href={`mailto:ola@pavaoflamejante.com.br?subject=${encodeURIComponent(`Pedido: ${dish.name}`)}&body=${encodeURIComponent(`Olá! Gostaria de pedir ${dish.name} (${dish.price}).`)}`} aria-label={`Pedir ${dish.name}`}>
                      Pedir <span aria-hidden="true">↗</span>
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
