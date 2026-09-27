// Fatos reais do site Pavão Flamejante, usados pelo assistente de IA.
// IMPORTANTE: só inclua aqui informações que realmente constam no site.
// O que não estiver listado é tratado pela IA como "não informado".

export const siteFacts = {
  nome: "Pavão Flamejante",
  conceito:
    "Restaurante de brasa com estética editorial. Manifesto do site: 'Beleza que arde.' — comida de fogo, apresentação de cartaz.",
  contato: {
    email: "ola@pavaoflamejante.com.br",
    comoPedir:
      "Os pedidos são feitos por e-mail: cada prato do cardápio tem um botão 'Pedir' que abre uma mensagem pronta para o restaurante.",
  },
  secoes: [
    "Início (hero)",
    "Cardápio com 6 categorias (Entradas, Pratos principais, Massas, Hambúrgueres, Sobremesas, Bebidas)",
    "Manifesto",
    "Contato final (CTA 'Acenda a cauda.')",
  ],
  // Informações que o site NÃO informa — a IA deve dizer que não encontrou
  // e indicar o e-mail de contato para confirmar:
  naoInformado: [
    "endereço e localização física",
    "horários de funcionamento",
    "entrega, áreas atendidas, taxa e prazo de entrega",
    "formas de pagamento",
    "telefone e redes sociais",
  ],
} as const;

export function siteFactsAsText(): string {
  return [
    `Restaurante: ${siteFacts.nome}`,
    `Conceito: ${siteFacts.conceito}`,
    `Contato: ${siteFacts.contato.email}`,
    `Como pedir: ${siteFacts.contato.comoPedir}`,
    `Seções do site: ${siteFacts.secoes.join("; ")}.`,
    `Informações NÃO disponíveis no site (nunca invente; diga que não encontrou e indique o e-mail de contato): ${siteFacts.naoInformado.join("; ")}.`,
  ].join("\n");
}
