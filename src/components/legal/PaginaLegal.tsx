import type { ReactNode } from "react";

export function PaginaLegal({
  titulo,
  actualizada,
  children,
}: {
  titulo: string;
  actualizada: string;
  children: ReactNode;
}) {
  return (
    <article className="bg-cream">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Información legal
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-navy sm:text-5xl">
            {titulo}
          </h1>
          <p className="mt-3 font-body text-sm text-gray-text">
            Última actualización: {actualizada}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-6 rounded-2xl bg-white p-8 font-body text-sm leading-relaxed text-dark sm:p-12 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-navy [&_h3]:mt-6 [&_h3]:font-body [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-navy [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-navy [&_a]:underline-offset-4 [&_a]:hover:underline">
          {children}
        </div>
      </div>
    </article>
  );
}
