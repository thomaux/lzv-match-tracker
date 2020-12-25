import { GamePhase } from '../../game/models/game-phase';

export interface GameEvent {
    seconds: number;
    gamePhase: GamePhase;
    type: GameEventType;
    playerId?: string;
}

// TODO: extend type to include 'isUndoable'
export type GameEventType = 'GOAL_US' | 'GOAL_THEM' | 'PHASE_START' | 'PHASE_END' | 'CREDIT_GOAL' | 'CREDIT_ASSIST';

const undoableEventTypes: GameEventType[] = ['GOAL_US', 'GOAL_THEM', 'CREDIT_ASSIST', 'CREDIT_GOAL'];

export function isEventUndoable(e: GameEvent): boolean {
    return undoableEventTypes.includes(e.type);
}