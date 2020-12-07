import { Component } from 'react';
import './app.css';
import { Clock } from './components/clock/clock';
import { Score } from './components/score/score';

interface AppState {
    seconds: number;
    gamePhase: GamePhase;
    events: Array<GameEvent>;
    resetRequested: boolean;
}

interface GameEvent {
    seconds: number;
    gamePhase: GamePhase;
    type: GameEventType;
}

type GameEventType = 'GOAL_US' | 'GOAL_THEM' | 'PHASE_START' | 'PHASE_END';
export type GamePhase = 'START' | 'FIRST' | 'HALF' | 'SECOND' | 'FULL';

export class App extends Component<unknown, AppState> {
    timer: NodeJS.Timeout | null;
    readonly maxSeconds = 1500; // 25mins
    readonly undoableEventTypes: GameEventType[] = ['GOAL_US', 'GOAL_THEM'];
    readonly pausedPhases: GamePhase[] = ['START', 'HALF'];
    readonly inProgressPhases: GamePhase[] = ['FIRST', 'SECOND'];

    constructor(props: unknown) {
        super(props);
        this.state = {
            seconds: 0,
            gamePhase: 'START',
            events: [],
            resetRequested: false
        };
        this.timer = null;
    }

    startTimer() {
        const currentGamePhase = this.state.gamePhase;
        if (!this.pausedPhases.includes(currentGamePhase)) {
            return;
        }
        const nextGamePhase: GamePhase = currentGamePhase === 'START' ? 'FIRST' : 'SECOND';
        this.setState({
            gamePhase: nextGamePhase,
            events: this.state.events.concat([{
                seconds: this.state.seconds,
                gamePhase: nextGamePhase,
                type: 'PHASE_START'
            }])
        });
        this.timer = setInterval(() => this.tick(), 1000);
    }

    stopTimer() {
        const currentGamePhase = this.state.gamePhase;
        if (!this.inProgressPhases.includes(currentGamePhase)) {
            return;
        }
        clearInterval(this.timer as NodeJS.Timeout);
        this.setState({
            gamePhase: currentGamePhase === 'FIRST' ? 'HALF' : 'FULL',
            events: this.state.events.concat([{
                seconds: this.state.seconds,
                gamePhase: currentGamePhase,
                type: 'PHASE_END'
            }])
        });
    }

    requestReset() {
        this.setState({
            resetRequested: true
        });
    }

    cancelReset() {
        this.setState({
            resetRequested: false
        });
    }

    reset() {
        if (this.state.gamePhase === 'START') {
            return;
        }
        this.setState({
            seconds: 0,
            gamePhase: 'START',
            events: [],
            resetRequested: false
        });
        clearInterval(this.timer as NodeJS.Timeout);
    }

    tick() {
        const seconds = this.state.seconds + 1;
        this.setState({ seconds })
        if (!(seconds % this.maxSeconds)) {
            this.stopTimer();
        }
    }

    markGoal(team: number) {
        const currentGamePhase = this.state.gamePhase;
        if (!this.inProgressPhases.includes(currentGamePhase)) {
            return;
        }
        this.setState({
            events: this.state.events.concat([{
                seconds: this.state.seconds,
                gamePhase: currentGamePhase,
                type: !team ? 'GOAL_US' : 'GOAL_THEM'
            }]),
        });
    }

    undo() {
        if (!this.isLastEventUndoable()) {
            return;
        }
        this.setState({
            events: this.state.events.slice(0, -1)
        });
    }

    isLastEventUndoable(): boolean {
        const events = this.state.events;
        const lastEvent = events[events.length - 1];
        return lastEvent && this.undoableEventTypes.includes(lastEvent.type);
    }

    renderUndoAction() {
        if (!this.isLastEventUndoable() || this.state.resetRequested) {
            return (
                <div className="action"></div>
            );
        }
        return (
            <button className="action" onClick={() => this.undo()}>Undo</button>
        );
    }

    renderPrimaryAction() {
        if(this.state.gamePhase === 'FULL' || this.state.resetRequested) {
            return (
                <button className="action primary" onClick={() => this.reset()}>Reset</button>
            );
        }

        if (this.pausedPhases.includes(this.state.gamePhase)) {
            return (
                <button className="action primary" onClick={() => this.startTimer()}>Start</button>
            );
        }
        
        return (
            <div className="action"></div>
        );
    }

    renderResetAction() {
        if (['START', 'FULL'].includes(this.state.gamePhase)) {
            return (
                <div className="action"></div>
            );
        }

        if(this.state.resetRequested) {
            return (
                <button className="action" onClick={() => this.cancelReset()}>Cancel</button>
            );
        }

        return (
            <button className="action" onClick={() => this.requestReset()}>Reset</button>
        );
    }

    renderActions() {
        return (
            <div className="actions">
            {this.renderUndoAction()}
            {this.renderPrimaryAction()}
            {this.renderResetAction()}
        </div>
        );
    }

    render() {
        const scoreUs = this.state.events.filter(e => e.type === 'GOAL_US').length;
        const scoreThem = this.state.events.filter(e => e.type === 'GOAL_THEM').length;

        return (
            <div className="container">
                <div>
                    <Clock value={this.state.seconds} phase={this.state.gamePhase}></Clock>
                </div>
                <div className="scores">
                    <Score label="Us" value={scoreUs} onClick={() => this.markGoal(0)}></Score>
                    <span className="score-divider"></span>
                    <Score label="Them" value={scoreThem} onClick={() => this.markGoal(1)}></Score>
                </div>
                {this.renderActions()}
            </div>
        );
    }
}