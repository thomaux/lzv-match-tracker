import React from "react";
import {
    BrowserRouter as Router,
    Route,
    Switch
} from "react-router-dom";
import { Game } from './game/components/game/game';
import { PlayerList } from './player/components/player-list/player-list';
import Div100vh from 'react-div-100vh';


export function App() {
    return (
        <Div100vh>
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
        </Div100vh>
    );
}