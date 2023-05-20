import React, {useEffect, useRef, useState} from "react";
import {Avatar, Box, styled, Typography, useTheme} from "@mui/material";
import {Outlet} from "react-router-dom";
import Navigation from "./Navigation";
import Toolbar from "./Toolbar";
import {cx} from "../utils/utils";

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
    transition: "0.2s",
    fontSize: "0.75rem",
    "& .MuiAvatar-root": {
        width: 64,
        height: 64,
        transition: "0.2s",
    },
    "& .toolbar": {
        marginLeft: "auto",
        "& .MuiIconButton-root": {
            color: theme.palette.primary.contrastText
        }
    },
    [theme.breakpoints.down("tablet")]: {
        padding: theme.spacing(2,1),
        fontSize: "1.2rem",
        flexBasis: 64,
        flexDirection: "row",
        "& .MuiAvatar-root": {
            width: 42,
            height: 42,
        },
        "&.shrunk": {
            padding: theme.spacing(1,1),
            fontSize: "1rem",
            "& .MuiAvatar-root": {
                width: 34,
                height: 34,
            }
        }
    },
    [theme.breakpoints.up("tablet")]: {
        "& .toolbar": {
            display: "none"
        }
    },
}))

const Main = styled(Box)(() => ({
    flexGrow: 1,
    overflowY: "auto",
}))

const Brand = styled(Typography)(({theme}) => ({
    color: theme.palette.mode === "light" ? "#e5e5e5" : "#ff9b03",
    textTransform: "uppercase",
    textAlign: "center",
    margin: theme.spacing(1),
    lineHeight: 1.2,
    fontSize: "inherit",
    transition: "0.1s",
    [theme.breakpoints.up("tablet")]: {
        "& b": {
            fontSize: "108%"
        }
    }
}))

export default function AppLayout() {
    const main = useRef(null)
    const theme = useTheme()
    const [isShrunk, setShrunk] = useState(false);

    useEffect(() => {
        const element = main.current;
        const handler = () => {
            setShrunk((isShrunk) => {
                if (!isShrunk && element.scrollTop > 20) {
                    return true;
                }
                if (isShrunk && element.scrollTop < 4) {
                    return false;
                }
                return isShrunk;
            });
        };
        element.addEventListener("scroll", handler);
        return () => element.removeEventListener("scroll", handler);
    }, []);

    return (
        <Root>
            <Appbar className={cx(isShrunk && "shrunk")}>
                <Avatar src={`/rosen-${theme.palette.mode}.png`}/>
                <Brand><b>Rosen</b> Bridge</Brand>
                <Navigation/>
                <Toolbar/>
            </Appbar>
            <Main component="main" ref={main}>
                <Outlet/>
            </Main>
        </Root>
    )
}
