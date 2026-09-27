import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/cadastro")({ component: Register });

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome"),
  email: z.string().trim().email("Digite um e-mail válido"),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
  confirmacao: z.string(),
}).refine(v => v.senha === v.confirmacao, { path: ["confirmacao"], message: "As senhas não conferem" });

function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmacao: "" });
  const [error, setError] = useState("");
  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Confira os dados informados.");
    if (!supabase) return setError("Não foi possível criar a conta. Tente novamente.");
    setError("");
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { data: { nome: form.nome } },
    });
    if (authError) {
      const msg = authError.message.toLowerCase();
      return setError(msg.includes("already") || msg.includes("registered") ? "Este e-mail já tem conta" : "Não foi possível criar a conta. Tente novamente.");
    }
    nav({ to: "/entrar" });
  };
  return <main className="grid min-h-screen place-items-center px-5"><div className="w-full max-w-md rounded-2xl border bg-card p-7">
    <h1 className="font-display text-4xl">Criar conta</h1>
    <div className="mt-7 space-y-4">
      <input className="h-11 w-full rounded-lg border bg-background px-3" placeholder="Nome" value={form.nome} onChange={e => setForm({...form,nome:e.target.value})}/>
      <input className="h-11 w-full rounded-lg border bg-background px-3" placeholder="E-mail" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})}/>
      <input className="h-11 w-full rounded-lg border bg-background px-3" placeholder="Senha" type="password" value={form.senha} onChange={e => setForm({...form,senha:e.target.value})}/>
      <input className="h-11 w-full rounded-lg border bg-background px-3" placeholder="Confirmar senha" type="password" value={form.confirmacao} onChange={e => setForm({...form,confirmacao:e.target.value})}/>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button onClick={submit} className="h-11 w-full rounded-lg bg-primary text-primary-foreground">Criar conta</button>
      <a href="/entrar" className="block text-center text-sm text-primary">Já tenho conta</a>
    </div>
  </div></main>;
}
