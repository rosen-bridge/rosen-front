import React from "react";
import {Box, Button} from "@mui/material";
import {Outlet} from "react-router-dom";
import {styled} from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import AppNav from "./AppNav";
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import {create_theme} from "./theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";


export default function AppLayout() {
    const [mode, setMode] = React.useState('light');
    const toggle_mode = () => setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    const theme = React.useMemo(create_theme(mode),[mode])
    const desktop = useMediaQuery(theme.breakpoints.up('sm'));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {desktop ? <DesktopLayout toggle_mode={toggle_mode} /> : <MobileLayout toggle_mode={toggle_mode} /> }
        </ThemeProvider>
    )
}
