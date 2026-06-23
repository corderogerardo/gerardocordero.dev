export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="mb-8 space-y-3">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      {lead && <p className="max-w-2xl text-muted">{lead}</p>}
    </header>
  );
}
