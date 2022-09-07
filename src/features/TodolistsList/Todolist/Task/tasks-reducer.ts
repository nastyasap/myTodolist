import {
    addTodolistTC,
    clearDataLogoutAC,
    fetchTodolistsTC,
    removeTodolistTC
} from '../../todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../../../api/todolists-api'
import {RequestStatusType, setAppStatusAC} from "../../../../app/app-reducer";
import {AxiosError} from "axios";
import {handleServerAppError, handleServerNetworkError} from "../../../../utils/error-utils";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppRootStateType} from "../../../../app/store";

const initialState: TasksStateType = {}

// thunks
export const fetchTasksTC = createAsyncThunk('tasks/fetchTasksTC', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    const res = await todolistsAPI.getTasks(todolistId)
    try {
        const tasks = res.data.items
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
        return {tasks, todolistId}
    } catch (error: AxiosError | any) {
        handleServerNetworkError(thunkAPI.dispatch, error.message)
    }
})

export const removeTaskTC = createAsyncThunk('tasks/removeTaskTC', async (param: { taskId: string, todolistId: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    thunkAPI.dispatch(changeTaskEntityStatusAC({status: 'loading', taskId: param.taskId, todoId: param.todolistId}))
    try {
        await todolistsAPI.deleteTask(param.todolistId, param.taskId)
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
        return {taskId: param.taskId, todolistId: param.todolistId}
    } catch (error: AxiosError | any) {
        handleServerNetworkError(thunkAPI.dispatch, error.message)
    }
})

export const addTaskTC = createAsyncThunk('tasks/addTaskTC', async (param: { title: string, todolistId: string }, {
    dispatch,
    rejectWithValue
}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTask(param.todolistId, param.title)
        if (res.data.resultCode === ResultCodeStatuses.success) {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return res.data.data.item
        } else {
            handleServerAppError(dispatch, res.data)
            return rejectWithValue({})
        }
    } catch (error: AxiosError | any) {
        handleServerNetworkError(dispatch, error.message)
        return rejectWithValue({})
    }
})

export const updateTaskTC = createAsyncThunk('tasks/updateTaskTC', async (param: { taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string }, thunkAPI) => {
    const state = thunkAPI.getState() as AppRootStateType
    const task = state.tasks[param.todolistId].find(t => t.id === param.taskId)
    if (!task) {
        return thunkAPI.rejectWithValue('task not found in the state')
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...param.domainModel
    }
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.updateTask(param.todolistId, param.taskId, apiModel)
        if (res.data.resultCode === ResultCodeStatuses.success) {
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            return {param}
        } else {
            handleServerAppError(thunkAPI.dispatch, res.data)
            return thunkAPI.rejectWithValue({})
        }
    } catch (error: AxiosError | any) {
        handleServerNetworkError(thunkAPI.dispatch, error.message)
        return thunkAPI.rejectWithValue({})
    }

})

// reducer
export const slice = createSlice({
    name: 'tasks',
    initialState: initialState,
    reducers: {
        changeTaskEntityStatusAC(state, action: PayloadAction<{ status: RequestStatusType, taskId: string, todoId: string }>) {
            const tasks = state[action.payload.todoId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                tasks[index].entityStatus = action.payload.status
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            delete state[action.payload.id]
        });
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            action.payload.todolists.forEach(tl => state[tl.id] = [])
        });
        builder.addCase(clearDataLogoutAC, (state, action) => {
            return {}
        });
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            state[action.payload.todolist.id] = []
        });
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            if (action.payload) {
                state[action.payload.todolistId] = action.payload.tasks
            }
        });
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            if (action.payload) {
                const index = state[action.payload.todolistId].findIndex(t => t.id === action.payload!.taskId)
                if (index > -1) {
                    state[action.payload.todolistId].splice(index, 1)
                }
            }
        });
        builder.addCase(addTaskTC.fulfilled, (state, action) => {
            if (action.payload) {
                state[action.payload.todoListId].unshift(action.payload)
            }
        });
        builder.addCase(updateTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.param.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.param.taskId)
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.param.domainModel}
            }
        });
    }
})

export const tasksReducer = slice.reducer

export const {
    changeTaskEntityStatusAC
} = slice.actions


enum ResultCodeStatuses {
    'success' = 0,
    'error' = 1,
    'captcha' = 10
}


// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
