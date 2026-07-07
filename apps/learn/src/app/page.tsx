import Link from "next/link";

export default function RootPage() {
  return (
    <div className="course-picker">
      <h1>PawWalk Academy</h1>
      <p>Choose your language / Elige tu idioma</p>
      <div className="course-grid" style={{ maxWidth: 400, margin: "0 auto" }}>
        <Link href="/en" className="course-card">
          <span className="course-emoji">🇬🇧</span>
          <span className="course-title">English</span>
        </Link>
        <Link href="/es" className="course-card">
          <span className="course-emoji">🇪🇸</span>
          <span className="course-title">Español</span>
        </Link>
      </div>
    </div>
  );
}
