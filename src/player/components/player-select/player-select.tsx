import { Player, PlayerAction } from '../../../game/models';

export interface PlayerSelectProps {
    creditFor: PlayerAction;
    players: Player[];
    onClick: (action: PlayerAction, playerId: string) => void;
}

export function PlayerSelect(props: PlayerSelectProps) {
    const players = props.players.map(p => (
        <li key={p.id}>
            <button onClick={() => props.onClick(props.creditFor, p.id)}>{p.name}</button>
        </li>
    ));
    const title = props.creditFor === 'GOAL' ? 'Who scored?' : 'Who gave the assist?';

    return (
        <div>
            {title}
            <ul>
                {players}
            </ul>
        </div>
    );
}