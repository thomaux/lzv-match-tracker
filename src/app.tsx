import { Component, MouseEvent as ReactMouseEvent } from 'react';
import './app.css';
import { Clock } from './components/clock/clock';
import { Score } from './components/score/score';

interface AppState {
    seconds: number;
    gamePhase: GamePhase;
    events: Array<GameEvent>;
}

interface AppAction {
    label: string;
    action: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
            events: []
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

    reset() {
        if (this.state.gamePhase === 'START') {
            return;
        }
        this.setState({
            seconds: 0,
            gamePhase: 'START',
            events: []
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

    getActions(): AppAction[] {
        let actions: AppAction[] = [];
        if (this.pausedPhases.includes(this.state.gamePhase)) {
            actions.push({
                label: 'Start',
                action: this.startTimer.bind(this)
            });
        }

        if (this.state.gamePhase !== 'START') {
            actions.push({
                label: 'Reset',
                action: this.reset.bind(this)
            });
        }

        if (this.isLastEventUndoable()) {
            actions.push({
                label: 'Undo',
                action: this.undo.bind(this)
            });
        }
        return actions;
    }

    isLastEventUndoable(): boolean {
        const events = this.state.events;
        const lastEvent = events[events.length - 1];
        return lastEvent && this.undoableEventTypes.includes(lastEvent.type);
    }

    render() {
        const scoreUs = this.state.events.filter(e => e.type === 'GOAL_US').length;
        const scoreThem = this.state.events.filter(e => e.type === 'GOAL_THEM').length;
        const actions = this.getActions().map(({ label, action }) => (
            <button key={label} onClick={action}>{label}</button>
        ));

        return (
            <div className="container">
                <div>
                    <Clock value={this.state.seconds} phase={this.state.gamePhase}></Clock>
                </div>
                <div className="scores">
                    <Score label="Wij" value={scoreUs} onClick={() => this.markGoal(0)}></Score>
                    <span className="score-divider"></span>
                    <Score label="Zij" value={scoreThem} onClick={() => this.markGoal(1)}></Score>
                </div>
                <div className="actions">
                    {actions}
                </div>
            </div>
        );
    }
}