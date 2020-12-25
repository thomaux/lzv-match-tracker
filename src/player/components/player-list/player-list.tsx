import { Box, Button, Fab, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, ListSubheader } from '@material-ui/core';
import { ArrowBackIos, Delete, PersonAdd } from '@material-ui/icons';
import { Link, useHistory } from 'react-router-dom';
import { Player } from '../../models/player';

interface PlayerListProps {
    players: Player[];
    deletePlayer: (playerId: string) => void;
}

export function PlayerList(props: PlayerListProps) {
    const history = useHistory()

    function addPlayer() {
        history.push('/players/new');
    }

    const playerListItems = props.players.map(p => (
        <ListItem key={p.id}>
            <ListItemText primary={p.name}></ListItemText>
            <ListItemSecondaryAction>
                <IconButton onClick={() => props.deletePlayer(p.id)} color='secondary'>
                    <Delete></Delete>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    ));

    return (
        <Grid container direction="column" className="full-height">
            <List subheader={<ListSubheader>Players</ListSubheader>}>
                {playerListItems}
            </List>
            <Box display="flex" justifyContent="space-between" marginTop="auto" marginBottom="25px" alignItems="flex-end">
                <Button component={Link} to="/" startIcon={<ArrowBackIos />}>Back</Button>
                <Fab onClick={addPlayer} color="primary">
                    <PersonAdd></PersonAdd>
                </Fab>
            </Box>
        </Grid>
    );
}