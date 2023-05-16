import React, {useMemo} from "react";
import {Avatar, Box, styled, Typography, useMediaQuery, useTheme} from "@mui/material";
import {Outlet} from "react-router-dom";
import Navigation from "./Navigation";
import Toolbar from "./Toolbar";

const Root = styled(Box)(({theme}) => ({
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "row",
    colorScheme: theme.palette.mode,
    "& .ps__rail-x:hover": {
        backgroundColor: theme.palette.mode === "light" ? "#eee" : "#0a1729",
    },
    backgroundColor: "#112641",
    backgroundImage: theme.palette.mode === "light" ? `linear-gradient(180deg, #FC7B41 0%, #E2844A 30%, #52617E 70%, #164B7D 100%)` : "none",
    [theme.breakpoints.down("tablet")]: {
        flexDirection: "column",
        backgroundColor: "#0a1729",
        backgroundImage: theme.palette.mode === "light" ? `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.dark} 100%)` : "none",
    }
}))

const Appbar = styled(Box)(({theme}) => ({
    padding: theme.spacing(2),
    flexBasis: 112,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    [theme.breakpoints.down("tablet")]: {
        padding: theme.spacing(1),
        flexBasis: 64,
        flexDirection: "row",
    },
    [theme.breakpoints.up("tablet")]: {
        "& .toolbar": {
            display: "none"
        }
    },
    "& .toolbar": {
        marginLeft: "auto",
        "& .MuiIconButton-root": {
            color: theme.palette.primary.contrastText
        }
    }
}))

const Main = styled(Box)(({theme}) => ({
    flexGrow: 1,
    overflowY: "auto",
}))

const Brand = styled(Typography)(({theme}) => ({
    color: theme.palette.mode === "light" ? "#e5e5e5" : "#ff9b03",
    textTransform: "uppercase",
    textAlign: "center",
    margin: theme.spacing(1),
    lineHeight: 1.2,
    [theme.breakpoints.up("tablet")]: {
        fontSize: "0.75rem",
        "& b": {
            fontSize: "108%"
        }
    }
}))

export default function AppLayout() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("tablet"))
    const sxSize = useMemo(() => {
        const size = isMobile ? 36 : 64
        return {width: size, height: size}
    })
    return (
        <Root>
            <Appbar>
                <Avatar src={`/rosen-${theme.palette.mode}.png`} sx={sxSize}/>
                <Brand><b>Rosen</b> Bridge</Brand>
                <Navigation/>
                <Toolbar/>
            </Appbar>
            <Main component="main">
                <Outlet/>
            </Main>
        </Root>
    )
}
