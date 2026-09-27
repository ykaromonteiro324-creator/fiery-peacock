import { createContext,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import type { Session,User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
type Ctx={user:User|null;session:Session|null;loading:boolean};
const AuthContext=createContext<Ctx>({user:null,session:null,loading:true});
export function AuthProvider({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{if(!supabase){setLoading(false);return;} const {data}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);setLoading(false)}); supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)}); return()=>data.subscription.unsubscribe()},[]);
 return <AuthContext.Provider value={useMemo(()=>({user:session?.user??null,session,loading}),[session,loading])}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
