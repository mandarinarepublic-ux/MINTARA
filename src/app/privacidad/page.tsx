export const metadata = {
  title: "Aviso de privacidad — mi-voz",
};

export default function Privacidad() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12 text-neutral-700">
      <h1 className="text-3xl font-semibold text-neutral-900">
        Aviso de privacidad
      </h1>
      <p className="text-sm text-neutral-500">Actualizado el 26 de julio de 2026</p>

      <h2 className="text-xl font-medium text-neutral-900">Qué guardamos</h2>
      <p>
        Tu número de celular, el texto de las afirmaciones que escribes o editas,
        y la grabación de tu voz. Nada más. No pedimos nombre, correo, cédula ni
        dirección.
      </p>

      <h2 className="text-xl font-medium text-neutral-900">Para qué</h2>
      <p>
        Únicamente para que puedas escuchar tus audios dentro de la app. Tu voz no
        se usa para entrenar programas, no se comparte con terceros fuera del
        servicio que la limpia, y no se vende a nadie.
      </p>

      <h2 className="text-xl font-medium text-neutral-900">Quién más la toca</h2>
      <p>
        <strong>Nadie.</strong> Tu voz no se manda a ninguna empresa externa, ni
        siquiera para procesarla. El tratamiento que le da presencia y empareja
        el volumen ocurre dentro de tu propio teléfono, en el momento en que le
        das play. Fuera de nuestro almacenamiento privado, tu voz no viaja a
        ningún lado.
      </p>

      <h2 className="text-xl font-medium text-neutral-900">Cuánto tiempo</h2>
      <p>
        Hasta que tú decidas. Desde tu cuenta puedes borrar tu voz y tu cuenta
        entera en un toque, y se elimina de inmediato: no guardamos copias de
        respaldo ni conservamos nada &quot;por treinta días&quot;.
      </p>

      <h2 className="text-xl font-medium text-neutral-900">
        Un límite que debes conocer
      </h2>
      <p>
        Tus audios se escuchan dentro de la app y no se pueden descargar ni
        compartir desde ella. Aun así, cualquier sonido que salga de un navegador
        puede ser capturado por alguien con conocimientos técnicos. Lo hacemos
        difícil, pero preferimos decírtelo a prometerte algo que no podemos
        garantizar.
      </p>

      <h2 className="text-xl font-medium text-neutral-900">Contacto</h2>
      <p>Escríbenos por WhatsApp al +593 98 374 5757.</p>
    </main>
  );
}
