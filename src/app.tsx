import { Component } from 'react';
import { Clock } from './components/clock/clock';
import './app.css';
import { Score } from './components/score/score';

interface AppState {
    seconds: number;
    gamePhase: GamePhase;
    events: Array<GameEvent>;
}

interface GameEvent {
    seconds: number;
    gamePhase: GamePhase;
    type: GameEventType;
}

type GameEventType = 'GOAL_US' | 'GOAL_THEM' | 'PHASE_START' | 'PHASE_END';
type GamePhase = 'START' | 'FIRST' | 'HALF' | 'SECOND' | 'FULL';

export class App extends Component<unknown, AppState> {
    timer: NodeJS.Timeout | null;
    readonly maxSeconds = 1500; // 25mins

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
        if (!['START', 'HALF'].includes(currentGamePhase)) {
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
        if (!['FIRST', 'SECOND'].includes(currentGamePhase)) {
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
        if (!['FIRST', 'SECOND'].includes(currentGamePhase)) {
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

    render() {
        const events = this.state.events.map((v, i) =>
        (
            <li key={i}>{v.seconds} {v.type} {v.gamePhase}</li>
        )
        );
        const scoreUs = this.state.events.filter(e => e.type === 'GOAL_US').length;
        const scoreThem = this.state.events.filter(e => e.type === 'GOAL_THEM').length;

        return (
            <div className="container">
                <div>
                    <Clock value={this.state.seconds}></Clock>
                </div>
                <div>
                    <Score label="Wij" value={scoreUs} onClick={() => this.markGoal(0)}></Score>
                    <Score label="Zij" value={scoreThem} onClick={() => this.markGoal(1)}></Score>
                </div>

                <hr></hr>
                <div>
                    {this.state.gamePhase}
                </div>
                <button onClick={() => this.startTimer()}>Start</button>
                <button onClick={() => this.stopTimer()}>Stop</button>
   
                <button onClick={() => this.reset()}>Reset</button>
                <ul>
                    {events}
                </ul>
            </div>
        );
    }
}