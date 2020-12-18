import { Component } from 'react';
import Div100vh from 'react-div-100vh';
import './app.css';
import { Clock } from './components/clock/clock';
import { PlayerSelect } from './components/player-select/player-select';
import { Score } from './components/score/score';
import { GameEvent, GamePhase, isEventUndoable, isInProgressPhase, isPausedPhase, Player, PlayerAction } from './models';

interface AppState {
    seconds: number;
    gamePhase: GamePhase;
    events: Array<GameEvent>;
    resetRequested: boolean;
    players: Player[];
}
export class App extends Component<unknown, AppState> {
    timer: NodeJS.Timeout | null;
    readonly maxSeconds = 1500; // 25mins

    constructor(props: unknown) {
        super(props);
        this.state = {
            seconds: 0,
            gamePhase: 'START',
            events: [],
            resetRequested: false,
            players: [{
                id: '1',
                name: 'Player 1'
            }]
        };
        this.timer = null;
    }

    startTimer() {
        const currentGamePhase = this.state.gamePhase;
        if (!isPausedPhase(currentGamePhase)) {
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
        window.addEventListener('beforeunload', warnForGameInProgress);
    }

    stopTimer() {
        const currentGamePhase = this.state.gamePhase;
        if (!isInProgressPhase(currentGamePhase)) {
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
        window.removeEventListener('beforeunload', warnForGameInProgress);
    }

    tick() {
        const seconds = this.state.seconds + 1;
        this.setState({ seconds })
        if (!(seconds % this.maxSeconds)) {
            this.stopTimer();
        }
    }

    markGoal(team: number) {
        const lastEvent = this.getLastEvent();
        const currentGamePhase = this.state.gamePhase;
        if (!isInProgressPhase(currentGamePhase) || ['GOAL_US', 'CREDIT_GOAL'].includes(lastEvent.type)) {
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

    creditPlayer(playerAction: PlayerAction, playerId: string) {
        const lastEvent = this.getLastEvent();
        if (!((playerAction === 'GOAL' && lastEvent.type === 'GOAL_US') || (playerAction === 'ASSIST' && lastEvent.type === 'CREDIT_GOAL'))) {
            return;
        }

        this.setState({
            events: this.state.events.concat([{
                seconds: lastEvent.seconds,
                gamePhase: this.state.gamePhase,
                type: playerAction === 'GOAL' ? 'CREDIT_GOAL' : 'CREDIT_ASSIST',
                playerId
            }])
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

    getLastEvent(): GameEvent {
        const events = this.state.events;
        return events[events.length - 1];
    }

    isLastEventUndoable(): boolean {
        const lastEvent = this.getLastEvent();
        return lastEvent && isEventUndoable(lastEvent);
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
        if (this.state.gamePhase === 'FULL' || this.state.resetRequested) {
            return (
                <button className="action primary" onClick={() => this.reset()}>Reset</button>
            );
        }

        if (isPausedPhase(this.state.gamePhase)) {
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

        if (this.state.resetRequested) {
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

    // FIXME: Allow crediting player when time runs out
    renderPlayerSelect() {
        const lastEvent = this.getLastEvent();
        if (!lastEvent || !['GOAL_US', 'CREDIT_GOAL'].includes(lastEvent.type)) {
            return;
        }

        const creditFor: PlayerAction = lastEvent.type === 'GOAL_US' ? 'GOAL' : 'ASSIST';

        return (
            <PlayerSelect players={this.state.players} creditFor={creditFor} onClick={this.creditPlayer.bind(this)}></PlayerSelect>
        )
    }

    render() {
        const scoreUs = this.state.events.filter(e => e.type === 'GOAL_US').length;
        const scoreThem = this.state.events.filter(e => e.type === 'GOAL_THEM').length;

        return (
            <Div100vh className="container">
                <div>
                    <Clock value={this.state.seconds} phase={this.state.gamePhase}></Clock>
                </div>
                <div className="scores">
                    <Score label="Us" value={scoreUs} onClick={() => this.markGoal(0)}></Score>
                    <span className="score-divider"></span>
                    <Score label="Them" value={scoreThem} onClick={() => this.markGoal(1)}></Score>
                </div>
                {this.renderPlayerSelect()}
                {this.renderActions()}
            </Div100vh>
        );
    }
}

function warnForGameInProgress(event: BeforeUnloadEvent) {
    // Cancel the event as stated by the standard.
    event.preventDefault();
    // Older browsers supported custom message
    event.returnValue = '';
    return '';
}