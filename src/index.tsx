import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './app/App';
import {Provider} from 'react-redux';
import {store} from './app/store';
import {HashRouter} from "react-router-dom";
import {CssBaseline} from "@material-ui/core";
import {createTheme, ThemeProvider} from "@material-ui/core/styles";

const theme = createTheme({
        // palette: {
        //     primary: {
        //         main: '#7c4dff',
        //     },
        //     secondary: {
        //         main: '#00bfa5',
        //     },
        //     type: 'dark'
        // },
    }
)

ReactDOM.render(
    <HashRouter>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Provider store={store}>
                <App/>
            </Provider>
        </ThemeProvider>
    </HashRouter>,
    document.getElementById('root')
)
;

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
