"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PESTANAS = [
  { href: "/admin/textos", nombre: "Textos" },
  { href: "/admin/afirmaciones", nombre: "Afirmaciones" },
  { href: "/admin", nombre: "Ambientes" },
];

export function Pestanas() {
  const ruta = usePathname();

  return (
    <nav className="flex gap-2 border-b border-lavanda-100/12 pb-3">
      {PESTANAS.map((p) => {
        // "/admin" a secas solo se marca en sí misma; si no, quedaría
        // encendida también estando en Textos o Afirmaciones.
        const activa = p.href === "/admin" ? ruta === "/admin" : ruta.startsWith(p.href);
        return (
          <Link
            key={p.href}
            href={p.href}
            className={`rounded-full px-4 py-2 text-[14px] transition ${
              activa
                ? "bg-lavanda-100 text-violeta-600"
                : "text-lavanda-100/70 hover:text-crema-50"
            }`}
          >
            {p.nombre}
          </Link>
        );
      })}
    </nav>
  );
}
