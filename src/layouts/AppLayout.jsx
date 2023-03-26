import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { create_theme } from "./theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";

export default function AppLayout() {
    const [mode, setMode] = React.useState(localStorage.getItem("mode") || "dark");
    const toggle_mode = () => {
        const newMode = mode === "light" ? "dark" : "light";
        localStorage.setItem("mode", newMode);
        setMode(newMode);
    };
    const theme = React.useMemo(create_theme(mode), [mode]);
    const desktop = useMediaQuery(theme.breakpoints.up("sm"));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {desktop ? (
                <DesktopLayout toggle_mode={toggle_mode} />
            ) : (
                <MobileLayout toggle_mode={toggle_mode} />
            )}
        </ThemeProvider>
    );
}
