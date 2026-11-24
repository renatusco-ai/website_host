export default function StandaloneLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="border-b border-smoke/70 bg-canvas/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/brand/renatus-logo.svg"
              alt="Renatus"
              className="h-6 w-auto"
            />
          </div>
          <span className="text-xs font-medium tracking-[0.14em] uppercase text-graphite">
            iOS App Store Intake
          </span>
        </div>
      </header>

      <main id="main-content" className="flex-1 relative z-10 bg-canvas">
        {children}
      </main>
    </div>
  );
}
