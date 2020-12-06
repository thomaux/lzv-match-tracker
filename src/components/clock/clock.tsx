import './clock.css';
import { GamePhase } from '../../app';
export interface ClockProps {
    value: number;
    phase: GamePhase;
}

export function Clock(props: ClockProps) {
    const seconds = props.value % 60;
    const minutes = (props.value - seconds) / 60;
    return (
        <div className="clock">
            <div className="time">
                {minutes < 10 ? 0 : ''}{minutes}:{seconds < 10 ? 0 : ''}{seconds}
            </div>
            <div className="phase">
                <div className={props.phase === 'FIRST' ? 'active' : ''}>1</div>
                <div className={props.phase === 'SECOND' ? 'active' : ''}>2</div>
            </div>
        </div>
    );
}