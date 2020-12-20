import { Container } from '@material-ui/core';
import React from "react";
import Div100vh from 'react-div-100vh';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from "react-router-dom";
import { Game } from './game/components/game/game';
import { AddPlayer } from './player/components/add-player/add-player';
import { PlayerList } from './player/components/player-list/player-list';
import './app.css';

export function App() {
    return (
        <Div100vh>
            <Container style={{ height: '100%' }}>
                <Router>
                    <Switch>
                        <Route exact path="/">
                            <Game></Game>
                        </Route>
                        <Route exact path="/players">
                            <PlayerList></PlayerList>
                        </Route>
                        <Route path="/players/new">
                            <AddPlayer></AddPlayer>
                        </Route>
                    </Switch>
                </Router>
            </Container>
        </Div100vh>
    );
}