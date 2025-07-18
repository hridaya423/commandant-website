'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  
  const commands = [
    'shout "Enemy spotted!"',
    'enlist soldiers = 100',
    'recon soldiers outranks 50:',
    'while under siege countdown outranks 0:',
    'patrol through unit in squad:'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCommandIndex((prev) => (prev + 1) % commands.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [commands.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-charcoal-black industrial-grid py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-industrial-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-platinum-white mb-8 tracking-wider leading-none">
            COMMANDANT
          </h1>
          
          <p className="text-xl md:text-2xl text-steel-gray mb-16 font-sans font-medium tracking-wide">
            MILITARY COMMAND PROGRAMMING
          </p>

          <div className="mb-16 max-w-4xl mx-auto">
            <div className="cargo-manifest rounded-none p-8 text-left border border-steel-gray shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-cargo-orange"></div>
                  <div className="w-4 h-4 bg-electric-blue"></div>
                  <div className="w-4 h-4 bg-steel-gray"></div>
                </div>
                
              </div>
              <div className="font-mono text-lg md:text-xl">
                <span className="text-steel-gray">C:\TACTICAL\{'>'} </span>
                <span className="text-cargo-orange ml-2">
                  {commands[currentCommandIndex]}
                </span>
                <span className="animate-pulse text-cargo-orange">█</span>
              </div>  
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link
              href="/playground"
              className="btn-cargo btn-industrial inline-flex items-center justify-center text-xl px-10 py-5 font-bold font-sans"
            >
              DEPLOY OPERATIONS
            </Link>
            <Link
              href="/docs"
              className="btn-cargo-outline btn-industrial inline-flex items-center justify-center text-xl px-10 py-5 font-bold font-sans"
            >
              ACCESS MANUAL
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="cargo-container rounded-none p-8 hover:electric-glow transition-all duration-300 group">
              <div className="flex items-center mb-6">
                <div className="text-2xl mr-4 text-cargo-orange font-mono">→</div>
                <div className="text-lg font-display font-bold text-cargo-orange tracking-wide">
                  BASIC OPERATIONS
                </div>
              </div>
              <h3 className="text-xl font-display font-bold text-platinum-white mb-4">
                Variables & Math
              </h3>
              <div className="space-y-3 text-steel-gray font-mono text-sm">
                <div><code className="text-cargo-orange">enlist soldiers = 100</code></div>
                <div><code className="text-cargo-orange">soldiers reinforce 50</code></div>
                <div><code className="text-cargo-orange">ammo expend 25</code></div>
              </div>
              <p className="text-steel-gray font-sans text-sm mt-4 leading-relaxed">
                Deploy forces and manage resources with military arithmetic operations
              </p>
            </div>
            
            <div className="cargo-container rounded-none p-8 hover:electric-glow transition-all duration-300 group">
              <div className="flex items-center mb-6">
                <div className="text-2xl mr-4 text-electric-blue font-mono">◊</div>
                <div className="text-lg font-display font-bold text-electric-blue tracking-wide">
                  COMMAND FLOW
                </div>
              </div>
              <h3 className="text-xl font-display font-bold text-platinum-white mb-4">
                Tactical Decisions
              </h3>
              <div className="space-y-3 text-steel-gray font-mono text-sm">
                <div><code className="text-electric-blue">recon threat outranks 5:</code></div>
                <div><code className="text-electric-blue">while under siege active:</code></div>
                <div><code className="text-electric-blue">mission assault with target:</code></div>
              </div>
              <p className="text-steel-gray font-sans text-sm mt-4 leading-relaxed">
                Execute strategic decisions with conditional reconnaissance and mission planning
              </p>
            </div>
            
            <div className="cargo-container rounded-none p-8 hover:electric-glow transition-all duration-300 group">
              <div className="flex items-center mb-6">
                <div className="text-2xl mr-4 text-steel-gray font-mono">⚡</div>
                <div className="text-lg font-display font-bold text-steel-gray tracking-wide">
                  SQUAD MANAGEMENT
                </div>
              </div>
              <h3 className="text-xl font-display font-bold text-platinum-white mb-4">
                Unit Coordination
              </h3>
              <div className="space-y-3 text-steel-gray font-mono text-sm">
                <div><code className="text-steel-gray">squad = ["Alpha", "Bravo"]</code></div>
                <div><code className="text-steel-gray">patrol through unit in squad:</code></div>
                <div><code className="text-steel-gray">execute deploy with squad, "Charlie"</code></div>
              </div>
              <p className="text-steel-gray font-sans text-sm mt-4 leading-relaxed">
                Organize and coordinate multiple units with advanced array operations
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}