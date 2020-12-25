import { Box, Button, Grid, TextField } from '@material-ui/core';
import { ArrowBackIos } from '@material-ui/icons';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Player } from '../../models/player';

interface AddPlayerProps {
    players: Player[];
    addPlayer: (playerName: string) => void
}

export function AddPlayer(props: AddPlayerProps) {
    const [name, setName] = useState('');
    const history = useHistory();

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        props.addPlayer(name);
        history.push('/players');
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    return (
        <form onSubmit={submit} className="full-height">
            <Grid container direction="column" className="full-height">
                <TextField name="name" label="Name" onChange={handleInputChange} fullWidth margin="normal" required></TextField>
                <Button type='submit' color='primary' variant="contained">Add</Button>
                <Box display="flex" justifyContent="space-between" marginTop="auto" marginBottom="25px" alignItems="flex-end">
                    <Button component={Link} to="/players" startIcon={<ArrowBackIos />}>Back</Button>
                </Box>
            </Grid>
        </form>
    );
}