import React from 'react';

const socialLinks = [
  {
    name: 'Twitter',
    href: '/',
    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
  },
  {
    name: 'Instagram',
    href: '/',
    icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
  },
  {
    name: 'Pinterest',
    href: '/',
    icon: <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.5 0-10 4.5-10 10 0 4.3 2.7 8 6.5 9.4-.1-1-.2-2.6 0-3.7.2-1 1.6-6.8 1.6-6.8s-.4-.8-.4-2c0-1.9 1.1-3.3 2.5-3.3 1.2 0 1.7.9 1.7 1.9 0 1.2-.8 3-1.2 4.6-.3 1.3.7 2.4 1.9 2.4 2.3 0 4-2.4 4-5.9 0-3-2.2-5.1-5.3-5.1-3.6 0-5.7 2.7-5.7 5.5 0 1.1.4 2.3 1 3 .1.1.1.2 0 .4-.1.4-.3 1.2-.4 1.4-.1.2-.2.3-.4.2-1.5-.7-2.4-2.8-2.4-4.5 0-3.7 2.7-7 7.7-7 4 0 7.1 2.8 7.1 6.6 0 4-2.5 7.2-6 7.2-1.2 0-2.3-.6-2.7-1.3l-.7 2.8c-.3 1-1 2.3-1.5 3.1 1.1.3 2.3.5 3.5.5 5.5 0 10-4.5 10-10 0-5.5-4.5-10-10-10z" /></svg>
  },
  {
    name: 'Behance',
    href: '/',
    icon: <span className="font-bold text-[15px] leading-none tracking-tighter">Bē</span>
  },
];

export default function SocialBar() {
  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 pb-3">
      {socialLinks.map((card) => (
        <a
          key={card.name}
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-bg-secondary hover:bg-bg-secondary/80 border border-border-accent/40 px-6 py-4 md:px-5 md:py-5 rounded-xl flex items-center justify-between group shadow-sm transition-colors"
        >
          <span className="text-[15px] font-medium text-fg-primary">
            {card.name}
          </span>
          <div className="w-[18px] h-[18px] overflow-hidden flex flex-col pointer-events-none select-none text-fg-primary">
            <div className="flex flex-col transition-transform duration-300 group-hover:-translate-y-[18px]">
              <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
                {card.icon}
              </div>
              <svg
                className="w-[18px] h-[18px] flex-shrink-0"
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
