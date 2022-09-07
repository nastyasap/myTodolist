import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {RequestStatusType, setAppStatusAC} from "../../app/app-reducer";
import {AxiosError} from "axios";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {fetchTasksTC} from "./Todolist/Task/tasks-reducer";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

// thunks
export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodolistsTC', async (param, {
    dispatch,
    rejectWithValue
}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTodolists()
        dispatch(setAppStatusAC({status: 'succeeded'}))
        const todos = {todolists: res.data}
        todos.todolists.forEach(tl => dispatch(fetchTasksTC(tl.id)))
        return todos
    } catch (error: AxiosError | any) {
        handleServerNetworkError(dispatch, error.message)
        return rejectWithValue({})
    }
})
export const removeTodolistTC = createAsyncThunk('todolists/removeTodolistTC', async (param: { todolistId: string }, {
    dispatch,
    rejectWithValue
}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    dispatch(changeTodoEntityStatusAC({status: 'loading', id: param.todolistId}))
    try {
        await todolistsAPI.deleteTodolist(param.todolistId)
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {id: param.todolistId}
    } catch (error: AxiosError | any) {
        handleServerNetworkError(dispatch, error.message)
        return rejectWithValue({})
    }
})
export const addTodolistTC = createAsyncThunk('todolists/addTodolistTC', async (param: { title: string }, {
    dispatch,
    rejectWithValue
}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTodolist(param.title)
        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {todolist: res.data.data.item}
        } else {
            handleServerAppError(dispatch, res.data)
            return rejectWithValue(({}))
        }
    } catch (error: AxiosError | any) {
        handleServerNetworkError(dispatch, error.message)
        return rejectWithValue(({}))
    }
})

export const changeTodolistTitleTC = createAsyncThunk('todolists/changeTodolistTitleTC', async (param: { id: string, title: string }, {
    dispatch,
    rejectWithValue
}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.updateTodolist(param.id, param.title)
        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {id: param.id, title: param.title}
        } else {
            handleServerAppError(dispatch, res.data)
            return rejectWithValue({})
        }
    } catch (error: AxiosError | any) {
        handleServerNetworkError(dispatch, error.message)
        return rejectWithValue({})
    }
})


const slice = createSlice({
    name: 'todolists',
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].filter = action.payload.filter
        },
        changeTodoEntityStatusAC(state, action: PayloadAction<{ status: RequestStatusType, id: string }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].entityStatus = action.payload.status
        },
        clearDataLogoutAC() {
            return []
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        });
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        });
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: "idle"})
        });
        builder.addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].title = action.payload.title
        });
    }
})

export const todolistsReducer = slice.reducer


export const {
    changeTodolistFilterAC, changeTodoEntityStatusAC, clearDataLogoutAC
} = slice.actions


export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
