import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
    palette: {
        type: 'light',
        primary: {
            // light: will be calculated from palette.primary.main,
            main: '#ffcc00',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contrast with palette.primary.main
        },
        // error: will use the default color
    },
    overrides: {
        MuiInputBase: {
            root: {
                'font-size': '1.3rem',
            }
        },
    },
    typography: {
        useNextVariants: true,
    }
});