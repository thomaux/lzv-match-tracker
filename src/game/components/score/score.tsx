import { MouseEvent as ReactMouseEvent } from 'react';
import { Flip } from '../flip/flip';
import './score.css';

export interface ScoreProps {
    value: number;
    label: string;
    onClick: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function Score(props: ScoreProps) {
    const value = props.value < 10 ? `0${props.value}` : props.value.toString();
    return (
        <button className="score" onClick={props.onClick}>
            <label>
                {props.label}
            </label>
            <Flip value={value}></Flip>
        </button>
    );
}