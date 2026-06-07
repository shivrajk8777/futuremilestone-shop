export default function Licensing() {
  return (
    <div className="space-y-12 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-border-accent pb-8">
        <span className="text-xs uppercase font-bold tracking-wider text-fg-secondary">Asset Credits</span>
        <h1 className="font-dm-sans text-4xl font-bold tracking-tight text-fg-primary mt-2">Licensing</h1>
      </div>

      {/* Content */}
      <div className="text-sm text-fg-secondary leading-relaxed space-y-8">
        <p className="font-medium text-fg-primary">
          All images, icons, and fonts used in the Future Milestone Furniture are subject to intellectual property rights and are credited below.
        </p>

        <section className="space-y-4">
          <h2 className="font-dm-sans text-lg font-bold text-fg-primary">Photography & Images</h2>
          <p>
            The beautiful furniture and interior staging photographs used on this site are sourced from talented creators on Unsplash and Pexels. They are free to use for personal and commercial projects under the platforms' respective licenses.
          </p>
          <div className="bg-bg-secondary/40 border border-border-accent/40 p-5 rounded-xl space-y-2 text-xs">
            <p>• <span className="font-semibold text-fg-primary">Unsplash Creators:</span> Mitchell Dec, Paul Weaver, Sidekix Media, and Hutomo Abrianto.</p>
            <p>• <span className="font-semibold text-fg-primary">Pexels Creators:</span> Charlotte May, Max Vakhtbovych, and Ksenia Chernaya.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-dm-sans text-lg font-bold text-fg-primary">Typography</h2>
          <p>
            Future Milestone Furniture features premium typography that elevates the reading experience:
          </p>
          <div className="bg-bg-secondary/40 border border-border-accent/40 p-5 rounded-xl space-y-3 text-xs">
            <div>
              <p className="font-semibold text-fg-primary">DM Sans</p>
              <p className="text-fg-secondary/70">Designed by Colophon Foundry. Distributed under the Open Font License (OFL).</p>
            </div>
            <div>
              <p className="font-semibold text-fg-primary">Inter</p>
              <p className="text-fg-secondary/70">Designed by Rasmus Andersson. Distributed under the Open Font License (OFL).</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-dm-sans text-lg font-bold text-fg-primary">Icons</h2>
          <p>
            Vector icons are sourced from the <span className="font-semibold text-fg-primary">Phosphate & Lucide Icons</span> libraries, distributed under the MIT License.
          </p>
        </section>
      </div>
    </div>
  );
}
