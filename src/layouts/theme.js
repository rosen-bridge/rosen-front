import createTheme from "@mui/material/styles/createTheme";

export function create_theme(mode) {
    return () => createTheme({
        shape: {
            borderRadius: 16,
        },
        mixins: {
            toolbar: {
                minHeight: 48
            },
            navbar: {
                width: 240,
                compactWidth: 50,
            }
        },
        palette: {
            mode,
            primary: {
                light: "#d3e1f0",
                main: "#396da3",
                dark: "#25476a",
                contrastText: '#fff',
            },
            secondary: {
                light: "#ffcd38",
                main: "#ffc107",
                dark: "#b28704",
                contrastText: "#1A1A1A",
            },
            ...(mode === "light" ? {
                background: {
                    root: "#1A1A1A",
                    content: "#fff",
                    paper: "#fff",
                    header: "#E1E1E1",
                },
            } : {
                background: {
                    root: "#0D1721",
                    content: "#1F2937",
                    paper: "#1F2937",
                    header: "#253041",
                },
            }),
            navbar: {
                background: mode === "light" ? "#1A1A1A" : "#0D1721",
                text: "#858585",
                textHover: "#d7d7d7",
            },
        },
        typography: {
            h1: {
                fontSize: "2rem",
                fontWeight: 700
            },
            h2: {
                fontSize: "1rem",
            },
            h3: {
                fontSize: "1.5rem",
            },
            h4: {
                fontSize: "1.2rem",
            }
        },
        components: {
            MuiOutlinedInput: {
                styleOverrides: {
                    notchedOutline: {
                        borderWidth: 2
                    }
                }
            },
            MuiPaper: {
                defaultProps: {
                    variant: "outlined"
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "inherit"
                    }
                }
            }
        }
    })
}
