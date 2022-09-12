import React, {useCallback} from 'react'
import {AddItemForm} from '../../../components/AddItemForm/AddItemForm'
import {EditableSpan} from '../../../components/EditableSpan/EditableSpan'
import {Task} from './Task/Task'
import {TaskStatuses, TaskType} from '../../../api/todolists-api'
import {FilterValuesType} from '../todolists-reducer'

import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import {Delete} from '@mui/icons-material';
import {RequestStatusType} from "../../../app/app-reducer";

type PropsType = {
    id: string
    title: string
    tasks: Array<TaskType>
    changeFilter: (value: FilterValuesType, todolistId: string) => void
    addTask: (title: string, todolistId: string) => void
    changeTaskStatus: (id: string, status: TaskStatuses, todolistId: string) => void
    changeTaskTitle: (taskId: string, newTitle: string, todolistId: string) => void
    removeTask: (taskId: string, todolistId: string) => void
    removeTodolist: (id: string) => void
    changeTodolistTitle: (id: string, newTitle: string) => void
    filter: FilterValuesType
    entityStatus: RequestStatusType
    demo?: boolean

}

export const Todolist = React.memo(function ({demo = false, ...props}: PropsType) {

    const addTask = useCallback((title: string) => {
        props.addTask(title, props.id)
    }, [props.addTask, props.id])

    const removeTodolist = () => {
        props.removeTodolist(props.id)
    }
    const changeTodolistTitle = useCallback((title: string) => {
        props.changeTodolistTitle(props.id, title)
    }, [props.id, props.changeTodolistTitle])

    const onButtonFilterClickHandler = useCallback((buttonFilter: FilterValuesType) => props.changeFilter(buttonFilter, props.id), [props.id, props.changeFilter])

    let tasksForTodolist = props.tasks

    if (props.filter === 'active') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (props.filter === 'completed') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)
    }

    const renderFilterButton = (buttonFilter: FilterValuesType, title: string) => {
        return <Button
            size={'small'}
            variant={'contained'}
            color={props.filter === buttonFilter ? 'secondary' : 'primary'}
            onClick={() => onButtonFilterClickHandler(buttonFilter)}>{title}
        </Button>
    }

    return <div style={{width: 'fit-content', textAlign: 'center'}}>
        <h3><EditableSpan value={props.title} onChange={changeTodolistTitle}
                          disabled={props.entityStatus === 'loading'}/>
            <IconButton disabled={props.entityStatus === 'loading'} onClick={removeTodolist}>
                <Delete color={'primary'}/>
            </IconButton>
        </h3>
        <AddItemForm addItem={addTask} disabled={props.entityStatus === 'loading'} placeholder={'Title'}/>
        <div>
            {tasksForTodolist.length ?
                tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={props.id}
                                                removeTask={props.removeTask}
                                                changeTaskTitle={props.changeTaskTitle}
                                                changeTaskStatus={props.changeTaskStatus}
                />)
                : <p style={{margin: '10px'}}>No tasks</p>
            }
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {renderFilterButton('all', 'All')}
            {renderFilterButton('active', 'Active')}
            {renderFilterButton('completed', 'Completed')}
        </div>
    </div>
})





