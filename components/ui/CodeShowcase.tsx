'use client';

import { useState } from 'react';

export default function CodeShowcase() {
  const [activeTab, setActiveTab] = useState('variables');

  const examples: Record<string, {
    title: string;
    code: string;
  }> = {
    variables: {
      title: 'Variables & Operations',
      code: `// Enlist your forces
enlist soldiers = 100
enlist reinforcements = 50
enlist total_force = soldiers reinforce reinforcements
shout "Total forces: " reinforce total_force

// Deploy tactical operations
enlist ammo = soldiers amplify 5
enlist remaining = ammo expend 75
shout "Ammunition remaining: " reinforce remaining`
    },
    conditionals: {
      title: 'Tactical Reconnaissance',
      code: `// Assess threat levels
enlist threat_level = 7

recon threat_level outranks 8:
    shout "DEFCON 1: Maximum threat detected!"
else recon threat_level outranks 5:
    shout "DEFCON 2: High threat level"
else recon threat_level outranks 2:
    shout "DEFCON 3: Moderate threat"
fallback position:
    shout "DEFCON 4: All clear"
secure.`
    },
    functions: {
      title: 'Mission Operations',
      code: `// Define tactical missions
mission calculate_casualties with initial, losses:
    enlist survivors = initial expend losses
    enlist percentage = survivors amplify 100 decimate initial
    shout "Survival rate: " reinforce percentage reinforce "%"
    report survivors
retreat.

// Execute mission
enlist result = execute calculate_casualties with 150, 23
shout "Mission result: " reinforce result reinforce " survivors"`
    },
    arrays: {
      title: 'Array Operations',
      code: `// Array creation and manipulation
enlist squad = ["Alpha", "Bravo", "Charlie"]
shout "Created: " reinforce squad

// Array access and modification
shout "First unit: " reinforce squad[0]
squad[1] = "Bravo-Two"
shout "Modified: " reinforce squad

// Array operations
execute deploy with squad, "Delta"
shout "After deploy: " reinforce squad

enlist removed = execute extract with squad
shout "Extracted: " reinforce removed

// Iterate through array
patrol through unit in squad:
    shout "Unit " reinforce unit reinforce " reporting"
end patrol.`
    }
  };

  return (
    <section className="py-20 bg-industrial-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-platinum-white mb-4">
            BATTLE OPERATIONS
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto font-sans">
            Master command syntax with military precision
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center mb-8 gap-3">
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-8 py-4 font-sans font-bold transition-all duration-200 border-2 ${
                  activeTab === key
                    ? 'bg-cargo-orange text-charcoal-black border-cargo-orange'
                    : 'bg-transparent text-cargo-orange border-cargo-orange hover:bg-cargo-orange hover:text-charcoal-black'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className="cargo-manifest rounded-none overflow-hidden border border-steel-gray">
            <div className="bg-charcoal-black px-8 py-6 border-b border-concrete-gray">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-cargo-orange"></div>
                  <div className="w-4 h-4 bg-electric-blue"></div>
                  <div className="w-4 h-4 bg-steel-gray"></div>
                </div>
                <span className="text-steel-gray font-mono text-sm">
                  {examples[activeTab as keyof typeof examples].title.toLowerCase().replace(/\s+/g, '_')}.war | OPERATIONAL
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <pre className="text-base md:text-lg text-cargo-orange font-mono overflow-x-auto">
                <code className="language-commandant">
                  {examples[activeTab].code}
                </code>
              </pre>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="cargo-container rounded-none p-6">
              <h4 className="text-lg font-display font-bold text-platinum-white mb-4">Variables</h4>
              <ul className="text-steel-gray space-y-2 font-mono">
                <li><code className="text-cargo-orange">enlist</code> - declare</li>
                <li><code className="text-cargo-orange">reinforce</code> - add</li>
                <li><code className="text-cargo-orange">expend</code> - subtract</li>
              </ul>
            </div>
            
            <div className="cargo-container rounded-none p-6">
              <h4 className="text-lg font-display font-bold text-platinum-white mb-4">Control Flow</h4>
              <ul className="text-steel-gray space-y-2 font-mono">
                <li><code className="text-cargo-orange">recon</code> - if statement</li>
                <li><code className="text-cargo-orange">secure</code> - end block</li>
                <li><code className="text-cargo-orange">fallback</code> - else</li>
              </ul>
            </div>
            
            <div className="cargo-container rounded-none p-6">
              <h4 className="text-lg font-display font-bold text-platinum-white mb-4">Functions</h4>
              <ul className="text-steel-gray space-y-2 font-mono">
                <li><code className="text-cargo-orange">mission</code> - define</li>
                <li><code className="text-cargo-orange">execute</code> - call</li>
                <li><code className="text-cargo-orange">retreat</code> - end</li>
              </ul>
            </div>
            
            <div className="cargo-container rounded-none p-6">
              <h4 className="text-lg font-display font-bold text-platinum-white mb-4">Arrays</h4>
              <ul className="text-steel-gray space-y-2 font-mono">
                <li><code className="text-cargo-orange">deploy</code> - add to array</li>
                <li><code className="text-cargo-orange">extract</code> - remove from array</li>
                <li><code className="text-cargo-orange">patrol through</code> - iterate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}