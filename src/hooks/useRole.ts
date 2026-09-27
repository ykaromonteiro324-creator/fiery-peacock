import { useEffect,useState } from "react"; import { supabase } from "@/lib/supabase"; import { useAuth } from "@/auth/AuthProvider";
export type AppRole="admin"|"equipe"|"cliente"; const cache=new Map<string,AppRole[]>();
export function useRole(){const {user}=useAuth();const [roles,setRoles]=useState<AppRole[]>(user?cache.get(user.id)??[]:[]);const [loading,setLoading]=useState(!!user&&!cache.has(user.id));
useEffect(()=>{if(!user||!supabase){setRoles([]);setLoading(false);return;}const c=cache.get(user.id);if(c){setRoles(c);setLoading(false);return;}let alive=true;supabase.from("user_roles").select("role").eq("user_id",user.id).then(({data})=>{if(!alive)return;const r=(data??[]).map(x=>x.role as AppRole);cache.set(user.id,r);setRoles(r);setLoading(false)});return()=>{alive=false}},[user]);
return {roles,loading,isAdmin:roles.includes("admin"),isEquipe:roles.includes("equipe"),isCliente:roles.includes("cliente")}}
