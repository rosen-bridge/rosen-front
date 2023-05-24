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
                            light: "#f7f7f7",
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
                            default: "#f7f7f7e6",
                            paper: "#fff",
                        }
                    }
                    : {
                        primary: {
                            light: "#1a2029",
                            main: "#4a75a5",
                            dark: "#9cbdd9",
                            contrastText: "#12212f",
                        },
                        secondary: {
                            light: "#12212f",
                            main: "#4a75a5",
                            dark: "#9cbdd9",
                            contrastText: "#12212f",
                        },
                        background: {
                            default: "#2f3a48",
                            paper: "#28313F",
                        },
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
                    color: theme.palette.primary.dark,
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
            shadows: [
                'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
                'rgba(0, 0, 0, 0.35) 0px 25px 20px -20px, rgba(0, 0, 0, 0.05) 0px 0px 6px -1px',
            ],
            components: {
                MuiPaper: {
                    defaultProps: {
                        elevation: mode === "light" ? 1 : 0,
                    },
                    styleOverrides: {
                        root: {
                            backgroundImage: "none !important",
                        }
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
                    }
                },
                MuiLoadingButton: {
                    defaultProps: {
                        variant: "contained"
                    }
                },
                MuiTextField: {
                    defaultProps: {
                        variant: 'filled',
                        fullWidth: true
                    }
                },
                MuiFilledInput: {
                    defaultProps: {
                        disableUnderline: true,
                    },
                    styleOverrides: {
                        root: {
                            borderRadius: theme.shape.borderRadius,
                            backgroundColor: theme.palette.background.paper,
                            "&.Mui-disabled": {
                                backgroundColor: theme.palette.background.paper,
                            }
                        },
                    },
                },
                MuiMenu: {
                    styleOverrides: {
                        paper: {
                            backgroundImage: "none !important",
                            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
                        }
                    }
                },
                MuiMenuItem: {
                    styleOverrides: {
                        gutters: {
                            padding: theme.spacing(1,1.5)
                        }
                    }
                },
                MuiListItemAvatar: {
                    styleOverrides: {
                        root: {
                            minWidth: 36,
                        }
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
                            "& tr.divider td": {
                                paddingTop: theme.spacing(2),
                            },
                            "& tr.divider:not(:first-of-type)": {
                                borderTop: `1px solid ${theme.palette.divider}`,
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
                                    padding: theme.spacing(1,2)
                                },
                                "&:first-of-type": {
                                    color: theme.palette.text.secondary
                                }
                            },
                        },
                        head: {
                            padding: theme.spacing(1,2),
                            backgroundColor: mode === "light" ? theme.palette.secondary.dark : theme.palette.primary.dark,
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
