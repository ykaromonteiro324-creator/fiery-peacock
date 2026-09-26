import { createFileRoute } from "@tanstack/react-router";
import heroPeacock from "@/assets/hero-peacock.jpg";
import featherDetail from "@/assets/feather-detail.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pavão Flamejante — Beleza que arde" },
      {
        name: "description",
        content:
          "Uma marca conceitual nascida entre o fogo e a plumagem. Onde a cauda em chamas encontra o verde-petróleo da noite.",
      },
      { property: "og:title", content: "Pavão Flamejante — Beleza que arde" },
      {
        property: "og:description",
        content:
          "Uma marca conceitual nascida entre o fogo e a plumagem. Onde a cauda em chamas encontra o verde-petróleo da noite.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const traits = [
  {
    number: "01",
    title: "Nascido do fogo",
    line: "Cada detalhe carrega brasa: o calor não é enfeite, é origem.",
  },
  {
    number: "02",
    title: "Plumagem de esmeralda",
    line: "O verde-petróleo da noite equilibra o incêndio — beleza com autocontrole.",
  },
  {
    number: "03",
    title: "Impossível ignorar",
    line: "Quando abre a cauda, a sala inteira muda de temperatura.",
  },
];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Barra mínima */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <a
          href="/"
          className="font-display text-lg tracking-wide text-foreground/90 sm:text-xl"
        >
          Pavão <span className="italic text-gradient-ember">Flamejante</span>
        </a>
        <a
          href="#manifesto"
          className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Manifesto
        </a>
      </header>

      {/* Hero — cartaz full-bleed */}
      <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
        <img
          src={heroPeacock}
          alt="Pavão com a cauda aberta em chamas de coral e ouro sobre fundo verde-petróleo"
          width={1536}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-40 sm:px-10 sm:pb-24">
          <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
            Marca conceitual · Est. 2026
          </p>
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-1000 mt-4 font-display text-6xl leading-[0.95] sm:text-8xl lg:text-9xl">
            Beleza
            <br />
            que <span className="italic text-gradient-ember">arde.</span>
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 duration-1000 mt-6 max-w-md text-base font-light leading-relaxed text-foreground/80 sm:text-lg">
            Entre o incêndio e a plumagem existe um instante em que ninguém
            desvia o olhar. É aí que a gente vive.
          </p>
          <div className="mt-10">
            <a
              href="#manifesto"
              className="ember-glow inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-3.5 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Conhecer o manifesto
            </a>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section id="manifesto" className="relative scroll-mt-20 px-6 py-24 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-primary">
            Manifesto
          </p>
          <h2 className="mt-6 font-display text-4xl leading-tight sm:text-6xl">
            O pavão não pede licença <span className="italic text-gradient-ember">para brilhar.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            Nascemos do paradoxo: a ave mais vaidosa da natureza pegando fogo —
            e nem assim perdendo a compostura. Tudo o que assinamos carrega
            essa tensão: calor sem urgência, esplendor sem ruído.
          </p>
        </div>
      </section>

      <div className="hairline-fade mx-auto max-w-5xl" />

      {/* Traços */}
      <section className="px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-3 sm:gap-8">
          {traits.map((trait) => (
            <div key={trait.number} className="border-t border-border pt-6">
              <span className="font-display text-2xl italic text-primary">{trait.number}</span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl">{trait.title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                {trait.line}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Faixa de imagem — detalhe da pena */}
      <section className="relative overflow-hidden">
        <img
          src={featherDetail}
          alt="Detalhe macro de uma pena de pavão com o olho em brasa, cercado por fagulhas"
          loading="lazy"
          width={1200}
          height={800}
          className="h-[60svh] w-full object-cover sm:h-[75svh]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <blockquote className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-6 pb-12 text-center sm:pb-16">
          <p className="font-display text-3xl italic leading-snug text-foreground sm:text-5xl">
            “A chama é o olho da pena.”
          </p>
        </blockquote>
      </section>

      {/* CTA final */}
      <section className="px-6 py-28 text-center sm:py-40">
        <h2 className="mx-auto max-w-2xl font-display text-5xl leading-[1.05] sm:text-7xl">
          Acenda <span className="italic text-gradient-ember">a cauda.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base font-light text-muted-foreground">
          Colaborações, encomendas e convites para queimar bem feito.
        </p>
        <div className="mt-10">
          <a
            href="mailto:ola@pavaoflamejante.com.br"
            className="ember-glow inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-3.5 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Entrar em contato
          </a>
        </div>
      </section>

      {/* Rodapé mínimo */}
      <footer className="border-t border-border px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="font-display text-base text-foreground/80">
            Pavão <span className="italic text-gradient-ember">Flamejante</span>
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            © 2026 · Beleza que arde
          </span>
        </div>
      </footer>
    </main>
  );
}
