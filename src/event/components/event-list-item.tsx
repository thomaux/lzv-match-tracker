import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { SportsSoccer, SportsSoccerTwoTone, Timer, TimerOff } from '@material-ui/icons';
import { GameEvent, GameEventType } from '../models/game-event';

interface EventListItemProps {
    event: GameEvent;
    key: number;
    getPlayerName: (playerId: string) => string | undefined;
    getScore: (event: GameEvent) => string;
}

export function EventListItem(props: EventListItemProps) {
    function renderIcon(eventType: GameEventType) {
        switch (eventType) {
            case 'PHASE_START':
                return (<Timer />);
            case 'PHASE_END':
                return (<TimerOff />);
            case 'GOAL_US':
                return (<SportsSoccerTwoTone color="primary" />);
            case 'GOAL_THEM':
                return (<SportsSoccer />);
            default:
                break;
        }
    }

    function renderText(event: GameEvent) {
        let primary: string;
        let secondary: string | undefined;

        switch (event.type) {
            case 'PHASE_START':
                primary = event.gamePhase === 'FIRST' ? 'Start of the game' : 'Start second half';
                break;
            case 'PHASE_END':
                primary = event.gamePhase === 'FIRST' ? 'Halftime' : 'Fulltime';
                secondary = props.getScore(event);
                break;
            case 'GOAL_US':
            case 'GOAL_THEM':
                primary = event.type === 'GOAL_US' ? 'Goal!' : 'Goal';
                secondary = props.getScore(event);
                break;
            case 'CREDIT_GOAL':
                primary = `Scored by ${props.getPlayerName(event.playerId as string)}`;
                break;
            case 'CREDIT_ASSIST':
                primary = `Assist by ${props.getPlayerName(event.playerId as string)}`;
                break
            default:
                return;
        }

        return <ListItemText primary={primary} secondary={secondary}></ListItemText>;
    }


    return (
        <ListItem key={props.key}>
            <ListItemIcon>{renderIcon(props.event.type)}</ListItemIcon>
            {renderText(props.event)}
        </ListItem>
    );
}
