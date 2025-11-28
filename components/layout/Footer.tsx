/**
 * Footer Component
 * Zeigt Footer mit Links und Copyright
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content">
      <nav className="grid grid-flow-col gap-4">
        <a className="link link-hover">Datenschutz</a>
        <a className="link link-hover">AGB</a>
        <a className="link link-hover">Impressum</a>
        <a className="link link-hover">Kontakt</a>
      </nav>
      <aside>
        <p className="font-semibold">
          <span className="text-primary">Zurich</span> Insurance Company Ltd.
        </p>
        <p>© {currentYear} Zurich. Alle Rechte vorbehalten.</p>
      </aside>
    </footer>
  );
}
