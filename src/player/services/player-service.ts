import { Player } from '../models/player';

const STORAGE_KEY = 'players';

export function loadPlayers(): Player[] {
    const players = localStorage.getItem(STORAGE_KEY);
    if(!players) {
        return [];
    }
    
    try {
        return JSON.parse(players);
    } catch (err) {
        console.error(err);
        savePlayers([]);
        return [];
    }
}

export function savePlayers(players: Player[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}