import { useState, useEffect, useCallback } from 'react';
import type { ShipPart, LegendAwakensState } from '../types';

const ASSEMBLY_ORDER: ShipPart[] = [
  'hull',
  'deck',
  'bow',
  'stern',
  'mast',
  'rigging',
  'sails',
  'wheel',
  'anchor',
  'lanterns',
  'windows',
  'ornaments',
  'figurehead',
  'name',
];

const ASSEMBLY_DURATION = 800; // ms per part

export function useLegendAwakens() {
  const [state, setState] = useState<LegendAwakensState>({
    phase: 'hidden',
    fog: 1.0,
    shipOpacity: 0,
    cameraPosition: [0, 50, 100],
    currentPart: null,
    assembledParts: [],
    repositoriesLoaded: 0,
    totalRepositories: 0,
  });

  // Begin the Legend Awakens sequence
  const beginSequence = useCallback((totalRepos: number) => {
    setState((prev) => ({
      ...prev,
      phase: 'approaching',
      totalRepositories: totalRepos,
    }));
  }, []);

  // Progress to next phase
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (state.phase === 'approaching') {
      // Camera approaches through fog
      timeout = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          phase: 'emerging',
          cameraPosition: [0, 30, 60],
          fog: 0.9,
        }));
      }, 2000);
    } else if (state.phase === 'emerging') {
      // Ship starts to emerge from fog
      timeout = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          phase: 'assembling',
          shipOpacity: 0.3,
          cameraPosition: [0, 15, 40],
          fog: 0.7,
          currentPart: ASSEMBLY_ORDER[0],
        }));
      }, 2000);
    } else if (state.phase === 'assembling' && state.currentPart) {
      // Continue assembly animation
      timeout = setTimeout(() => {
        setState((prev) => {
          const currentIndex = ASSEMBLY_ORDER.indexOf(prev.currentPart!);
          const nextIndex = currentIndex + 1;
          const isComplete = nextIndex >= ASSEMBLY_ORDER.length;

          if (isComplete) {
            return {
              ...prev,
              phase: 'revealing',
              currentPart: null,
              assembledParts: ASSEMBLY_ORDER,
              shipOpacity: 1,
              cameraPosition: [20, 10, 30],
              fog: 0.3,
            };
          }

          return {
            ...prev,
            currentPart: ASSEMBLY_ORDER[nextIndex],
            assembledParts: [...prev.assembledParts, prev.currentPart!],
            cameraPosition: [
              5 * Math.sin(nextIndex * 0.3),
              12 + nextIndex * 0.5,
              35 - nextIndex * 0.5,
            ],
            fog: Math.max(0.3, prev.fog - 0.05),
          };
        });
      }, ASSEMBLY_DURATION);
    } else if (state.phase === 'revealing') {
      // Final camera orbit showcasing the ship
      timeout = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          phase: 'complete',
          cameraPosition: [25, 8, 35],
          fog: 0.2,
        }));
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [state.phase, state.currentPart]);

  // Reset to initial state
  const reset = useCallback(() => {
    setState({
      phase: 'hidden',
      fog: 1.0,
      shipOpacity: 0,
      cameraPosition: [0, 50, 100],
      currentPart: null,
      assembledParts: [],
      repositoriesLoaded: 0,
      totalRepositories: 0,
    });
  }, []);

  // Calculate assembly progress
  const assemblyProgress =
    state.phase === 'assembling' && state.currentPart
      ? ASSEMBLY_ORDER.indexOf(state.currentPart) / ASSEMBLY_ORDER.length
      : state.phase === 'complete' || state.phase === 'revealing'
      ? 1
      : 0;

  return {
    state,
    beginSequence,
    assemblyProgress,
    reset,
    isAssembling: state.phase === 'assembling',
    currentPart: state.currentPart,
    assembledParts: state.assembledParts,
  };
}
