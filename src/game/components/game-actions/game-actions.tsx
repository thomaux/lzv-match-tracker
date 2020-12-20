import { Button, Fab, Grid } from '@material-ui/core';
import { PlayArrow, Restore } from '@material-ui/icons';
import { Component } from 'react';
import { Link } from 'react-router-dom';
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

    executeReset() {
        this.setState({
            resetRequested: false
        });
        this.props.execute('RESET');
    }

    renderActionPlaceHolder() {
        return (
            <div style={{ width: '64px' }}></div>
        );
    }

    renderUndoAction() {
        if (!this.props.allowUndo || this.state.resetRequested) {
            return this.renderActionPlaceHolder();
        }
        return (
            <Button onClick={() => this.props.execute('UNDO')}>
                Undo
            </Button>
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
                <Button component={Link} to="/players">Team</Button>
            );
        }

        if (this.state.resetRequested) {
            return (
                <Button onClick={() => this.cancelReset()}>
                    Cancel
                </Button>
            );
        }

        return (
            <Button color="secondary" onClick={() => this.requestReset()}>
                Reset
            </Button>
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