export const ORDER_STATUSES = [
  "recebido",
  "confirmado",
  "em_preparo",
  "pronto",
  "saiu_para_entrega",
  "concluido",
  "cancelado",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  recebido: "Recebido",
  confirmado: "Confirmado",
  em_preparo: "Em preparo",
  pronto: "Pronto",
  saiu_para_entrega: "Saiu para entrega",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  recebido: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  confirmado: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  em_preparo: "border-orange-400/40 bg-orange-400/10 text-orange-200",
  pronto: "border-lime-400/40 bg-lime-400/10 text-lime-200",
  saiu_para_entrega: "border-violet-400/40 bg-violet-400/10 text-violet-200",
  concluido: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  cancelado: "border-red-400/40 bg-red-400/10 text-red-200",
};

/** Etapas mostradas ao cliente, conforme o tipo de atendimento. */
export const flowFor = (tipo: string): OrderStatus[] =>
  tipo === "entrega"
    ? ["recebido", "confirmado", "em_preparo", "saiu_para_entrega", "concluido"]
    : ["recebido", "confirmado", "em_preparo", "pronto", "concluido"];

export const money = (value: number) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const KEY = "pf-meus-pedidos";
export type SavedOrder = { codigo: string; token: string; at: string };
export function saveOrder(o: SavedOrder) {
  try {
    const list = loadOrders().filter((x) => x.codigo !== o.codigo);
    localStorage.setItem(KEY, JSON.stringify([o, ...list].slice(0, 10)));
  } catch {}
}
export function loadOrders(): SavedOrder[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
