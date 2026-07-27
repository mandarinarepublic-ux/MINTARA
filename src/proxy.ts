import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión y cierra el paso a las pantallas privadas.
 *
 * OJO: en Next 16 esto ya NO se llama `middleware.ts`. El archivo es
 * `proxy.ts` y la función exportada `proxy`; el nombre viejo está
 * deprecado y no se ejecuta.
 */
export async function proxy(peticion: NextRequest) {
  let respuesta = NextResponse.next({ request: peticion });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return peticion.cookies.getAll();
        },
        setAll(cookiesNuevas) {
          cookiesNuevas.forEach(({ name, value }) =>
            peticion.cookies.set(name, value),
          );
          respuesta = NextResponse.next({ request: peticion });
          cookiesNuevas.forEach(({ name, value, options }) =>
            respuesta.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const privada =
    /^\/(audios|estudio|grabar|mezclar|cuenta|consentimiento|admin|premium)/.test(
      peticion.nextUrl.pathname,
    );

  if (privada && !user) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = "/ingresar";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  // Sin matcher esto corre hasta para los mp3 de fondo y los archivos
  // estáticos, que no necesitan sesión y se cargan muchas veces.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fondos|.*\\.mp3).*)"],
};
