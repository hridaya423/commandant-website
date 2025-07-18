'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import CursorOverlay from '@/components/ui/CursorOverlay';
import { useCollaboration } from '@/hooks/useCollaboration';

export default function PlaygroundPage() {
  const [mode, setMode] = useState<'solo' | 'room'>('solo');
  const [username, setUsername] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [showRoomCreation, setShowRoomCreation] = useState(false);
  const [showRoomJoin, setShowRoomJoin] = useState(false);
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [otherCursors, setOtherCursors] = useState<{ username: string; position: number; color: string; timestamp: number }[]>([]);
  const lastCursorUpdate = useRef<number>(0);
  const lastCodeSent = useRef<string>('');
  const lastCodeReceived = useRef<string>('');
  const isTypingRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const codeVersion = useRef<number>(1);
  
  const collaboration = useCollaboration();
  
  const [code, setCode] = useState(`// Welcome to the COMMANDANT Playground
shout "Mission briefing initiated"

enlist squad_size = 5
enlist supplies = squad_size amplify 10
shout "Squad size: " reinforce squad_size
shout "Total supplies: " reinforce supplies

recon supplies outranks 40:
    shout "Sufficient supplies for mission"
fallback position:
    shout "Request additional supplies"
secure.

enlist squad = ["Alpha", "Bravo", "Charlie"]
patrol through unit in squad:
    shout "Unit " reinforce unit reinforce " reporting for duty"
end patrol.`);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code');
      if (codeParam) {
        setCode(decodeURIComponent(codeParam));
      }
    }
    
    collaboration.onCodeChange((newCode, username, version) => {
      console.log('Code change received from:', username, 'version:', version, 'Current typing:', isTypingRef.current);
      
      if (version) {
        codeVersion.current = version;
      }
      
      if (!isTypingRef.current && newCode !== lastCodeSent.current) {
        setIsUpdatingCode(true);
        lastCodeReceived.current = newCode;
        setCode(newCode);
        setTimeout(() => setIsUpdatingCode(false), 100);
      } else if (username === 'server') {
        setIsUpdatingCode(true);
        lastCodeReceived.current = newCode;
        setCode(newCode);
        if (version) {
          codeVersion.current = version;
        }
        setTimeout(() => setIsUpdatingCode(false), 100);
      }
    });
    
    collaboration.onCursorChange((username, position) => {
      console.log('Cursor update received:', username, position);
      setOtherCursors(prev => {
        const filtered = prev.filter(cursor => cursor.username !== username);
        const newCursors = [...filtered, {
          username,
          position,
          color: '', 
          timestamp: Date.now()
        }];
        console.log('Updated cursors:', newCursors);
        return newCursors;
      });
    });
    
  }, [collaboration, isUpdatingCode]);

  const [output, setOutput] = useState('');

  const handleCreateRoom = () => {
    if (username.trim()) {
      collaboration.createRoom(username.trim());
      setMode('room');
      setShowRoomCreation(false);
    }
  };

  const handleJoinRoom = () => {
    if (username.trim() && joinRoomId.trim()) {
      collaboration.joinRoom(joinRoomId.trim(), username.trim());
      setMode('room');
      setShowRoomJoin(false);
    }
  };

  const handleLeaveRoom = () => {
    collaboration.leaveRoom();
    setMode('solo');
    setJoinRoomId('');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    isTypingRef.current = true;
    collaboration.startTyping();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      collaboration.stopTyping();
    }, 1000);
    
    if (collaboration.isInRoom && !isUpdatingCode) {
      const debouncedSend = setTimeout(() => {
        if (newCode !== lastCodeReceived.current) {
          lastCodeSent.current = newCode;
          collaboration.sendCodeChange(newCode, codeVersion.current);
        }
      }, 500);
      
      return () => clearTimeout(debouncedSend);
    }
  };

  const handleCursorChange = () => {
    if (collaboration.isInRoom && textareaRef.current) {
      const now = Date.now();
      if (now - lastCursorUpdate.current > 100) {
        const cursorPosition = textareaRef.current.selectionStart;
        console.log('Sending cursor position:', cursorPosition);
        collaboration.sendCursorChange(cursorPosition);
        lastCursorUpdate.current = now;
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOtherCursors(prev => prev.filter(cursor => now - cursor.timestamp < 30000));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const runCode = async () => {
    setOutput('Executing mission...\n');
    
    try {
      setOutput(prev => prev + 'Executing on server...\n');
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOutput(result.output || 'Mission completed successfully.');
      } else {
        setOutput(`Mission failed: ${result.error}`);
      }
    } catch (error) {
      setOutput(`System error: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };


  return (
    <div className="min-h-screen bg-charcoal-black">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-platinum-white mb-6 tracking-wide">
            COMMAND CENTER
          </h1>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto font-sans">
            Interactive COMMANDANT programming environment
          </p>
          
          <div className="flex justify-center gap-6 mt-8 mb-8">
            <button
              onClick={() => setMode('solo')}
              className={`relative cargo-container rounded-none px-8 py-4 font-display font-bold text-lg transition-all duration-300 ${
                mode === 'solo'
                  ? 'bg-cargo-orange text-charcoal-black electric-glow'
                  : 'bg-industrial-blue text-cargo-orange border-cargo-orange hover:electric-glow hover:bg-cargo-orange hover:text-charcoal-black'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div className="text-left">
                  <div className="text-sm font-sans opacity-80">OPERATIONAL MODE</div>
                  <div>SOLO MISSION</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setMode('room')}
              className={`relative cargo-container rounded-none px-8 py-4 font-display font-bold text-lg transition-all duration-300 ${
                mode === 'room'
                  ? 'bg-electric-blue text-charcoal-black electric-glow'
                  : 'bg-industrial-blue text-electric-blue border-electric-blue hover:electric-glow hover:bg-electric-blue hover:text-charcoal-black'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div className="text-left">
                  <div className="text-sm font-sans opacity-80">TACTICAL MODE</div>
                  <div>SQUAD COLLABORATION</div>
                </div>
              </div>
            </button>
          </div>

          {mode === 'room' && (
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-3 bg-industrial-blue px-6 py-3 rounded border border-steel-gray">
                <div className={`w-3 h-3 rounded-full ${collaboration.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-steel-gray">
                  {collaboration.isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {collaboration.isInRoom && (
                  <>
                    <span className="text-steel-gray">•</span>
                    <span className="text-electric-blue font-mono">Room: {collaboration.roomId}</span>
                    <span className="text-steel-gray">•</span>
                    <span className="text-cargo-orange">{collaboration.users.length} Active</span>
                  </>
                )}
              </div>
            </div>
          )}

          {mode === 'room' && !collaboration.isInRoom && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setShowRoomCreation(true)}
                className="btn-cargo btn-industrial px-6 py-3"
              >
                📡 CREATE ROOM
              </button>
              <button
                onClick={() => setShowRoomJoin(true)}
                className="btn-cargo-outline px-6 py-3"
              >
                🔗 JOIN ROOM
              </button>
            </div>
          )}

          {collaboration.isInRoom && collaboration.users.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="bg-industrial-blue px-6 py-3 rounded border border-steel-gray">
                <span className="text-steel-gray mr-3">Squad Members:</span>
                {collaboration.users.map((user, index) => (
                  <span key={user.username} className="text-cargo-orange font-mono">
                    {user.username}
                    {collaboration.isTyping[user.username] && <span className="text-electric-blue ml-1">✍️</span>}
                    {index < collaboration.users.length - 1 && ', '}
                  </span>
                ))}
                <button
                  onClick={handleLeaveRoom}
                  className="ml-4 text-red-400 hover:text-red-300 text-sm"
                >
                  🚪 LEAVE
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="cargo-container rounded-none p-0 overflow-hidden">
            <div className="bg-charcoal-black px-6 py-4 border-b border-concrete-gray">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-cargo-orange rounded-full"></div>
                  <div className="w-3 h-3 bg-electric-blue rounded-full"></div>
                  <div className="w-3 h-3 bg-steel-gray rounded-full"></div>
                </div>
                <span className="text-steel-gray font-mono text-sm">
                  mission_briefing.war | EDITING
                </span>
              </div>
            </div>
            <div className="p-6 relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onMouseUp={handleCursorChange}
                onKeyUp={handleCursorChange}
                onFocus={handleCursorChange}
                onBlur={handleCursorChange}
                className="w-full h-96 bg-industrial-blue text-cargo-orange font-mono text-sm p-4 border border-steel-gray resize-none focus:outline-none focus:border-electric-blue"
                placeholder="Enter your COMMANDANT code here..."
                spellCheck={false}
              />
              {collaboration.isInRoom && (
                <CursorOverlay
                  textareaRef={textareaRef}
                  cursors={otherCursors}
                  code={code}
                />
              )}
            </div>
          </div>

          <div className="cargo-container rounded-none p-0 overflow-hidden">
            <div className="bg-charcoal-black px-6 py-4 border-b border-concrete-gray">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-cargo-orange rounded-full"></div>
                  <div className="w-3 h-3 bg-electric-blue rounded-full"></div>
                  <div className="w-3 h-3 bg-steel-gray rounded-full"></div>
                </div>
                <span className="text-steel-gray font-mono text-sm">
                  TACTICAL_OUTPUT | READY
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="w-full h-96 bg-industrial-blue text-electric-blue font-mono text-sm p-4 border border-steel-gray overflow-y-auto">
                <pre className="whitespace-pre-wrap">
                  {output || 'Awaiting mission execution...\n\nPress DEPLOY OPERATIONS to run your code.'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={runCode}
            className="btn-cargo btn-industrial inline-flex items-center justify-center text-lg px-8 py-4 font-bold font-sans"
          >
            ⚡ DEPLOY OPERATIONS
          </button>
          <button
            onClick={() => setCode('')}
            className="btn-cargo-outline inline-flex items-center justify-center text-lg px-8 py-4 font-bold font-sans"
          >
            🗑️ CLEAR MISSION
          </button>
          <Link
            href="/docs"
            className="btn-cargo-outline inline-flex items-center justify-center text-lg px-8 py-4 font-bold font-sans"
          >
            📖 VIEW MANUAL
          </Link>
        </div>

        <section>
          <h2 className="text-2xl font-display font-bold text-platinum-white mb-8 text-center">
            EXAMPLE MISSIONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              className="cargo-container rounded-none p-6 cursor-pointer hover:electric-glow transition-all duration-300"
              onClick={() => setCode(`// Basic Operations
enlist soldiers = 100
enlist reinforcements = 50
enlist total = soldiers reinforce reinforcements
shout "Total forces: " reinforce total`)}
            >
              <h3 className="text-lg font-display font-bold text-cargo-orange mb-3">
                Force Calculator
              </h3>
              <p className="text-steel-gray font-sans text-sm">
                Basic arithmetic and variable operations
              </p>
            </div>

            <div 
              className="cargo-container rounded-none p-6 cursor-pointer hover:electric-glow transition-all duration-300"
              onClick={() => setCode(`// Conditional Logic
enlist threat_level = 7

recon threat_level outranks 8:
    shout "DEFCON 1: Maximum threat!"
else recon threat_level outranks 5:
    shout "DEFCON 2: High threat"
fallback position:
    shout "DEFCON 3: Minimal threat"
secure.`)}
            >
              <h3 className="text-lg font-display font-bold text-electric-blue mb-3">
                Threat Assessment
              </h3>
              <p className="text-steel-gray font-sans text-sm">
                Conditional logic and decision making
              </p>
            </div>

            <div 
              className="cargo-container rounded-none p-6 cursor-pointer hover:electric-glow transition-all duration-300"
              onClick={() => setCode(`// Array Operations
enlist squad = ["Alpha", "Bravo", "Charlie"]
shout "Initial squad: " reinforce squad

execute deploy with squad, "Delta"
shout "After reinforcement: " reinforce squad

patrol through unit in squad:
    shout "Unit " reinforce unit reinforce " ready"
end patrol.`)}
            >
              <h3 className="text-lg font-display font-bold text-steel-gray mb-3">
                Squad Management
              </h3>
              <p className="text-steel-gray font-sans text-sm">
                Array manipulation and iteration
              </p>
            </div>
          </div>
        </section>

        <div className="text-center mt-12">
          <Link 
            href="/"
            className="btn-cargo-outline inline-flex items-center justify-center text-lg px-8 py-4 font-bold font-sans"
          >
            ← RETURN TO BASE
          </Link>
        </div>
      </div>
      
      {showRoomCreation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-charcoal-black border border-steel-gray rounded p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-display font-bold text-cargo-orange mb-6 text-center">
              📡 CREATE COLLABORATION ROOM
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-steel-gray font-sans text-sm mb-2">
                  Your Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your callsign..."
                  className="w-full bg-industrial-blue text-platinum-white font-mono text-sm p-3 border border-steel-gray rounded focus:outline-none focus:border-electric-blue"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCreateRoom}
                  disabled={!username.trim()}
                  className="flex-1 btn-cargo btn-industrial py-3 disabled:opacity-50"
                >
                  🚀 CREATE ROOM
                </button>
                <button
                  onClick={() => setShowRoomCreation(false)}
                  className="flex-1 btn-cargo-outline py-3"
                >
                  ❌ CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRoomJoin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-charcoal-black border border-steel-gray rounded p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-display font-bold text-electric-blue mb-6 text-center">
              🔗 JOIN COLLABORATION ROOM
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-steel-gray font-sans text-sm mb-2">
                  Room ID
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter room ID..."
                  className="w-full bg-industrial-blue text-platinum-white font-mono text-sm p-3 border border-steel-gray rounded focus:outline-none focus:border-electric-blue"
                />
              </div>
              <div>
                <label className="block text-steel-gray font-sans text-sm mb-2">
                  Your Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your callsign..."
                  className="w-full bg-industrial-blue text-platinum-white font-mono text-sm p-3 border border-steel-gray rounded focus:outline-none focus:border-electric-blue"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleJoinRoom}
                  disabled={!username.trim() || !joinRoomId.trim()}
                  className="flex-1 btn-cargo btn-industrial py-3 disabled:opacity-50"
                >
                  🎯 JOIN ROOM
                </button>
                <button
                  onClick={() => setShowRoomJoin(false)}
                  className="flex-1 btn-cargo-outline py-3"
                >
                  ❌ CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}