import { Box, Button, Grid, List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';
import { ArrowBackIos } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { GameEvent } from '../models/game-event';

interface EventListProps {
    events: GameEvent[];
}

export function EventList(props: EventListProps) {
    const events = props.events.map((e, i) => (
        <ListItem key={i}>
            <ListItemText primary={e.type}></ListItemText>
        </ListItem>
    ));

    return (
        <Grid container direction="column" className="full-height">
            <List subheader={<ListSubheader>Game History</ListSubheader>} >
                {events}
            </List>
            <Box display="flex" justifyContent="space-between" marginTop="auto" marginBottom="25px" alignItems="flex-end">
                <Button component={Link} to="/" startIcon={<ArrowBackIos />}>Back</Button>
            </Box>
        </Grid>
    );
}