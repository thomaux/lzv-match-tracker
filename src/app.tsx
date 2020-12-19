import { Container } from '@material-ui/core';
import React from "react";
import Div100vh from 'react-div-100vh';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from "react-router-dom";
import { Game } from './game/components/game/game';
import { PlayerList } from './player/components/player-list/player-list';

export function App() {
    return (
        <Div100vh>
            <Container style={{ height: '100%' }}>
                <Router>
                    <Switch>
                        <Route exact path="/">
                            <Game></Game>
                        </Route>
                        <Route path="/players">
                            <PlayerList></PlayerList>
                        </Route>
                    </Switch>
                </Router>
            </Container>
        </Div100vh>
    );
}