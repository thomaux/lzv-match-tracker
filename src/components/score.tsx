import { MouseEvent as ReactMouseEvent } from 'react';

export interface ScoreProps {
    value: number;
    onClick: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function Score(props: ScoreProps){
    return (
        <button onClick={props.onClick}>{ props.value}</button>
    );
}