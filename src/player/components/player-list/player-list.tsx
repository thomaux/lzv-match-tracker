import { Fab, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, ListSubheader } from '@material-ui/core';
import { Delete, PersonAdd } from '@material-ui/icons';
import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { loadPlayers, savePlayers } from '../../services/player-service';

export function PlayerList() {
    const [players, setPlayers] = useState(loadPlayers());
    const history = useHistory()

    function addPlayer() {
        history.push('/players/new');
    }

    function deletePlayer(playerId: string) {
        const newPlayers = players.filter(p => p.id !== playerId); 
        setPlayers(newPlayers);
        savePlayers(newPlayers);
    }

    const playerListItems = players.map(p => (
        <ListItem key={p.id}>
            <ListItemText primary={p.name}></ListItemText>
            <ListItemSecondaryAction>
                <IconButton onClick={() => deletePlayer(p.id)} color='secondary'>
                    <Delete></Delete>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    ));

    return (
        <div className="full-height">
            <List subheader={<ListSubheader>Player List</ListSubheader>}>
                {playerListItems}
            </List>
            <Link to="/">Back</Link>
            <Fab onClick={addPlayer} color="primary" className="fab">
                <PersonAdd></PersonAdd>
            </Fab>
        </div>
    );
}