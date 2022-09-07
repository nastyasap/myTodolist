import {authAPI} from "../api/todolists-api";
import {setIsLoggedInAC} from "../features/login/auth-reducer";
import {handleServerAppError, handleServerNetworkError} from "../utils/error-utils";
import {AxiosError} from "axios";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

export const initializeAppTC = createAsyncThunk('app/initializeAppTC', async (param, {dispatch}) => {
    const res = await authAPI.me()
    try {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC({isLoggedIn: true}));
        } else {
            handleServerAppError(dispatch, res.data)
        }
    } catch (error: AxiosError | any) {
        handleServerNetworkError(dispatch, error.message)
    }
})


const slice = createSlice({
    name: 'app',
    initialState: {
        status: 'loading' as RequestStatusType,
        error: null as string | null,
        isInitialized: false
    },
    reducers: {
        setAppStatusAC(state, action: PayloadAction<{ status: RequestStatusType }>) {
            state.status = action.payload.status
        },
        setAppErrorAC(state, action: PayloadAction<{ error: string | null }>) {
            state.error = action.payload.error
        }
    },
    extraReducers: builder => {
        builder.addCase(initializeAppTC.fulfilled, (state) => {
            state.isInitialized = true
        })
    }
})


export type AppActionsType = SetAppStatusType | SetAppErrorType
export type InitialStateType = ReturnType<typeof slice.getInitialState>
type SetAppStatusType = ReturnType<typeof setAppStatusAC>
type SetAppErrorType = ReturnType<typeof setAppErrorAC>

export const appReducer = slice.reducer
export const {setAppStatusAC, setAppErrorAC} = slice.actions


