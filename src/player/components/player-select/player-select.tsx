import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core';
import { NavigateNext } from '@material-ui/icons';
import { Player, PlayerAction } from '../../../game/models';

export interface PlayerSelectProps {
    creditFor: PlayerAction;
    players: Player[];
    onClick: (action: PlayerAction, playerId: string) => void;
}

export function PlayerSelect(props: PlayerSelectProps) {
    const players = props.players.map(p => (
        <ListItem button key={p.id} onClick={() => props.onClick(props.creditFor, p.id)} divider>
            <ListItemText primary={p.name}></ListItemText>
        </ListItem>
    ));
    const title = props.creditFor === 'GOAL' ? 'Who scored?' : 'Who gave the assist?';

    return (
        <List subheader={<ListSubheader>{title}</ListSubheader>} style={{ width: '100%' }}>
            {players}
            <ListItem button key="0" onClick={() => props.onClick(props.creditFor, '0')}>
                <ListItemText color="secondary" primary="(skip)"></ListItemText>
            </ListItem>
        </List>
    );
}