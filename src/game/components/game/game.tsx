import { Component } from 'react';
import './game.css';
import { Clock } from '../clock/clock';
import { GameActions, GameActionType } from '../game-actions/game-actions';
import { PlayerSelect } from '../../../player/components/player-select/player-select';
import { Score } from '../score/score';
import { GameEvent, GamePhase, isEventUndoable, isInProgressPhase, isPausedPhase, Player, PlayerAction } from '../../models';

interface AppState {
    seconds: number;
    gamePhase: GamePhase;
    events: Array<GameEvent>;
    players: Player[];
}
export class Game extends Component<unknown, AppState> {
    timer: NodeJS.Timeout | null;
    readonly maxSeconds = 1500; // 25mins

    constructor(props: unknown) {
        super(props);
        this.state = {
            seconds: 0,
            gamePhase: 'START',
            events: [],
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

    reset() {
        if (this.state.gamePhase === 'START') {
            return;
        }
        this.setState({
            seconds: 0,
            gamePhase: 'START',
            events: [],
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

    do(actionType: GameActionType) {
        switch(actionType) {
            case 'START':
                this.startTimer();
                break;
            case 'RESET':
                this.reset();
                break;
            case 'UNDO':
                this.undo();
                break;
            default:
                console.error(`Unknown action ${actionType}`);
                break;
        }
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
            <div className="container">
                <div>
                    <Clock value={this.state.seconds} phase={this.state.gamePhase}></Clock>
                </div>
                <div className="scores">
                    <Score label="Us" value={scoreUs} onClick={() => this.markGoal(0)}></Score>
                    <span className="score-divider"></span>
                    <Score label="Them" value={scoreThem} onClick={() => this.markGoal(1)}></Score>
                </div>
                {this.renderPlayerSelect()}
                <GameActions allowUndo={this.isLastEventUndoable()} gamePhase={this.state.gamePhase} execute={this.do.bind(this)} ></GameActions>
            </div>
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