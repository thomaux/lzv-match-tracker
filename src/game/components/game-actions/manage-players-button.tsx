import { Fab } from '@material-ui/core';
import { Group } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';

export function ManagePlayersButton() {
    const history = useHistory();

    function navigateToPlayerList() {
        history.push('/players');
    }

    return (
        <Fab size="small" onClick={navigateToPlayerList}>
            <Group />
        </Fab>
    );
}