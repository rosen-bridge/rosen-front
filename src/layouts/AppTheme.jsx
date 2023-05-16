import React, {createContext, useMemo, useState} from "react";
import {ThemeProvider} from "@mui/material";
import createTheme from "@mui/material/styles/createTheme";
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function AppTheme(props) {
    const [mode, setMode] = useState("light");

    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
        },
    }),[]);

    const theme = useMemo(() => {
        let theme = createTheme({
            palette: {
                mode,
                ...(mode === 'light'
                    ? {
                        primary: {
                            light: "#b8e0ff",
                            main: "#18507F",
                            dark: "#10416b",
                            contrastText: "#fff",
                        },
                        secondary: {
                            light: "#fff6e2",
                            main: "#FC7B41",
                            dark: "#c65624",
                            contrastText: "#fff",
                        },
                        background: {
                            default: "#f7f7f7",
                            paper: "#fff",
                        }
                    }
                    : {
                        primary: {
                            light: "#aacbd2",
                            main: "#278EA5",
                            dark: "#125f70",
                            contrastText: "#fff",
                        },
                        secondary: {
                            light: "#071527",
                            main: "#ECB365",
                            dark: "#ecc48a",
                            contrastText: "#000",
                        },
                        background: {
                            default: "#1a2f4b",
                            paper: "#112641",
                        },
                        divider: "#1a2f4b",
                    })
            },
            shape: {
                borderRadius: 16,
            },
            breakpoints: {
                values: {
                    mobile: 0,
                    tablet: 640,
                    laptop: 1024,
                    desktop: 1200,
                },
            },
        })
        return createTheme(theme,{
            typography: {
                h1: {
                    fontSize: "1.7rem",
                    fontWeight: "bold",
                    color: mode === "light" ? theme.palette.primary.dark : theme.palette.primary.light
                },
                h2: {
                    fontSize: "1.5rem",
                },
                h3: {
                    fontSize: "1.5rem",
                },
                h4: {
                    fontSize: "1.2rem",
                },
                h5: {
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    textTransform: 'uppercase',
                },
                body: {
                    fontSize: "1rem",
                },
                body2: {
                    fontSize: "0.75rem",
                    color: theme.palette.text.secondary
                }
            },
            components: {
                MuiCard: {
                    defaultProps: {
                        variant: 'outlined'
                    }
                },
                MuiCardHeader: {
                    styleOverrides: {
                        root: {
                            padding: theme.spacing(1,2),
                            backgroundColor: theme.palette.secondary.dark,
                            color: "#fffd",
                            fontSize: "0.625rem",
                            lineHeight: "1rem",
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            whiteSpace: "noWrap",
                            letterSpacing: "1px",
                            opacity: 0.9,
                        },
                        title: {
                            fontSize: '1rem',
                            fontWeight: "bold",
                        },
                    },
                },
                MuiSnackbar: {
                    defaultProps: {
                        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                    }
                },
                MuiAlert: {
                    defaultProps: {
                        variant: 'filled'
                    },
                    styleOverrides: {
                        root: {
                            fontSize: '1rem',
                        },
                        standardWarning: {
                            border: `1px solid ${theme.palette.warning.light}`
                        }
                    }
                },
                MuiLoadingButton: {
                    defaultProps: {
                        variant: "contained"
                    }
                },
                MuiTextField: {
                    defaultProps: {
                        fullWidth: true
                    }
                },
                MuiPagination: {
                    defaultProps: {
                        color: "primary"
                    }
                },
                MuiTable: {
                    styleOverrides: {
                        root: {
                            tableLayout: "fixed",
                        }
                    }
                },
                MuiTableBody: {
                    styleOverrides: {
                        root: {
                            "& tr.divider:not(:first-of-type)": {
                                borderTop: `1px solid ${theme.palette.divider}`
                            },
                        },
                    }
                },
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            borderWidth: 0,
                            whiteSpace: "noWrap",
                            fontSize: "0.75rem",
                        },
                        body: {
                            [theme.breakpoints.down('tablet')]: {
                                verticalAlign: 'top',
                                "&:not(.MuiTableCell-paddingNone)": {
                                    padding: theme.spacing(1)
                                },
                                "&:first-of-type": {
                                    color: theme.palette.text.secondary
                                }
                            },
                        },
                        head: {
                            padding: theme.spacing(1,2),
                            backgroundColor: theme.palette.secondary.dark,
                            color: theme.palette.secondary.contrastText,
                            fontSize: "0.625rem",
                            lineHeight: "1rem",
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            whiteSpace: "noWrap",
                            letterSpacing: "1px",
                            opacity: 0.9,
                        },
                        footer: {
                            borderTop: `1px solid ${theme.palette.divider}`
                        }
                    }
                }
            }
        })
    }, [mode])

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {props.children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}
