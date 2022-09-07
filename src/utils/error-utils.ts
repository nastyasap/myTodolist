import {AppActionsType, setAppErrorAC, setAppStatusAC} from "../app/app-reducer";
import {Dispatch} from "redux";
import {ResponseType} from "../api/todolists-api";

export const handleServerNetworkError = (dispatch: Dispatch<AppActionsType>, message: string) => {
    dispatch(setAppErrorAC({error: message}))
    dispatch(setAppStatusAC({status: "failed"}))
}

export const handleServerAppError = <T>(dispatch: Dispatch, data: ResponseType<T>) => {
    dispatch(setAppErrorAC(data.messages.length ? {error: data.messages[0]} : {error: 'Some error occurred'}))
    dispatch(setAppStatusAC({status: 'failed'}))
}
