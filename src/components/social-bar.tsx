const socialLinks = [
  { name: 'Twitter',   href: 'https://twitter.com' },
  { name: 'Instagram', href: 'https://instagram.com' },
  { name: 'Pinterest', href: 'https://pinterest.com' },
  { name: 'Behance',   href: 'https://behance.net' },
];

export default function SocialBar() {
  return (
    <section className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 pb-3">
      {socialLinks.map((card) => (
        <a
          key={card.name}
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-fg-primary border border-border-accent/40 px-5 py-5 rounded-xl flex items-center justify-between group shadow-sm transition-theme"
        >
          <span className="text-sm font-bold text-bg-primary">
            {card.name}
          </span>

          {/* Sliding Arrow Icon — bottom-to-top animation */}
          <div className="w-[18px] h-[18px] overflow-hidden flex flex-col pointer-events-none select-none">
            <div className="flex flex-col transition-transform duration-300 group-hover:-translate-y-[18px]">
              {/* Icon 1 — visible by default */}
              <svg
                className="w-[18px] h-[18px] text-bg-primary flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M7 17L17 7M17 7H7M17 7V17"
                />
              </svg>
              {/* Icon 2 — slides in from bottom on hover */}
              <svg
                className="w-[18px] h-[18px] text-bg-primary flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M7 17L17 7M17 7H7M17 7V17"
                />
              </svg>
            </div>
          </div>
        </a>
      ))}
    </section>
  );
}
