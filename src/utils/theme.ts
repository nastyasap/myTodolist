import {PaletteMode} from "@mui/material";
import {amber, brown, deepOrange, grey, lime, purple} from "@mui/material/colors";

export const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // palette values for light mode
                primary: lime,
                secondary: purple,
                divider: lime[500],
                text: {
                    primary: grey[900],
                    secondary: grey[800],
                },
            }
            : {
                // palette values for dark mode
                primary: deepOrange,
                divider: deepOrange[700],
                background: {
                    default: brown[800],
                    paper: brown[900],
                },
                text: {
                    primary: '#fff',
                    secondary: grey[500],
                },
                mode: 'dark'
            }),
    },
});
