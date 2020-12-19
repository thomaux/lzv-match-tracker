// TODO: extend types to include 'isPaused'/'isInProgress' 
export type GamePhase = 'START' | 'FIRST' | 'HALF' | 'SECOND' | 'FULL';

const pausedPhases: GamePhase[] = ['START', 'HALF'];
const inProgressPhases: GamePhase[] = ['FIRST', 'SECOND'];

export function isPausedPhase(g: GamePhase): boolean {
    return pausedPhases.includes(g);
}

export function isInProgressPhase(g: GamePhase): boolean {
    return inProgressPhases.includes(g);
}