import React from "react";
import {useLocation} from "react-router-dom";
import {Box, Button, styled, useMediaQuery, useTheme} from "@mui/material";
import {ROUTES} from "utils/routes";
import * as Unicons from "@iconscout/react-unicons";
import {cx} from "utils/utils";

const Root = styled(Box)(({theme}) => ({
    position: "relative",
    margin: theme.spacing("auto",0),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),

    [theme.breakpoints.down("tablet")]: {
        position: "fixed",
        width: `calc(100% - ${theme.spacing(2)})`,
        bottom: 0,
        left: 0,
        margin: theme.spacing(1),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.default,
        flexDirection: "row",
        gap: theme.spacing(0.5),
        zIndex: 1000,
    }
}))

const NavButtonBase = styled(Button)(({theme}) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    fontSize: "x-small",
    color: theme.palette.primary.contrastText,
    opacity: 0.8,
    "&:hover": {
        opacity: 1,
    },
    "& .MuiButton-startIcon" : {
        backgroundColor: "#00000033",
        padding: theme.spacing(1),
        margin: 0,
        borderRadius: theme.shape.borderRadius,
    },
    "&.active": {
        opacity: 1,
        "& .MuiButton-startIcon" : {
            color: "#28475c",
            backgroundColor: theme.palette.mode === "light" ? "#fff" : "#cbdaee",
        },
    },
    [theme.breakpoints.down("tablet")]: {
        color: theme.palette.mode === "light" ? theme.palette.primary.dark : theme.palette.primary.light,
        fontSize: "xx-small",
        flexBasis: "20%",
        "& .MuiButton-startIcon" : {
            color: theme.palette.mode === "light" ? theme.palette.primary.dark : theme.palette.primary.light,
            backgroundColor: "transparent",
            padding: 0,
        },
        "&.active" : {
            color: theme.palette.primary.main,
            "& .MuiButton-startIcon" : {
                color: theme.palette.primary.main,
                backgroundColor: "transparent",
            },
        },
    }
}))

const NavButton = ({label, routeName, icon}) => {
    const location = useLocation()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("tablet"))
    const isActive = location.pathname === ROUTES[routeName]
    return (
        <NavButtonBase
            href={"/#"+ROUTES[routeName]}
            className={cx(isActive && "active")}
            startIcon={icon}
            variant="text"
        >
            {isMobile && isActive ? "⬤" : label}
        </NavButtonBase>
    )
}

export default function Navigation() {

    return (
        <Root>
            <NavButton label="Bridge" routeName="Bridge" icon={<Unicons.UilArchway />}/>
            <NavButton label="Assets" routeName="Assets" icon={<Unicons.UilBitcoinCircle />}/>
            <NavButton label="Transactions" routeName="Transactions" icon={<Unicons.UilExchange />}/>
            <NavButton label="Support" routeName="Support" icon={<Unicons.UilHeadphones />}/>
            <NavButton label="Dashboard" routeName="Dashboard" icon={<Unicons.UilDashboard />}/>
        </Root>
    )
}
