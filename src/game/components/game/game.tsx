import { Box, Grid } from '@material-ui/core';
import { Component } from 'react';
import { GameEvent, isEventUndoable } from '../../../event/models/game-event';
import { PlayerSelect } from '../../../player/components/player-select/player-select';
import { Player, PlayerAction } from '../../../player/models/player';
import { GamePhase, isInProgressPhase, isPausedPhase } from '../../models/game-phase';
import { Clock } from '../clock/clock';
import { GameActions, GameActionType } from '../game-actions/game-actions';
import { Score } from '../score/score';
import './game.css';

interface GameProps {
    players: Player[];
    events: Array<GameEvent>;
    addEvent: (e: GameEvent) => void;
    undoEvent: () => void;
    clearEvents: () => void;
}
interface GameState {
    startTime: number;
    seconds: number;
    gamePhase: GamePhase;
}

export class Game extends Component<GameProps, GameState> {
    timer: NodeJS.Timeout | null;
    readonly maxSeconds = 1500; // 25mins

    constructor(props: GameProps) {
        super(props);
        const lastEvent = this.getLastEvent();
        const isGameEnded = lastEvent && lastEvent.type === 'PHASE_END' && lastEvent.gamePhase === 'SECOND';
        this.state = {
            startTime: 0,
            seconds: 0,
            gamePhase:  isGameEnded ? 'FULL' : 'START',
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
            startTime: Date.now()
        });

        this.props.addEvent({
            seconds: this.state.seconds,
            gamePhase: nextGamePhase,
            type: 'PHASE_START'
        });
        this.timer = setInterval(() => this.tick(), 1000);
        // Clear before adding, to avoid duplicate handlers
        window.removeEventListener('beforeunload', warnForGameInProgress);
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
            startTime: 0
        });
        this.props.addEvent({
            seconds: this.state.seconds,
            gamePhase: currentGamePhase,
            type: 'PHASE_END'
        });
    }

    reset() {
        if (this.state.gamePhase === 'START') {
            return;
        }
        this.setState({
            startTime: 0,
            seconds: 0,
            gamePhase: 'START'
        });
        this.props.clearEvents();
        clearInterval(this.timer as NodeJS.Timeout);
        window.removeEventListener('beforeunload', warnForGameInProgress);
    }

    tick() {
        let seconds = Math.floor((Date.now() - this.state.startTime) / 1000);
        if (this.state.gamePhase === 'SECOND') {
            seconds += this.maxSeconds;
        }

        this.setState({ seconds })
        if (!(seconds % this.maxSeconds)) {
            this.stopTimer();
        }
    }

    markGoal(team: number) {
        const lastEvent = this.getLastEvent();
        const currentGamePhase = this.state.gamePhase;
        if (!isInProgressPhase(currentGamePhase) || (this.props.players.length && lastEvent && ['GOAL_US', 'CREDIT_GOAL'].includes(lastEvent?.type))) {
            return;
        }
        this.props.addEvent({
            seconds: this.state.seconds,
            gamePhase: currentGamePhase,
            type: !team ? 'GOAL_US' : 'GOAL_THEM'
        });
    }

    creditPlayer(playerAction: PlayerAction, playerId: string) {
        const lastEvent = this.getLastEvent();
        if (!lastEvent || !((playerAction === 'GOAL' && lastEvent.type === 'GOAL_US') || (playerAction === 'ASSIST' && lastEvent.type === 'CREDIT_GOAL'))) {
            return;
        }

        this.props.addEvent({
            seconds: lastEvent.seconds,
            gamePhase: this.state.gamePhase,
            type: playerAction === 'GOAL' ? 'CREDIT_GOAL' : 'CREDIT_ASSIST',
            playerId
        });
    }

    do(actionType: GameActionType) {
        switch (actionType) {
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
        this.props.undoEvent();
    }

    getLastEvent(): GameEvent | undefined {
        const events = this.props.events;
        return events.length ? events[events.length - 1] : undefined;
    }

    isLastEventUndoable(): boolean {
        const lastEvent = this.getLastEvent();
        return lastEvent !== undefined && isEventUndoable(lastEvent);
    }

    // FIXME: Allow crediting player after time runs out
    renderPlayerSelect() {
        const lastEvent = this.getLastEvent();
        if (!this.props.players.length || !lastEvent || !['GOAL_US', 'CREDIT_GOAL'].includes(lastEvent.type)) {
            return;
        }

        const creditFor: PlayerAction = lastEvent.type === 'GOAL_US' ? 'GOAL' : 'ASSIST';

        return (
            <PlayerSelect players={this.props.players} creditFor={creditFor} onClick={this.creditPlayer.bind(this)}></PlayerSelect>
        )
    }

    render() {
        const scoreUs = this.props.events.filter(e => e.type === 'GOAL_US').length;
        const scoreThem = this.props.events.filter(e => e.type === 'GOAL_THEM').length;

        return (
            <Grid container direction="column" alignItems="center" className='full-height'>
                <div>
                    <Clock value={this.state.seconds} phase={this.state.gamePhase}></Clock>
                </div>
                <div className="scores">
                    <Score label="Us" value={scoreUs} onClick={() => this.markGoal(0)}></Score>
                    <span className="score-divider"></span>
                    <Score label="Them" value={scoreThem} onClick={() => this.markGoal(1)}></Score>
                </div>
                {this.renderPlayerSelect()}
                <Box marginTop="auto" marginBottom="25px" width="100%">
                    <GameActions allowUndo={this.isLastEventUndoable()} gamePhase={this.state.gamePhase} execute={this.do.bind(this)} ></GameActions>
                </Box>
            </Grid>
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