import { Container } from '@material-ui/core';
import React, { useState } from "react";
import Div100vh from 'react-div-100vh';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from "react-router-dom";
import './app.css';
import { Game } from './game/components/game/game';
import { GameEvent } from './game/models';
import { AddPlayer } from './player/components/add-player/add-player';
import { PlayerList } from './player/components/player-list/player-list';
import { loadPlayers, savePlayers } from './player/services/player-service';

export function App() {
    const [players, setPlayers] = useState(loadPlayers());
    const [events, setEvents] = useState([] as GameEvent[]);

    function getNextId(): string {
        const currentHighestId = players.reduce((currentMax, current) => { return parseInt(currentMax) > parseInt(current.id) ? currentMax : current.id }, '0');
        return `${parseInt(currentHighestId) + 1}`;
    }

    function deletePlayer(playerId: string) {
        const newPlayers = players.filter(p => p.id !== playerId);
        setPlayers(newPlayers);
        savePlayers(newPlayers);
    }

    function addPlayer(name: string) {
        const newPlayers = players.concat([{
            id: getNextId(),
            name
        }]);
        setPlayers(newPlayers);
        savePlayers(newPlayers);
    }

    function addEvent(event: GameEvent) {
        setEvents(events.concat([event]));
    }

    function undoEvent() {
        setEvents(events.slice(0, -1));
    }

    function clearEvents(){
        setEvents([]);
    }

    return (
        <Div100vh>
            <Container style={{ height: '100%' }}>
                <Router>
                    <Switch>
                        <Route exact path="/">
                            <Game players={players} events={events} addEvent={addEvent} undoEvent={undoEvent} clearEvents={clearEvents}></Game>
                        </Route>
                        <Route exact path="/players">
                            <PlayerList players={players} deletePlayer={deletePlayer}></PlayerList>
                        </Route>
                        <Route path="/players/new">
                            <AddPlayer players={players} addPlayer={addPlayer}></AddPlayer>
                        </Route>
                    </Switch>
                </Router>
            </Container>
        </Div100vh>
    );
}