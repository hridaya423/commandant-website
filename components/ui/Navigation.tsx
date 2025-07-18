'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'HOME' },
    { href: '/docs', label: 'DOCS' },
    { href: '/examples', label: 'EXAMPLES' },
    { href: '/playground', label: 'PLAYGROUND' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal-black/95 backdrop-blur-md border-b border-concrete-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-display font-bold text-platinum-white hover:text-cargo-orange transition-colors">
            C
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-platinum-white hover:text-cargo-orange transition-colors duration-200 font-sans font-medium tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 text-platinum-white hover:text-cargo-orange transition-colors"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-charcoal-black/98 border-t border-concrete-gray">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-platinum-white hover:text-cargo-orange block px-3 py-2 text-base font-medium transition-colors tracking-wide font-sans"
              onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}