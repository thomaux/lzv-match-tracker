import { Component } from 'react';
import { GamePhase, isPausedPhase } from '../../models';

export type GameActionType = 'START' | 'RESET' | 'UNDO';

interface GameActionsProps {
    gamePhase: GamePhase;
    allowUndo: boolean;
    execute: (actionType: GameActionType) => void;
}

interface GameActionsState {
    resetRequested: boolean;
}

export class GameActions extends Component<GameActionsProps, GameActionsState> {

    constructor(props: GameActionsProps) {
        super(props);
        this.state = {
            resetRequested: false
        };
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

    executeReset(){
        this.setState({
            resetRequested: false
        });
        this.props.execute('RESET');
    }

    renderUndoAction() {
        if (!this.props.allowUndo || this.state.resetRequested) {
            return (
                <div className="action"></div>
            );
        }
        return (
            <button className="action" onClick={() => this.props.execute('UNDO')}>Undo</button>
        );
    }

    renderPrimaryAction() {
        if (this.props.gamePhase === 'FULL' || this.state.resetRequested) {
            return (
                <button className="action primary" onClick={() => this.executeReset()}>Reset</button>
            );
        }

        if (isPausedPhase(this.props.gamePhase)) {
            return (
                <button className="action primary" onClick={() => this.props.execute('START')}>Start</button>
            );
        }

        return (
            <div className="action"></div>
        );
    }

    renderResetAction() {
        if (['START', 'FULL'].includes(this.props.gamePhase)) {
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

    render() {
        return (
            <div className="actions">
                {this.renderUndoAction()}
                {this.renderPrimaryAction()}
                {this.renderResetAction()}
            </div>
        );
    }

}