import './clock.css';

export interface ClockProps {
    value: number;
}

export function Clock(props: ClockProps) {
    const seconds = props.value % 60;
    const minutes = (props.value - seconds) / 60;
    return (
        <div className="clock">
           {minutes < 10 ? 0 : ''}{minutes}:{seconds < 10 ? 0 : ''}{seconds}
        </div>
    );
}