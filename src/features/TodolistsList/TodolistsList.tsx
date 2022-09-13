import React, {useCallback, useEffect, useState, DragEvent} from 'react'
import {useDispatch} from 'react-redux'
import {
    addTodolistTC,
    changeTodolistFilterAC,
    changeTodolistTitleTC,
    fetchTodolistsTC,
    FilterValuesType,
    removeTodolistTC,
    TodolistDomainType
} from './todolists-reducer'
import {addTaskTC, removeTaskTC, TasksStateType, updateTaskTC} from './Todolist/Task/tasks-reducer'
import {TaskStatuses} from '../../api/todolists-api'
import {AddItemForm} from '../../components/AddItemForm/AddItemForm'
import {Todolist} from './Todolist/Todolist'
import Grid from '@mui/material/Grid';
import {useAppSelector} from "../../app/store";
import {Navigate} from "react-router-dom";
import {authSelectors} from "../login";
import {todolistSelectors} from "./index";
import {taskSelectors} from "./Todolist/Task";

type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {

    const todolists = useAppSelector<Array<TodolistDomainType>>(todolistSelectors.selectTodolists)
    const tasks = useAppSelector<TasksStateType>(taskSelectors.selectTasks)
    const isLoggedIn = useAppSelector<boolean>(authSelectors.selectIsLoggedIn)

    const dispatch = useDispatch()

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        const thunk = fetchTodolistsTC()
        dispatch(thunk)
    }, [])

    const removeTask = useCallback(function (id: string, todolistId: string) {
        const thunk = removeTaskTC({taskId: id, todolistId})
        dispatch(thunk)
    }, [])

    const addTask = useCallback(function (title: string, todolistId: string) {
        const thunk = addTaskTC({title, todolistId})
        dispatch(thunk)
    }, [])

    const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
        const thunk = updateTaskTC({taskId, domainModel: {status}, todolistId})
        dispatch(thunk)
    }, [])

    const changeTaskTitle = useCallback(function (taskId: string, newTitle: string, todolistId: string) {
        const thunk = updateTaskTC({taskId, domainModel: {title: newTitle}, todolistId})
        dispatch(thunk)
    }, [])

    const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
        const action = changeTodolistFilterAC({id: todolistId, filter: value})
        dispatch(action)
    }, [])

    const removeTodolist = useCallback(function (todolistId: string) {
        const thunk = removeTodolistTC({todolistId})
        dispatch(thunk)
    }, [])

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        const thunk = changeTodolistTitleTC({id, title})
        dispatch(thunk)
    }, [])

    const addTodolist = useCallback((title: string) => {
        const thunk = addTodolistTC({title})
        dispatch(thunk)
    }, [dispatch])

    const [currentCard, setCurrentCard] = useState<null | TodolistDomainType>(null)
    const [cardList, setCardList] = useState<Array<TodolistDomainType>>(todolists)

    const dragStartHandler = (e: DragEvent<HTMLDivElement>, card: TodolistDomainType) => {
        console.log('drag', card)
        setCurrentCard(card)
    }
    const dragEndHandler = (e: DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = 'white'
    }
    const dragOverHandler = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.currentTarget.style.background = 'lightgrey'
    }
    const dropHandler = (e: DragEvent<HTMLDivElement>, card: TodolistDomainType) => {
        console.log('drop', card)
        e.preventDefault()
        setCardList(cardList.map(c => {
            if(c.id === card.id) {
                // @ts-ignore
                return {...c, order: currentCard.order}
            }
            // @ts-ignore
            if(c.id === currentCard.id) {
                return {...c, order: card.order}
            }
            return c
        }))
    }

    const sortCards = (a: TodolistDomainType, b: TodolistDomainType) => {
        if(a.order > b.order) {
            return 1
        } else return -1
    }

    if (!isLoggedIn) {
        return <Navigate to={'/login'}/>
    }
    return <>
        <Grid container style={{paddingTop: '20px', display: 'flex', flexDirection: 'column'}}>
            <AddItemForm addItem={addTodolist} placeholder={'Add new To do List'}/>
        </Grid>
        <Grid container spacing={3}>
            {
                cardList.sort(sortCards).map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <div
                            draggable={true}
                            onDragStart={(e) => dragStartHandler(e, tl)}
                            onDragLeave={(e) => dragEndHandler(e)}
                            onDragEnd={(e) => dragEndHandler(e)}
                            onDragOver={(e) => dragOverHandler(e)}
                            onDrop={(e) => dropHandler(e, tl)}
                        >
                            <Todolist
                                id={tl.id}
                                title={tl.title}
                                filter={tl.filter}
                                entityStatus={tl.entityStatus}
                                tasks={allTodolistTasks}
                                removeTask={removeTask}
                                changeFilter={changeFilter}
                                addTask={addTask}
                                changeTaskStatus={changeStatus}
                                removeTodolist={removeTodolist}
                                changeTaskTitle={changeTaskTitle}
                                changeTodolistTitle={changeTodolistTitle}
                                demo={demo}
                            />
                        </div>
                    </Grid>
                })
            }
        </Grid>
    </>
}
