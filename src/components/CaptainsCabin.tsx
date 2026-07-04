import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';import type { Repository } from '../types';
import { Star, GitFork, ExternalLink, Book, Code, Calendar } from 'lucide-react';

interface CaptainsCabinProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: Repository[];
  onSelectRepository: (repo: Repository) => void;
}

export function CaptainsCabinOverlay({ isOpen, onClose, repositories, onSelectRepository }: CaptainsCabinProps) {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('all');

  // Get unique languages for categories
  const languages = [...new Set(repositories.map((r) => r.language).filter(Boolean))];

  // Filter repos by category
  const filteredRepos = category === 'all'
    ? repositories
    : repositories.filter((r) => r.language === category);

  const handleRepoClick = (repo: Repository) => {
    setSelectedRepo(repo);
    onSelectRepository(repo);
  };

  const handleOpenGitHub = (repo: Repository) => {
    window.open(repo.html_url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Cabin atmosphere overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-stone-900/40 pointer-events-none" />

      {/* Main cabin container */}
      <div className="relative w-full max-w-6xl mx-4 h-[85vh] overflow-hidden rounded-2xl shadow-2xl">
        {/* Wood texture background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 opacity-95" />

        {/* Decorative wood grain pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent"
              style={{ top: `${i * 5}%` }}
            />
          ))}
        </div>

        {/* Lantern glow effects */}
        <div className="absolute top-0 left-10 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-10 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative h-full flex flex-col p-8">
          {/* Header - Captain's Journal */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-lg">
                <Book className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <h1 className="text-2xl font-serif text-amber-100">Captain's Journal</h1>
                <p className="text-amber-300/70 text-sm">Your treasures await</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-stone-800/80 hover:bg-stone-700/80 flex items-center justify-center transition-colors border border-amber-900/30"
            >
              <span className="text-amber-200 text-xl">&times;</span>
            </button>
          </div>

          {/* Category navigation */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                category === 'all'
                  ? 'bg-amber-800/60 text-amber-100 border border-amber-700/50 shadow-lg'
                  : 'bg-stone-800/40 text-amber-200/70 hover:bg-stone-700/40 border border-transparent'
              }`}
            >
              All Treasures ({repositories.length})
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setCategory(lang!)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  category === lang
                    ? 'bg-amber-800/60 text-amber-100 border border-amber-700/50 shadow-lg'
                    : 'bg-stone-800/40 text-amber-200/70 hover:bg-stone-700/40 border border-transparent'
                }`}
              >
                <Code className="w-3 h-3" />
                {lang}
              </button>
            ))}
          </div>

          {/* Repository grid - treasure display */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map((repo, index) => (
                <div
                  key={repo.id}
                  onClick={() => handleRepoClick(repo)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`relative p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                    hoveredIndex === index
                      ? 'bg-gradient-to-br from-amber-900/60 to-stone-800/60 scale-[1.02] shadow-xl shadow-amber-900/20'
                      : 'bg-stone-800/40 hover:bg-stone-700/40'
                  } border ${
                    hoveredIndex === index ? 'border-amber-700/50' : 'border-stone-700/30'
                  }`}
                >
                  {/* Star badge for flagship projects */}
                  {repo.stars >= 50 && (
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 text-amber-100 fill-current" />
                    </div>
                  )}

                  {/* Treasure icon */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      repo.stars >= 50
                        ? 'bg-gradient-to-br from-amber-600/30 to-amber-800/30'
                        : 'bg-stone-700/50'
                    }`}>
                      <span className="text-lg">
                        {repo.stars >= 50 ? '👑' : repo.is_archived ? '📜' : '⚓'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-amber-100 font-semibold text-sm truncate">{repo.name}</h3>
                      <p className="text-amber-400/60 text-xs truncate">{repo.description || 'No description'}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-amber-300/60">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      <span>{repo.forks}</span>
                    </div>
                    {repo.language && (
                      <span className="px-2 py-0.5 rounded bg-stone-700/50 text-amber-200/70">
                        {repo.language}
                      </span>
                    )}
                  </div>

                  {/* Hover actions */}
                  {hoveredIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent rounded-xl flex items-end justify-center pb-4 opacity-0 animate-fade-in">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenGitHub(repo);
                        }}
                        className="px-4 py-1.5 bg-amber-700/80 hover:bg-amber-600/80 text-amber-100 text-sm rounded-lg flex items-center gap-2 transition-colors"
                      >
                        Open on GitHub
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected repository detail */}
          {selectedRepo && (
            <div className="mt-4 p-6 rounded-xl bg-gradient-to-br from-amber-900/40 to-stone-800/40 border border-amber-700/30">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-serif text-amber-100 mb-2">{selectedRepo.name}</h2>
                  <p className="text-amber-300/80 text-sm mb-4">{selectedRepo.description}</p>
                </div>
                <button
                  onClick={() => handleOpenGitHub(selectedRepo)}
                  className="px-4 py-2 bg-amber-700/60 hover:bg-amber-600/60 text-amber-100 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Open on GitHub
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-stone-800/40">
                  <div className="flex items-center gap-2 text-amber-400/70 mb-1">
                    <Star className="w-4 h-4" />
                    Stars
                  </div>
                  <p className="text-amber-100 font-semibold">{selectedRepo.stars}</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-800/40">
                  <div className="flex items-center gap-2 text-amber-400/70 mb-1">
                    <GitFork className="w-4 h-4" />
                    Forks
                  </div>
                  <p className="text-amber-100 font-semibold">{selectedRepo.forks}</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-800/40">
                  <div className="flex items-center gap-2 text-amber-400/70 mb-1">
                    <Code className="w-4 h-4" />
                    Language
                  </div>
                  <p className="text-amber-100 font-semibold">{selectedRepo.language || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-800/40">
                  <div className="flex items-center gap-2 text-amber-400/70 mb-1">
                    <Calendar className="w-4 h-4" />
                    Updated
                  </div>
                  <p className="text-amber-100 font-semibold">
                    {new Date(selectedRepo.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedRepo.topics && selectedRepo.topics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedRepo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 text-xs rounded-full bg-amber-800/40 text-amber-300/80"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(28, 25, 23, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(180, 83, 9, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(180, 83, 9, 0.6);
        }
      `}</style>
    </div>
  );
}

// 3D Cabin scene component (optional interior view)
export function CaptainsCabin3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle ambient motion
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cabin interior would be modeled here for full 3D navigation */}
      {/* Tables, chairs, maps, compass, lanterns, etc. */}
    </group>
  );
}
