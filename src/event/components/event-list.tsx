import { Box, Button, Grid, List, ListSubheader } from '@material-ui/core';
import { ArrowBackIos } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { Player } from '../../player/models/player';
import { GameEvent } from '../models/game-event';
import { EventListItem } from './event-list-item';

interface EventListProps {
    events: GameEvent[];
    players: Player[];
}

export function EventList(props: EventListProps) {
    function getPlayerName(playerId: string): string | undefined {
        return props.players.find(p => p.id === playerId)?.name;
    }

    function getScore(event: GameEvent): string {
        const idx = props.events.findIndex(e => e === event);
        const eventsUpToNow = props.events.slice(0, idx + 1);

        const scoreUs = eventsUpToNow.filter(e => e.type === 'GOAL_US').length;
        const scoreThem = eventsUpToNow.filter(e => e.type === 'GOAL_THEM').length;

        return `${scoreUs} - ${scoreThem}`;
    }

    const events = props.events.filter(e => !(['CREDIT_GOAL', 'CREDIT_ASSIST'].includes(e.type) && e.playerId === '0')).map((e, i) => (
        <EventListItem event={e} key={i} getPlayerName={getPlayerName} getScore={getScore} ></EventListItem>
    ));

    return (
        <Grid container direction="column" className="full-height">
            <List subheader={<ListSubheader>Game History</ListSubheader>}>
                {events}
            </List>
            <Box display="flex" marginTop="auto" marginBottom="25px">
                <Button component={Link} to="/" startIcon={<ArrowBackIos />}>Back</Button>
            </Box>
        </Grid>
    );
}