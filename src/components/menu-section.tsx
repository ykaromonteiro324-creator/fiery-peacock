import { useRef, useState, type SyntheticEvent } from "react";
import { ImageAccordion } from "@/components/ui/image-accordion";
import { Button } from "@/components/ui/button";
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

const cover = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

type Dish = { name: string; description: string; price: string; image: string };
type Category = { title: string; subtitle: string; image: string; dishes: Dish[] };

const categories: Category[] = [
  {
    title: "Entradas",
    subtitle: "Para começar à mesa",
    image: cover("1572695157366-5e585ab2b69f"),
    dishes: [
      { name: "Bruschetta da casa", description: "Pão tostado, tomate temperado, manjericão e azeite.", price: "R$ 32", image: bruschetta.url },
      { name: "Bolinho de costela", description: "Porção de bolinhos crocantes com maionese de alho.", price: "R$ 38", image: bolinhoCostela.url },
      { name: "Tartare de filé", description: "Filé picado na faca, mostarda, alcaparras e torradas.", price: "R$ 48", image: tartare.url },
      { name: "Salada da horta", description: "Folhas da estação, tomate, cenoura e vinagrete de limão.", price: "R$ 34", image: saladaHorta.url },
      { name: "Rolinhos de legumes", description: "Legumes frescos em papel de arroz, molho de amendoim.", price: "R$ 36", image: rolinhos.url },
      { name: "Legumes assados", description: "Legumes da estação, ervas frescas e azeite da casa.", price: "R$ 35", image: legumesAssados.url },
    ],
  },
  {
    title: "Pratos principais",
    subtitle: "Da brasa para a mesa",
    image: cover("1558030006-450675393462"),
    dishes: [
      { name: "Bife ancho na brasa", description: "Corte de 300 g, batatas rústicas e manteiga de ervas.", price: "R$ 98", image: ancho.url },
      { name: "Peixe do dia", description: "Filé grelhado com legumes salteados e limão.", price: "R$ 84", image: peixe.url },
      { name: "Frango grelhado", description: "Peito grelhado com batatas douradas e legumes verdes.", price: "R$ 68", image: frango.url },
      { name: "Costela barbecue", description: "Costela suína assada lentamente, fritas e molho da casa.", price: "R$ 92", image: costela.url },
      { name: "Filé com fritas", description: "Filé grelhado ao ponto, batatas fritas e salada fresca.", price: "R$ 89", image: file.url },
      { name: "Curry de legumes", description: "Legumes ao molho levemente picante, servidos com arroz.", price: "R$ 64", image: curry.url },
    ],
  },
  {
    title: "Massas",
    subtitle: "Conforto em cada garfada",
    image: cover("1621996346565-e3dbc646d9a9"),
    dishes: [
      { name: "Penne ao sugo", description: "Molho de tomate da casa, parmesão e manjericão.", price: "R$ 54", image: penne.url },
      { name: "Fettuccine com cogumelos", description: "Cogumelos salteados, manteiga e salsinha.", price: "R$ 66", image: fettuccine.url },
      { name: "Pappardelle ao ragu", description: "Ragu de carne cozido lentamente, finalizado com parmesão.", price: "R$ 72", image: pappardelle.url },
      { name: "Farfalle ao pesto", description: "Pesto de manjericão, tomate fresco e folhas verdes.", price: "R$ 58", image: farfalle.url },
      { name: "Fusilli à bolonhesa", description: "Molho de carne e tomate, com queijo ralado na hora.", price: "R$ 62", image: fusilli.url },
      { name: "Espaguete ao pomodoro", description: "Tomate, alho, azeite e folhas de manjericão.", price: "R$ 56", image: espaguete.url },
    ],
  },
  {
    title: "Hambúrgueres",
    subtitle: "Pão macio, brasa quente",
    image: cover("1568901346375-23c9450c58cd"),
    dishes: [
      { name: "Clássico da casa", description: "Blend 180 g, queijo, alface, tomate e picles.", price: "R$ 44", image: burgerClassico.url },
      { name: "Flamejante", description: "Blend 180 g, bacon, cheddar e maionese de pimenta defumada.", price: "R$ 52", image: burgerFlamejante.url },
      { name: "Duplo smash", description: "Dois discos de 90 g, queijo prato, cebola e molho da casa.", price: "R$ 48", image: burgerSmash.url },
      { name: "Frango crocante", description: "Frango empanado, salada de repolho e maionese temperada.", price: "R$ 46", image: burgerFrango.url },
      { name: "Salada burger", description: "Blend 180 g, queijo, alface, tomate e cebola roxa.", price: "R$ 45", image: burgerSalada.url },
      { name: "Bacon & queijo", description: "Blend 180 g, bacon crocante, queijo derretido e molho da casa.", price: "R$ 50", image: burgerBacon.url },
    ],
  },
  {
    title: "Sobremesas",
    subtitle: "Um pouco mais de tempo",
    image: cover("1565958011703-44f9829ba187"),
    dishes: [
      { name: "Petit gâteau", description: "Bolinho de chocolate quente, calda e sorvete de creme.", price: "R$ 34", image: petitGateau.url },
      { name: "Panna cotta", description: "Creme de baunilha com calda de morangos frescos.", price: "R$ 29", image: pannaCotta.url },
      { name: "Bolo de frutas vermelhas", description: "Fatia de bolo macio, creme e frutas frescas.", price: "R$ 32", image: boloFrutas.url },
      { name: "Cookie de chocolate", description: "Cookie grande com gotas de chocolate, servido morno.", price: "R$ 22", image: cookie.url },
      { name: "Crepe com morangos", description: "Crepe delicado com creme, morangos e chantilly.", price: "R$ 31", image: crepe.url },
      { name: "Donut de chocolate", description: "Massa fofinha coberta com chocolate e confeitos.", price: "R$ 19", image: donut.url },
    ],
  },
  {
    title: "Bebidas",
    subtitle: "Para brindar ou refrescar",
    image: cover("1551024709-8f23befc6f87"),
    dishes: [
      { name: "Caipirinha de limão", description: "Cachaça, limão fresco, açúcar e bastante gelo.", price: "R$ 28", image: caipirinha.url },
      { name: "Coquetel da casa", description: "Drink cítrico com destilado, frutas e gelo.", price: "R$ 34", image: drinkCasa.url },
      { name: "Suco de laranja", description: "Laranja espremida na hora, sem adição de açúcar.", price: "R$ 16", image: sucoLaranja.url },
      { name: "Whisky com gelo", description: "Dose de whisky servida com gelo e casca de laranja.", price: "R$ 36", image: whisky.url },
      { name: "Coquetel cítrico", description: "Destilado, toque de laranja e bitter.", price: "R$ 32", image: coquetel.url },
      { name: "Soda de frutas", description: "Frutas da estação, água com gás e gelo.", price: "R$ 18", image: semAlcool.url },
    ],
  },
];

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
