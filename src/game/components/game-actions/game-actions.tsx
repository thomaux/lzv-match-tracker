import { Fab, Grid } from '@material-ui/core';
import { Close, PlayArrow, Restore, Undo } from '@material-ui/icons';
import { Component } from 'react';
import { GamePhase, isPausedPhase } from '../../models';
import { ManagePlayersButton } from './manage-players-button';

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

    executeReset() {
        this.setState({
            resetRequested: false
        });
        this.props.execute('RESET');
    }

    renderActionPlaceHolder() {
        return (
            <div style={{ width: '40px' }}></div>
        );
    }

    renderUndoAction() {
        if (!this.props.allowUndo || this.state.resetRequested) {
            return this.renderActionPlaceHolder();
        }
        return (
            <Fab size="small" onClick={() => this.props.execute('UNDO')}>
                <Undo />
            </Fab>
        );
    }

    renderPrimaryAction() {
        if (this.props.gamePhase === 'FULL' || this.state.resetRequested) {
            return (
                <Fab color="secondary" onClick={() => this.executeReset()}>
                    <Restore />
                </Fab>
            );
        }

        if (isPausedPhase(this.props.gamePhase)) {
            return (
                <Fab color="primary" onClick={() => this.props.execute('START')}>
                    <PlayArrow />
                </Fab>
            );
        }
    }

    renderSecondaryAction() {
        if (this.props.gamePhase === 'FULL') {
            return this.renderActionPlaceHolder();
        }

        if (this.props.gamePhase === 'START') {
            return (
                <ManagePlayersButton></ManagePlayersButton>
            );
        }

        if (this.state.resetRequested) {
            return (
                <Fab size="small" onClick={() => this.cancelReset()}>
                    <Close />
                </Fab>
            );
        }

        return (
            <Fab color="secondary" size="small" onClick={() => this.requestReset()}>
                <Restore />
            </Fab>
        );
    }

    render() {
        return (
            <Grid container direction="row" justify="space-between" alignItems="flex-end">
                {this.renderUndoAction()}
                {this.renderPrimaryAction()}
                {this.renderSecondaryAction()}
            </Grid>
        );
    }
}