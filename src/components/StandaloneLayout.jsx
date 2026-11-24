export default function StandaloneLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="border-b border-smoke/70 bg-canvas/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 min-h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/brand/renatus-logo.svg"
              alt="Renatus"
              className="h-6 w-auto"
            />
          </div>
          <span className="text-right text-xs/5 font-medium tracking-[0.14em] uppercase text-[#4b5060]">
            iOS App Store Intake
          </span>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 relative z-10 bg-canvas scroll-mt-20">
        {children}
      </main>
    </div>
  );
}
