import React, {useCallback, useEffect, useState} from 'react'
import './App.css'
import {TodolistsList} from '../features/TodolistsList/TodolistsList'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import LinearProgress from "@mui/material/LinearProgress";
import {useAppSelector} from "./store";
import {initializeAppTC, RequestStatusType} from "./app-reducer";
import {ErrorSnackbar} from "../components/ErrorSnackbar/ErrorSnackbar";
import {Navigate, Route, Routes} from 'react-router-dom';
import {Login} from "../features/login/Login";
import {useDispatch} from "react-redux";
import {CircularProgress, PaletteMode, ThemeProvider} from "@mui/material";
import {logoutTC} from "../features/login/auth-reducer";
import {selectIsInitialized, selectStatus} from './selectors';
import {authSelectors} from "../features/login";
import {createTheme} from "@material-ui/core/styles";
import {getDesignTokens} from '../utils/theme';
import {MaterialUISwitch} from '../utils/switchMode';
import {CssBaseline} from "@material-ui/core";


type PropsType = {
    demo?: boolean
}

function App({demo = false}: PropsType) {
    const [mode, setMode] = useState<PaletteMode>('light');
    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode: PaletteMode) =>
                    prevMode === 'light' ? 'dark' : 'light',
                );
            },
        }),
        [],
    );
    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    const status = useAppSelector<RequestStatusType>(selectStatus)
    const isInitialized = useAppSelector<boolean>(selectIsInitialized)
    const isLoggedIn = useAppSelector<boolean>(authSelectors.selectIsLoggedIn)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(initializeAppTC())
    }, [])

    const logoutHandler = useCallback(() => {
        dispatch(logoutTC())
    }, [dispatch])

    if (!isInitialized) {
        return <div
            style={{position: 'fixed', top: '30%', textAlign: 'center', width: '100%'}}>
            <CircularProgress/>
        </div>
    }
    return (
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="App">
                    <AppBar position="static">
                        <Toolbar style={{justifyContent: "space-between"}}>
                            <MaterialUISwitch   onChange={(e) => colorMode.toggleColorMode()}/>
                            <Typography variant="h6">
                                To do Lists
                            </Typography>
                            {isLoggedIn &&
                                <Button onClick={logoutHandler} color="inherit" variant={"outlined"}>Log out</Button>}
                        </Toolbar>
                    </AppBar>
                    {status === 'loading' && <LinearProgress color="secondary"/>}
                    <Container fixed>
                        <Routes>
                            <Route path={'/'} element={<TodolistsList demo={demo}/>}/>
                            <Route path={'/login'} element={<Login/>}/>
                            <Route path={'/404'} element={<h1 style={{textAlign: 'center'}}>404: NOT FOUND</h1>}/>
                            <Route path={'*'} element={<Navigate to={'/404'}/>}/>
                        </Routes>
                    </Container>
                    <ErrorSnackbar/>
                </div>
            </ThemeProvider>
    )
}

export default App
