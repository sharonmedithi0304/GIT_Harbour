import { useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Ocean } from './components/Ocean';
import { Fog } from './components/Fog';
import { Sky } from './components/Sky';
import { Flagship } from './components/Flagship';
import { CinematicCamera } from './components/CinematicCamera';
import { FlockOfBirds, DolphinPod, Whale } from './components/Companions';
import { CaptainsCabinOverlay } from './components/CaptainsCabin';
import { useGitHub } from './hooks/useGitHub';
import { useLegendAwakens } from './hooks/useLegendAwakens';
import type { Repository } from './types';
import { Github, Anchor, Compass, Map } from 'lucide-react';

function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-stone-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Ship wheel animation */}
          <div
            className="w-full h-full border-4 border-amber-500/30 rounded-full flex items-center justify-center animate-pulse"
            style={{
              transform: `rotate(${progress * 3.6 * 2}deg)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <div className="w-24 h-24 border-2 border-amber-500/50 rounded-full flex items-center justify-center">
              <Anchor className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          {/* Progress ring */}
          <svg className="absolute inset-0 w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="rgba(217, 119, 6, 0.2)"
              strokeWidth="4"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#d97706"
              strokeWidth="4"
              strokeDasharray={`${progress * 3.51} 999`}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-amber-100 text-lg font-serif mb-2">Awakening Your Legend</p>
        <p className="text-amber-400/60 text-sm">{Math.round(progress)}% complete</p>
      </div>
    </div>
  );
}

function WelcomeScreen({ onLogin, error }: { onLogin: () => void; error: string | null }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-sm" />

      <div className="relative z-10 text-center max-w-2xl mx-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-2xl shadow-amber-900/50 mb-6">
            <Compass className="w-12 h-12 text-amber-200" />
          </div>
          <h1 className="text-5xl font-serif text-amber-100 mb-3 tracking-tight">GitHarbor</h1>
          <p className="text-xl text-amber-300/70 font-light">Where developers become legends</p>
        </div>

        {/* Description */}
        <p className="text-amber-200/60 mb-10 leading-relaxed max-w-md mx-auto">
          Your GitHub repositories are not just code. They are treasures aboard your legendary flagship,
          sailing an endless ocean of innovation.
        </p>

        {/* Login button */}
        <button
          onClick={onLogin}
          className="group relative px-8 py-4 bg-gradient-to-r from-amber-700 to-amber-800 rounded-xl text-amber-100 font-semibold text-lg flex items-center gap-3 mx-auto shadow-xl shadow-amber-900/30 hover:shadow-amber-900/50 transition-all hover:scale-105"
        >
          <Github className="w-5 h-5" />
          Sign in with GitHub
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {error && (
          <p className="mt-4 text-red-400/90 text-sm bg-red-900/20 border border-red-700/30 rounded-lg px-4 py-3 max-w-md mx-auto">
            {error}
          </p>
        )}

        {/* Decorative wave */}
        <div className="mt-12 opacity-20">
          <svg viewBox="0 0 400 50" className="w-full">
            <path
              d="M0,25 Q50,10 100,25 T200,25 T300,25 T400,25"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function AssemblyProgress({ currentPart, assembledParts }: {
  currentPart: string | null;
  assembledParts: string[];
}) {
  if (!currentPart) return null;

  const partNames: Record<string, string> = {
    hull: 'Constructing the hull...',
    deck: 'Laying down the deck...',
    bow: 'Carving the bow...',
    stern: 'Building the stern castle...',
    mast: 'Raising the main mast...',
    rigging: 'Setting up the rigging...',
    sails: 'Unfurling the sails...',
    wheel: 'Mounting the wheel...',
    anchor: 'lowering the anchor...',
    lanterns: 'Igniting the lanterns...',
    windows: 'Polishing the windows...',
    ornaments: 'Adding golden ornaments...',
    figurehead: 'Placing the figurehead...',
    name: 'Carving the name...',
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-stone-900/80 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-amber-900/30">
        <p className="text-amber-100 font-serif text-lg mb-2">{partNames[currentPart] || 'Assembling...'}</p>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {assembledParts.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-amber-500" />
            ))}
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {Array.from({ length: 14 - assembledParts.length - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="w-2 h-2 rounded-full bg-stone-700" />
            ))}
          </div>
          <span className="text-amber-400/60 text-sm">
            {assembledParts.length + 1}/14
          </span>
        </div>
      </div>
    </div>
  );
}

function TopBar({
  isAuthenticated,
  user,
  onOpenCabin,
}: {
  isAuthenticated: boolean;
  user: { username: string; name: string | null; avatar_url: string } | null;
  onOpenCabin: () => void;
}) {
  if (!isAuthenticated) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-30 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center">
            <Compass className="w-5 h-5 text-amber-200" />
          </div>
          <span className="text-amber-100 font-serif text-xl hidden sm:block">GitHarbor</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCabin}
            className="px-4 py-2 bg-amber-800/60 hover:bg-amber-700/60 rounded-lg text-amber-100 flex items-center gap-2 transition-colors border border-amber-700/30"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Captain's Journal</span>
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-amber-100 text-sm font-medium">{user.name || user.username}</p>
                <p className="text-amber-400/60 text-xs">Captain</p>
              </div>
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-10 h-10 rounded-full border-2 border-amber-600/50"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Scene({
  legendState,
  assembledParts,
}: {
  legendState: ReturnType<typeof useLegendAwakens>['state'];
  assembledParts: string[];
}) {
  return (
    <>
      {/* Sky */}
      <Sky />

      {/* Ocean */}
      <Ocean />

      {/* Fog */}
      <Fog density={legendState.fog} />

      {/* Flagship */}
      <Flagship
        assembledParts={assembledParts as any}
        opacity={legendState.shipOpacity}
        position={[0, 0.5, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={0.8}
      />

      {/* Companions - appear when ship is complete */}
      {legendState.phase === 'complete' && (
        <>
          <DolphinPod count={4} centerPosition={[30, -1, 20]} />
          <FlockOfBirds count={6} centerPosition={[0, 30, 0]} />
          <Whale position={[-80, -10, -50]} visible scale={2.5} />
        </>
      )}

      {/* Cinematic camera */}
      <CinematicCamera
        targetPosition={legendState.cameraPosition}
        targetLookAt={[0, 3, 0]}
        phase={legendState.phase}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[100, 50, -100]}
        intensity={1.5}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 30, 0]} intensity={0.3} color="#87ceeb" />

      {/* Fog effect in scene */}
      <fog attach="fog" args={['#1a2a3a', 20, 150]} />
    </>
  );
}

function App() {
  const [cabinOpen, setCabinOpen] = useState(false);
  const [, setSelectedRepository] = useState<Repository | null>(null);
  const [initializing, setInitializing] = useState(true);

  const {
    user,
    repositories,
    signInWithGitHub,
    isAuthenticated,
    error: authError,
  } = useGitHub();

  const {
    state: legendState,
    beginSequence,
    assemblyProgress,
    currentPart,
    assembledParts,
  } = useLegendAwakens();

  // Begin Legend Awakens sequence when user authenticates
  useEffect(() => {
    if (isAuthenticated && repositories.length > 0 && legendState.phase === 'hidden') {
      beginSequence(repositories.length);
    }
  }, [isAuthenticated, repositories, beginSequence, legendState.phase]);

  // Simulate initialization
  useEffect(() => {
    const timer = setTimeout(() => setInitializing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = useCallback(() => {
    signInWithGitHub();
  }, [signInWithGitHub]);

  const handleOpenCabin = useCallback(() => {
    setCabinOpen(true);
  }, []);

  const handleCloseCabin = useCallback(() => {
    setCabinOpen(false);
    setSelectedRepository(null);
  }, []);

  if (initializing) {
    return <LoadingScreen progress={0} />;
  }

  if (!isAuthenticated) {
    return (
      <>
        {/* Background ocean scene */}
        <div className="fixed inset-0">
          <Canvas
            camera={{ position: [0, 30, 60], fov: 60 }}
            shadows
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <Sky />
              <Ocean />
              <Fog />
              <ambientLight intensity={0.4} />
              <directionalLight position={[100, 50, -100]} intensity={1} color="#fff4e0" />
              <fog attach="fog" args={['#1a2a3a', 20, 150]} />
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 4}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Welcome overlay */}
        <WelcomeScreen onLogin={handleLogin} error={authError} />
      </>
    );
  }

  // Assembly loading
  if (legendState.phase !== 'complete' && legendState.phase !== 'hidden') {
    return (
      <>
        {/* Background scene */}
        <div className="fixed inset-0">
          <Canvas
            camera={{ position: legendState.cameraPosition, fov: 60 }}
            shadows
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <Scene
                legendState={legendState}
                assembledParts={assembledParts}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Loading overlay */}
        <LoadingScreen progress={assemblyProgress * 100} />
        <AssemblyProgress
          currentPart={currentPart}
          assembledParts={assembledParts}
        />
      </>
    );
  }

  // Main experience - complete ship
  return (
    <>
      {/* Ocean scene */}
      <div className="fixed inset-0">
        <Canvas
          camera={{ position: legendState.cameraPosition, fov: 60 }}
          shadows
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <Scene
              legendState={legendState}
              assembledParts={assembledParts}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Top navigation */}
      <TopBar
        isAuthenticated={isAuthenticated}
        user={user}
        onOpenCabin={handleOpenCabin}
      />

      {/* Click hint */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-stone-900/60 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-amber-900/20">
          <p className="text-amber-200/70 text-sm">Click anywhere to explore</p>
        </div>
      </div>

      {/* Captain's Cabin overlay */}
      <CaptainsCabinOverlay
        isOpen={cabinOpen}
        onClose={handleCloseCabin}
        repositories={repositories}
        onSelectRepository={setSelectedRepository}
      />
    </>
  );
}

export default App;
