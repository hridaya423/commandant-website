'use client';

import Link from 'next/link';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-charcoal-black">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-platinum-white mb-6 tracking-wide">
            COMMANDANT MANUAL
          </h1>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto font-sans">
            Complete guide to military command programming
          </p>
        </div>

        <section className="mb-16">
          <div className="cargo-container rounded-none p-8 mb-8">
            <h2 className="text-2xl font-display font-bold text-cargo-orange mb-6">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-display font-bold text-platinum-white mb-4">Your First Command</h3>
                <div className="cargo-manifest rounded-none p-4 mb-4">
                  <pre className="text-cargo-orange font-mono">
{`shout "Hello, Commander!"
enlist soldiers = 100
shout "Forces: " reinforce soldiers`}
                  </pre>
                </div>
                <p className="text-steel-gray font-sans text-sm">
                  Start with basic output and variable assignment using military terminology.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-platinum-white mb-4">Key Concepts</h3>
                <ul className="space-y-2 text-steel-gray font-sans">
                  <li>• <code className="text-cargo-orange">enlist</code> - Declare variables</li>
                  <li>• <code className="text-cargo-orange">shout</code> - Output to console</li>
                  <li>• <code className="text-cargo-orange">recon</code> - Conditional statements</li>
                  <li>• <code className="text-cargo-orange">mission</code> - Function definitions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold text-platinum-white mb-8 text-center">Language Reference</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="cargo-container rounded-none p-6">
              <h3 className="text-xl font-display font-bold text-cargo-orange mb-4">Variables & Operations</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-display text-platinum-white mb-2">Declaration</h4>
                  <div className="cargo-manifest rounded-none p-3">
                    <pre className="text-cargo-orange font-mono text-sm">
{`enlist soldiers = 100
enlist name = "Alpha Squad"
enlist active = 1`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-display text-platinum-white mb-2">Arithmetic</h4>
                  <div className="cargo-manifest rounded-none p-3">
                    <pre className="text-cargo-orange font-mono text-sm">
{`soldiers reinforce 50    // add
ammo expend 25           // subtract
force amplify 2          // multiply
supplies decimate 4      // divide`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <div className="cargo-container rounded-none p-6">
              <h3 className="text-xl font-display font-bold text-electric-blue mb-4">Control Flow</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-display text-platinum-white mb-2">Conditionals</h4>
                  <div className="cargo-manifest rounded-none p-3">
                    <pre className="text-electric-blue font-mono text-sm">
{`recon soldiers outranks 50:
    shout "Sufficient forces!"
else recon soldiers is equal to 0:
    shout "No forces available"
fallback position:
    shout "Limited forces"
secure.`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-display text-platinum-white mb-2">Loops</h4>
                  <div className="cargo-manifest rounded-none p-3">
                    <pre className="text-electric-blue font-mono text-sm">
{`while under siege countdown outranks 0:
    shout "T-minus " reinforce countdown
    countdown = countdown expend 1
break siege.`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="cargo-container rounded-none p-6">
              <h3 className="text-xl font-display font-bold text-steel-gray mb-4">Functions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-display text-platinum-white mb-2">Definition</h4>
                  <div className="cargo-manifest rounded-none p-3">
                    <pre className="text-steel-gray font-mono text-sm">
{`mission calculate_losses with initial, casualties:
    enlist survivors = initial expend casualties
    report survivors
retreat.`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-display text-platinum-white mb-2">Execution</h4>
                  <div className="cargo-manifest rounded-none p-3">
                    <pre className="text-steel-gray font-mono text-sm">
{`enlist result = execute calculate_losses with 100, 15
shout "Survivors: " reinforce result`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="cargo-container rounded-none p-6">
              <h3 className="text-xl font-display font-bold text-cargo-orange mb-4">Arrays</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-display text-platinum-white mb-2">Array Operations</h4>
                  <div className="cargo-manifest rounded-none p-3">
                    <pre className="text-cargo-orange font-mono text-sm">
{`enlist squad = ["Alpha", "Bravo", "Charlie"]
execute deploy with squad, "Delta"     // add
enlist removed = execute extract with squad  // remove
execute reinforce_at with squad, 1, "Echo"   // insert`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-display text-platinum-white mb-2">Iteration</h4>
                  <div className="cargo-manifest rounded-none p-3">
                    <pre className="text-cargo-orange font-mono text-sm">
{`patrol through unit in squad:
    shout "Unit " reinforce unit reinforce " ready"
end patrol.`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="cargo-container rounded-none p-8">
            <h2 className="text-2xl font-display font-bold text-platinum-white mb-6 text-center">Operator Reference</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-display font-bold text-cargo-orange mb-3">Arithmetic</h3>
                <ul className="space-y-2 text-steel-gray font-mono text-sm">
                  <li><code className="text-cargo-orange">reinforce</code> - Addition (+)</li>
                  <li><code className="text-cargo-orange">expend</code> - Subtraction (-)</li>
                  <li><code className="text-cargo-orange">amplify</code> - Multiplication (*)</li>
                  <li><code className="text-cargo-orange">decimate</code> - Division (/)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-electric-blue mb-3">Comparison</h3>
                <ul className="space-y-2 text-steel-gray font-mono text-sm">
                  <li><code className="text-electric-blue">outranks</code> - Greater than ({'>'})</li>
                  <li><code className="text-electric-blue">is outranked by</code> - Less than ({'<'})</li>
                  <li><code className="text-electric-blue">is equal to</code> - Equals (==)</li>
                  <li><code className="text-electric-blue">is not equal to</code> - Not equals (!=)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-steel-gray mb-3">Logical</h3>
                <ul className="space-y-2 text-steel-gray font-mono text-sm">
                  <li><code className="text-steel-gray">and also</code> - Logical AND (&&)</li>
                  <li><code className="text-steel-gray">or else</code> - Logical OR (||)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link 
            href="/"
            className="btn-cargo-outline btn-industrial inline-flex items-center justify-center text-lg px-8 py-4 font-bold font-sans"
          >
            ← RETURN TO BASE
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}