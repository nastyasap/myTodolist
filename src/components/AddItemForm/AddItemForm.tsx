import React, {ChangeEvent, KeyboardEvent, useState} from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import {AddBox} from '@mui/icons-material';

type AddItemFormPropsType = {
    addItem: (title: string) => void
    disabled?: boolean
    placeholder?: string
}

export const AddItemForm = React.memo(function (props: AddItemFormPropsType) {
    let [title, setTitle] = useState('')
    let [error, setError] = useState<string | null>(null)

    const addItem = () => {
        if (title.trim() !== '') {
            props.addItem(title);
            setTitle('');
        } else {
            setError('Title is required');
        }
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.currentTarget.value)
    }

    const onKeyPressHandler = (e: KeyboardEvent<HTMLInputElement>) => {
        if (error !== null) {
            setError(null);
        }
        if (e.charCode === 13) {
            addItem();
        }
    }

    return <div style={{marginBottom: '10px', display: 'flex', alignItems: 'center'}}>
        <TextField variant="outlined"
                   error={!!error}
                   value={title}
                   onChange={onChangeHandler}
                   onKeyPress={onKeyPressHandler}
                   label={props.placeholder}
                   helperText={error}
        />
        <IconButton color="secondary" size={"large"} onClick={addItem} disabled={props.disabled}>
            <AddBox fontSize={"inherit"}/>
        </IconButton>
    </div>
})
