import { Button, TextField } from '@material-ui/core';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { loadPlayers, savePlayers } from '../../services/player-service';

export function AddPlayer() {
    const players = loadPlayers();
    const [name, setName] = useState('');
    const history = useHistory();

    function getNextId(): string {
        const currentHighestId = players.reduce((currentMax, current) => { return parseInt(currentMax) > parseInt(current.id) ? currentMax : current.id }, '0');
        return `${parseInt(currentHighestId) + 1}`;
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        savePlayers(players.concat([{
            id: getNextId(),
            name
        }]));
        history.push('/players');
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    return (
        <form onSubmit={submit}>
            <TextField name="name" label="Name" onChange={handleInputChange}></TextField>
            <Button type='submit' color='primary'>Add</Button>
        </form>
    );
}