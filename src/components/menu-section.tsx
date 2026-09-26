import { useState, type SyntheticEvent } from "react";
import { ImageAccordion } from "@/components/ui/image-accordion";

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

type Dish = { name: string; description: string; price: string };
type Category = { title: string; subtitle: string; image: string; dishes: Dish[] };

const categories: Category[] = [
  {
    title: "Entradas",
    subtitle: "Para abrir o apetite",
    image: img("1572695157366-5e585ab2b69f"),
    dishes: [
      { name: "Bruschetta de tomate", description: "Pão de fermentação natural, tomate confitado e manjericão.", price: "R$ 32" },
      { name: "Bolinho de costela", description: "Costela desfiada, crosta crocante e maionese de alho.", price: "R$ 38" },
      { name: "Carpaccio", description: "Lâminas de filé, alcaparras, parmesão e rúcula.", price: "R$ 46" },
    ],
  },
  {
    title: "Pratos principais",
    subtitle: "Brasa e tempo",
    image: img("1546833999-b9f581a1996d"),
    dishes: [
      { name: "Bife ancho na brasa", description: "300 g, manteiga de ervas e batatas rústicas.", price: "R$ 98" },
      { name: "Peixe do dia", description: "Grelhado, purê de mandioquinha e legumes tostados.", price: "R$ 84" },
      { name: "Frango caipira assado", description: "Coxa e sobrecoxa, farofa de cebola e couve.", price: "R$ 66" },
    ],
  },
  {
    title: "Massas",
    subtitle: "Feitas na casa",
    image: img("1621996346565-e3dbc646d9a9"),
    dishes: [
      { name: "Espaguete ao pomodoro", description: "Molho de tomate lento, manjericão e parmesão.", price: "R$ 54" },
      { name: "Fettuccine na manteiga", description: "Manteiga tostada, sálvia e pimenta-do-reino.", price: "R$ 58" },
      { name: "Lasanha de ragu", description: "Ragu de carne cozido por seis horas e bechamel.", price: "R$ 64" },
    ],
  },
  {
    title: "Hambúrgueres",
    subtitle: "Pão brioche, blend próprio",
    image: img("1568901346375-23c9450c58cd"),
    dishes: [
      { name: "Clássico", description: "Blend 180 g, queijo cheddar, alface, tomate e picles.", price: "R$ 44" },
      { name: "Flamejante", description: "Blend 180 g, pimenta defumada, bacon e cebola caramelizada.", price: "R$ 49" },
      { name: "Duplo smash", description: "Dois smash de 90 g, queijo prato e molho da casa.", price: "R$ 46" },
    ],
  },
  {
    title: "Sobremesas",
    subtitle: "O final doce",
    image: img("1551024601-bec78aea704b"),
    dishes: [
      { name: "Petit gâteau", description: "Chocolate meio amargo e sorvete de creme.", price: "R$ 32" },
      { name: "Pudim de leite", description: "Receita da avó, calda de caramelo.", price: "R$ 24" },
      { name: "Cheesecake de goiaba", description: "Base crocante e goiabada cascão.", price: "R$ 28" },
    ],
  },
  {
    title: "Bebidas",
    subtitle: "Coquetéis e sem álcool",
    image: img("1544145945-f90425340c7e"),
    dishes: [
      { name: "Caipirinha de limão", description: "Cachaça artesanal, limão e açúcar.", price: "R$ 28" },
      { name: "Soda de hibisco", description: "Hibisco, gengibre e água com gás.", price: "R$ 16" },
      { name: "Suco natural", description: "Laranja, abacaxi com hortelã ou melancia.", price: "R$ 14" },
    ],
  },
];

export function MenuSection() {
  const [selected, setSelected] = useState(0);

  // Sync the selected category with the strip the user clicks/focuses (component itself is untouched).
  const pick = (e: SyntheticEvent<HTMLDivElement>) => {
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn || !btn.parentElement) return;
    const index = Array.from(btn.parentElement.children).indexOf(btn);
    if (index >= 0) setSelected(index);
  };

  const current = categories[selected] ?? categories[0]!;

  return (
    <section id="cardapio" className="scroll-mt-20 px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-primary">Cardápio</p>
          <h2 className="mt-4 font-display text-4xl sm:text-6xl">
            Escolha sua <span className="italic text-gradient-ember">chama.</span>
          </h2>
          <p className="mt-4 text-sm font-light text-muted-foreground">Toque em uma categoria para ver os pratos.</p>
        </div>

        <div className="mt-10" onClick={pick} onFocus={pick} role="tablist" aria-label="Categorias do cardápio">
          <ImageAccordion
            items={categories.map(({ image, title, subtitle }) => ({ image, title, subtitle }))}
            className="h-[280px] gap-1.5 sm:h-[420px] sm:gap-3"
          />
        </div>

        <div className="mt-10 flex items-baseline justify-between gap-4 border-b border-border pb-4">
          <h3 className="font-display text-3xl sm:text-4xl">{current.title}</h3>
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {current.dishes.length} itens
          </span>
        </div>

        <div key={current.title} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {current.dishes.map((dish, i) => (
            <article
              key={dish.name}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both rounded-2xl border border-border bg-card p-6 text-card-foreground duration-500"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-display text-2xl leading-tight">{dish.name}</h4>
                <span className="shrink-0 font-medium text-primary">{dish.price}</span>
              </div>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">{dish.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
