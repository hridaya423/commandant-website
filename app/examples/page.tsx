'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

export default function ExamplesPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [copiedCode, setCopiedCode] = useState('');

  const examples: Record<string, {
    title: string;
    description: string;
    examples: Array<{
      title: string;
      description: string;
      code: string;
      output: string;
    }>;
  }> = {
    basic: {
      title: 'Basic Operations',
      description: 'Variable declaration, arithmetic, and output',
      examples: [
        {
          title: 'Force Deployment',
          description: 'Basic variable operations and arithmetic',
          code: `// Deploy initial forces
enlist soldiers = 100
enlist reinforcements = 50
enlist total_force = soldiers reinforce reinforcements
shout "Total forces deployed: " reinforce total_force

// Calculate supplies
enlist supply_per_soldier = 10
enlist total_supplies = total_force amplify supply_per_soldier
shout "Total supplies needed: " reinforce total_supplies`,
          output: `Total forces deployed: 150
Total supplies needed: 1500`
        },
        {
          title: 'Resource Management',
          description: 'Managing military resources with arithmetic operations',
          code: `// Initial resources
enlist ammo_crates = 200
enlist fuel_tanks = 75
enlist rations = 1000

// Calculate consumption
enlist daily_ammo_use = 25
enlist daily_fuel_use = 10
enlist daily_rations_use = 50

// Days of operation
enlist ammo_days = ammo_crates decimate daily_ammo_use
enlist fuel_days = fuel_tanks decimate daily_fuel_use
enlist ration_days = rations decimate daily_rations_use

shout "Ammo will last: " reinforce ammo_days reinforce " days"
shout "Fuel will last: " reinforce fuel_days reinforce " days"
shout "Rations will last: " reinforce ration_days reinforce " days"`,
          output: `Ammo will last: 8 days
Fuel will last: 7 days
Rations will last: 20 days`
        }
      ]
    },
    control: {
      title: 'Control Flow',
      description: 'Conditional statements and loops for tactical decisions',
      examples: [
        {
          title: 'Threat Assessment',
          description: 'Using conditional logic for threat evaluation',
          code: `// Assess current threat level
enlist threat_level = 7
enlist available_forces = 150
enlist required_forces = 100

recon threat_level outranks 8:
    shout "DEFCON 1: Maximum threat detected!"
    shout "Initiating emergency protocols"
else recon threat_level outranks 5:
    shout "DEFCON 2: High threat level"
    recon available_forces outranks required_forces:
        shout "Sufficient forces available"
    fallback position:
        shout "Requesting additional support"
fallback position:
    shout "DEFCON 3: Minimal threat"
    shout "Maintaining standard operations"
secure.`,
          output: `DEFCON 2: High threat level
Sufficient forces available`
        },
        {
          title: 'Mission Countdown',
          description: 'Loop-based countdown for mission deployment',
          code: `// Mission countdown sequence
enlist countdown = 5
shout "Mission deployment initiated"

while under siege countdown outranks 0:
    shout "T-minus " reinforce countdown
    countdown = countdown expend 1
break siege.

shout "Mission launched!"
shout "All units deployed successfully"`,
          output: `Mission deployment initiated
T-minus 5
T-minus 4
T-minus 3
T-minus 2
T-minus 1
Mission launched!
All units deployed successfully`
        }
      ]
    },
    functions: {
      title: 'Mission Functions',
      description: 'Function definitions and execution for reusable operations',
      examples: [
        {
          title: 'Casualty Calculator',
          description: 'Function to calculate mission casualties and survival rates',
          code: `// Define mission for casualty calculation
mission calculate_casualties with initial_forces, casualties:
    enlist survivors = initial_forces expend casualties
    enlist survival_rate = survivors amplify 100 decimate initial_forces
    shout "Initial forces: " reinforce initial_forces
    shout "Casualties: " reinforce casualties
    shout "Survivors: " reinforce survivors
    shout "Survival rate: " reinforce survival_rate reinforce "%"
    report survivors
retreat.

// Execute casualty calculations
enlist alpha_survivors = execute calculate_casualties with 150, 23
enlist bravo_survivors = execute calculate_casualties with 120, 15

shout "Alpha squad survivors: " reinforce alpha_survivors
shout "Bravo squad survivors: " reinforce bravo_survivors`,
          output: `Initial forces: 150
Casualties: 23
Survivors: 127
Survival rate: 84%
Initial forces: 120
Casualties: 15
Survivors: 105
Survival rate: 87%
Alpha squad survivors: 127
Bravo squad survivors: 105`
        },
        {
          title: 'Mission Status',
          description: 'Function for checking and reporting mission status',
          code: `// Define status checking mission
mission get_mission_status with mission_id, completion_percent:
    recon completion_percent is equal to 100:
        report "Mission " reinforce mission_id reinforce " COMPLETE"
    else recon completion_percent outranks 75:
        report "Mission " reinforce mission_id reinforce " NEARLY COMPLETE"
    else recon completion_percent outranks 50:
        report "Mission " reinforce mission_id reinforce " IN PROGRESS"
    fallback position:
        report "Mission " reinforce mission_id reinforce " JUST STARTED"
    secure.
retreat.

// Check various mission statuses
enlist alpha_status = execute get_mission_status with "Alpha-7", 100
enlist bravo_status = execute get_mission_status with "Bravo-3", 65
enlist charlie_status = execute get_mission_status with "Charlie-1", 25

shout alpha_status
shout bravo_status
shout charlie_status`,
          output: `Mission Alpha-7 COMPLETE
Mission Bravo-3 IN PROGRESS
Mission Charlie-1 JUST STARTED`
        }
      ]
    },
    arrays: {
      title: 'Squad Management',
      description: 'Array operations for managing units and resources',
      examples: [
        {
          title: 'Unit Roster',
          description: 'Creating and managing squad rosters with arrays',
          code: `// Initialize squad roster
enlist alpha_squad = ["Alpha-1", "Alpha-2", "Alpha-3"]
enlist bravo_squad = ["Bravo-1", "Bravo-2"]

shout "Initial Alpha squad:"
patrol through unit in alpha_squad:
    shout "- " reinforce unit reinforce " reporting for duty"
end patrol.

// Deploy additional units
execute deploy with alpha_squad, "Alpha-4"
execute deploy with bravo_squad, "Bravo-3"

shout "After reinforcements:"
shout "Alpha squad size: " reinforce execute headcount with alpha_squad
shout "Bravo squad size: " reinforce execute headcount with bravo_squad

// Squad roll call
shout "Complete Alpha squad roster:"
patrol through soldier in alpha_squad:
    shout "Unit " reinforce soldier reinforce " ready for deployment"
end patrol.`,
          output: `Initial Alpha squad:
- Alpha-1 reporting for duty
- Alpha-2 reporting for duty
- Alpha-3 reporting for duty
After reinforcements:
Alpha squad size: 4
Bravo squad size: 3
Complete Alpha squad roster:
Unit Alpha-1 ready for deployment
Unit Alpha-2 ready for deployment
Unit Alpha-3 ready for deployment
Unit Alpha-4 ready for deployment`
        },
        {
          title: 'Equipment Inventory',
          description: 'Managing military equipment using array operations',
          code: `// Equipment inventory management
enlist equipment = ["Rifles", "Radios", "MedKits"]
enlist quantities = [50, 25, 30]

shout "Initial equipment inventory:"
patrol through item in equipment:
    shout "- " reinforce item reinforce " available"
end patrol.

// Add new equipment
execute deploy with equipment, "NightVision"
execute deploy with quantities, 15

// Remove damaged equipment
enlist damaged_item = execute extract with equipment
enlist damaged_qty = execute extract with quantities

shout "After inventory update:"
shout "Equipment types: " reinforce execute headcount with equipment
shout "Removed damaged: " reinforce damaged_item

// Final inventory check
shout "Current inventory:"
patrol through gear in equipment:
    shout "✓ " reinforce gear reinforce " in stock"
end patrol.`,
          output: `Initial equipment inventory:
- Rifles available
- Radios available
- MedKits available
After inventory update:
Equipment types: 3
Removed damaged: NightVision
Current inventory:
✓ Rifles in stock
✓ Radios in stock
✓ MedKits in stock`
        }
      ]
    },
    advanced: {
      title: 'Advanced Operations',
      description: 'Complex scenarios combining multiple language features',
      examples: [
        {
          title: 'Mission Command Center',
          description: 'Complete mission management system',
          code: `// Mission command center simulation
enlist missions = ["Recon", "Assault", "Extraction"]
enlist mission_status = [75, 100, 45]
enlist assigned_units = [["Alpha-1", "Alpha-2"], ["Bravo-1"], ["Charlie-1", "Charlie-2", "Charlie-3"]]

// Mission status report function
mission report_mission_status with mission_name, completion, units:
    shout "=== MISSION " reinforce mission_name reinforce " REPORT ==="
    shout "Completion: " reinforce completion reinforce "%"
    shout "Assigned units:"
    patrol through unit in units:
        shout "  - " reinforce unit
    end patrol.
    
    recon completion is equal to 100:
        shout "STATUS: MISSION COMPLETE ✓"
    else recon completion outranks 75:
        shout "STATUS: NEARLY COMPLETE"
    else recon completion outranks 50:
        shout "STATUS: IN PROGRESS"
    fallback position:
        shout "STATUS: JUST STARTED"
    secure.
    shout "========================="
retreat.

// Generate comprehensive mission report
shout "TACTICAL OPERATIONS CENTER - MISSION BRIEFING"
shout "============================================="

enlist mission_index = 0
while under siege mission_index is outranked by 3:
    execute report_mission_status with missions[mission_index], mission_status[mission_index], assigned_units[mission_index]
    mission_index = mission_index reinforce 1
break siege.

shout "END OF BRIEFING"`,
          output: `TACTICAL OPERATIONS CENTER - MISSION BRIEFING
=============================================
=== MISSION Recon REPORT ===
Completion: 75%
Assigned units:
  - Alpha-1
  - Alpha-2
STATUS: NEARLY COMPLETE
=========================
=== MISSION Assault REPORT ===
Completion: 100%
Assigned units:
  - Bravo-1
STATUS: MISSION COMPLETE ✓
=========================
=== MISSION Extraction REPORT ===
Completion: 45%
Assigned units:
  - Charlie-1
  - Charlie-2
  - Charlie-3
STATUS: JUST STARTED
=========================
END OF BRIEFING`
        }
      ]
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const runInPlayground = (code: string) => {
    const encodedCode = encodeURIComponent(code);
    window.open(`/playground?code=${encodedCode}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-charcoal-black">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-platinum-white mb-6 tracking-wide">
            BATTLE EXAMPLES
          </h1>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto font-sans">
            Learn COMMANDANT through practical military programming scenarios
          </p>
        </div>

        <div className="flex flex-wrap justify-center mb-12 gap-3">
          {Object.entries(examples).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 font-sans font-bold transition-all duration-300 border ${
                activeTab === key
                  ? 'bg-cargo-orange text-charcoal-black border-cargo-orange'
                  : 'bg-transparent text-cargo-orange border-cargo-orange hover:bg-cargo-orange hover:text-charcoal-black'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-platinum-white mb-4">
              {examples[activeTab].title}
            </h2>
            <p className="text-lg text-steel-gray max-w-2xl mx-auto font-sans">
              {examples[activeTab].description}
            </p>
          </div>

          <div className="space-y-12">
            {examples[activeTab].examples.map((example, index) => (
              <div key={index} className="cargo-container rounded-none p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold text-cargo-orange mb-2">
                    {example.title}
                  </h3>
                  <p className="text-steel-gray font-sans">
                    {example.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-display font-bold text-platinum-white">
                        Code
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(example.code)}
                          className="px-3 py-1 bg-steel-gray text-charcoal-black font-mono text-sm hover:bg-cargo-orange transition-colors"
                        >
                          {copiedCode === example.code ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => runInPlayground(example.code)}
                          className="px-3 py-1 bg-electric-blue text-charcoal-black font-mono text-sm hover:bg-cargo-orange transition-colors"
                        >
                          Run
                        </button>
                      </div>
                    </div>
                    <div className="cargo-manifest rounded-none p-4 overflow-x-auto">
                      <pre className="text-cargo-orange font-mono text-sm whitespace-pre-wrap">
                        {example.code}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-display font-bold text-platinum-white mb-3">
                      Expected Output
                    </h4>
                    <div className="bg-industrial-blue border border-steel-gray rounded-none p-4 overflow-x-auto">
                      <pre className="text-electric-blue font-mono text-sm whitespace-pre-wrap">
                        {example.output}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/playground"
              className="btn-cargo btn-industrial inline-flex items-center justify-center text-lg px-8 py-4 font-bold font-sans"
            >
              ⚡ TRY IN PLAYGROUND
            </Link>
            <Link
              href="/docs"
              className="btn-cargo-outline inline-flex items-center justify-center text-lg px-8 py-4 font-bold font-sans"
            >
              📖 VIEW DOCUMENTATION
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}