// Fonte única de dados do cardápio do Pavão Flamejante.
// Usada pela seção de cardápio (src/components/menu-section.tsx) e pelo
// assistente de IA (src/routes/api/chat.ts). Altere os itens aqui e ambos
// ficam sincronizados automaticamente.

export type MenuDish = { name: string; description: string; price: string };
export type MenuCategory = { title: string; subtitle: string; dishes: MenuDish[] };

export const menuCategories: MenuCategory[] = [
  {
    title: "Entradas",
    subtitle: "Para começar à mesa",
    dishes: [
      { name: "Bruschetta da casa", description: "Pão tostado, tomate temperado, manjericão e azeite.", price: "R$ 32" },
      { name: "Bolinho de costela", description: "Porção de bolinhos crocantes com maionese de alho.", price: "R$ 38" },
      { name: "Tartare de filé", description: "Filé picado na faca, mostarda, alcaparras e torradas.", price: "R$ 48" },
      { name: "Salada da horta", description: "Folhas da estação, tomate, cenoura e vinagrete de limão.", price: "R$ 34" },
      { name: "Rolinhos de legumes", description: "Legumes frescos em papel de arroz, molho de amendoim.", price: "R$ 36" },
      { name: "Legumes assados", description: "Legumes da estação, ervas frescas e azeite da casa.", price: "R$ 35" },
    ],
  },
  {
    title: "Pratos principais",
    subtitle: "Da brasa para a mesa",
    dishes: [
      { name: "Bife ancho na brasa", description: "Corte de 300 g, batatas rústicas e manteiga de ervas.", price: "R$ 98" },
      { name: "Peixe do dia", description: "Filé grelhado com legumes salteados e limão.", price: "R$ 84" },
      { name: "Frango grelhado", description: "Peito grelhado com batatas douradas e legumes verdes.", price: "R$ 68" },
      { name: "Costela barbecue", description: "Costela suína assada lentamente, fritas e molho da casa.", price: "R$ 92" },
      { name: "Filé com fritas", description: "Filé grelhado ao ponto, batatas fritas e salada fresca.", price: "R$ 89" },
      { name: "Curry de legumes", description: "Legumes ao molho levemente picante, servidos com arroz.", price: "R$ 64" },
    ],
  },
  {
    title: "Massas",
    subtitle: "Conforto em cada garfada",
    dishes: [
      { name: "Penne ao sugo", description: "Molho de tomate da casa, parmesão e manjericão.", price: "R$ 54" },
      { name: "Fettuccine com cogumelos", description: "Cogumelos salteados, manteiga e salsinha.", price: "R$ 66" },
      { name: "Pappardelle ao ragu", description: "Ragu de carne cozido lentamente, finalizado com parmesão.", price: "R$ 72" },
      { name: "Farfalle ao pesto", description: "Pesto de manjericão, tomate fresco e folhas verdes.", price: "R$ 58" },
      { name: "Fusilli à bolonhesa", description: "Molho de carne e tomate, com queijo ralado na hora.", price: "R$ 62" },
      { name: "Espaguete ao pomodoro", description: "Tomate, alho, azeite e folhas de manjericão.", price: "R$ 56" },
    ],
  },
  {
    title: "Hambúrgueres",
    subtitle: "Pão macio, brasa quente",
    dishes: [
      { name: "Clássico da casa", description: "Blend 180 g, queijo, alface, tomate e picles.", price: "R$ 44" },
      { name: "Flamejante", description: "Blend 180 g, bacon, cheddar e maionese de pimenta defumada.", price: "R$ 52" },
      { name: "Duplo smash", description: "Dois discos de 90 g, queijo prato, cebola e molho da casa.", price: "R$ 48" },
      { name: "Frango crocante", description: "Frango empanado, salada de repolho e maionese temperada.", price: "R$ 46" },
      { name: "Salada burger", description: "Blend 180 g, queijo, alface, tomate e cebola roxa.", price: "R$ 45" },
      { name: "Bacon & queijo", description: "Blend 180 g, bacon crocante, queijo derretido e molho da casa.", price: "R$ 50" },
    ],
  },
  {
    title: "Sobremesas",
    subtitle: "Um pouco mais de tempo",
    dishes: [
      { name: "Petit gâteau", description: "Bolinho de chocolate quente, calda e sorvete de creme.", price: "R$ 34" },
      { name: "Panna cotta", description: "Creme de baunilha com calda de morangos frescos.", price: "R$ 29" },
      { name: "Bolo de frutas vermelhas", description: "Fatia de bolo macio, creme e frutas frescas.", price: "R$ 32" },
      { name: "Cookie de chocolate", description: "Cookie grande com gotas de chocolate, servido morno.", price: "R$ 22" },
      { name: "Crepe com morangos", description: "Crepe delicado com creme, morangos e chantilly.", price: "R$ 31" },
      { name: "Donut de chocolate", description: "Massa fofinha coberta com chocolate e confeitos.", price: "R$ 19" },
    ],
  },
  {
    title: "Bebidas",
    subtitle: "Para brindar ou refrescar",
    dishes: [
      { name: "Caipirinha de limão", description: "Cachaça, limão fresco, açúcar e bastante gelo.", price: "R$ 28" },
      { name: "Coquetel da casa", description: "Drink cítrico com destilado, frutas e gelo.", price: "R$ 34" },
      { name: "Suco de laranja", description: "Laranja espremida na hora, sem adição de açúcar.", price: "R$ 16" },
      { name: "Whisky com gelo", description: "Dose de whisky servida com gelo e casca de laranja.", price: "R$ 36" },
      { name: "Coquetel cítrico", description: "Destilado, toque de laranja e bitter.", price: "R$ 32" },
      { name: "Soda de frutas", description: "Frutas da estação, água com gás e gelo.", price: "R$ 18" },
    ],
  },
];

// Cardápio formatado em texto, pronto para injetar no contexto da IA.
export function menuAsText(): string {
  return menuCategories
    .map(
      (category) =>
        `### ${category.title} (${category.subtitle})\n` +
        category.dishes.map((dish) => `- ${dish.name} — ${dish.price}. ${dish.description}`).join("\n"),
    )
    .join("\n\n");
}
