import Link from "next/link";

export const metadata = {
  title: "Aviso de privacidad — Míntara",
};

export default function Privacidad() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-[22px] py-12 text-lavanda-100/80 md:px-10">
      <Link href="/" className="text-[15px] text-lavanda-100/60 hover:text-crema-50">
        ← Míntara
      </Link>

      <h1 className="display text-[34px] leading-tight text-crema-50">
        Aviso de privacidad
      </h1>
      <p className="text-[13px] text-lavanda-100/50">
        Actualizado el 26 de julio de 2026
      </p>

      <h2 className="display mt-4 text-[22px] text-crema-50">Qué guardamos</h2>
      <p className="leading-[1.8]">
        Tu número de celular, el texto de las afirmaciones que escribes o editas,
        y la grabación de tu voz. Nada más. No pedimos nombre, correo, cédula ni
        dirección.
      </p>

      <h2 className="display mt-4 text-[22px] text-crema-50">Para qué</h2>
      <p className="leading-[1.8]">
        Únicamente para que puedas escuchar tus audios dentro de la app. Tu voz
        no se usa para entrenar programas, no se comparte y no se vende a nadie.
      </p>

      <h2 className="display mt-4 text-[22px] text-crema-50">Quién más la toca</h2>
      <p className="leading-[1.8]">
        <strong className="text-crema-50">Nadie.</strong> Tu voz no se manda a
        ninguna empresa externa, ni siquiera para procesarla. El tratamiento que
        le da presencia y empareja el volumen ocurre dentro de tu propio
        teléfono, en el momento en que le das play. Fuera de nuestro
        almacenamiento privado, tu voz no viaja a ningún lado.
      </p>

      <h2 className="display mt-4 text-[22px] text-crema-50">Cuánto tiempo</h2>
      <p className="leading-[1.8]">
        Hasta que tú decidas. Desde tu perfil puedes borrar tu voz y tu cuenta
        entera en un toque, y se elimina de inmediato: no guardamos copias de
        respaldo ni conservamos nada &quot;por treinta días&quot;.
      </p>

      <h2 className="display mt-4 text-[22px] text-crema-50">
        Un límite que debes conocer
      </h2>
      <p className="leading-[1.8]">
        Tus audios se escuchan dentro de la app y no se pueden descargar ni
        compartir desde ella. Aun así, cualquier sonido que salga de un
        navegador puede ser capturado por alguien con conocimientos técnicos. Lo
        hacemos difícil, pero preferimos decírtelo a prometerte algo que no
        podemos garantizar.
      </p>

      <h2 className="display mt-4 text-[22px] text-crema-50">Contacto</h2>
      <p className="leading-[1.8]">
        Escríbenos por WhatsApp al{" "}
        <span className="mono text-crema-50">+593 98 374 5757</span>.
      </p>
    </main>
  );
}
