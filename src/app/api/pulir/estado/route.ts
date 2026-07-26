import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

export async function GET(peticion: Request) {
  const id = new URL(peticion.url).searchParams.get("grabacionId");
  if (!id) return NextResponse.json({ error: "Falta grabacionId" }, { status: 400 });

  const supabase = await supabaseServidor();
  const { data } = await supabase
    .from("grabaciones")
    .select("estado, error")
    .eq("id", id)
    .single();

  if (!data) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(data);
}
