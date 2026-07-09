import Link from "next/link";

export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            Prep Template
          </span>
        </h1>
        <p className="text-lg text-muted">Choose your language / Elige tu idioma</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/en"
          className="rounded-xl bg-gradient-to-r from-accent to-accent-2 px-8 py-4 text-lg font-bold text-bg transition-opacity hover:opacity-90"
        >
          English
        </Link>
        <Link
          href="/es"
          className="rounded-xl border border-border bg-surface px-8 py-4 text-lg font-bold text-text transition-colors hover:border-accent/50"
        >
          Español
        </Link>
      </div>
    </div>
  );
}
