import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Stack, SvgIcon } from "@mui/material";
import { styled } from "@mui/material/styles";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import UndoIcon from "@mui/icons-material/Undo";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import RepeatIcon from "@mui/icons-material/Repeat";

const NavItemLink = styled(Link)(
    ({ theme }) => `
    color: ${theme.palette.navbar.text};
    font-size: small;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 6px;
    border: 2px solid ${theme.palette.navbar.background};
    border-radius: 6px;
    margin: 2px 0;
    transition: 300ms;
    :hover {
        color: ${theme.palette.navbar.textHover};
        border-color: ${theme.palette.navbar.textHover};
        background-color: ${theme.palette.navbar.textHover}1f;
    }
    :link {
        text-decoration: none;
    }
    &.active {
        color: ${theme.palette.secondary.main};
        border-color: ${theme.palette.secondary.main};
        background-color: ${theme.palette.secondary.light.textHover}1f;
    }
    .circle {
        margin: 4px 0 6px;
        border: 2px solid;
        border-radius: 36px;
        width: 36px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: ${theme.palette.navbar.textHover}0f;
    }
`
);

function NavItem({ path, label, icon }) {
    const location = useLocation();
    const className = location.pathname === path ? "active" : "";
    return (
        <NavItemLink to={path} className={className}>
            <Box className="circle">
                <SvgIcon component={icon} />
            </Box>
            {label}
        </NavItemLink>
    );
}

export const items = [
    {
        path: "/bridge",
        label: "Bridge",
        icon: UndoIcon
    },
    {
        path: "/assets",
        label: "Assets",
        icon: HomeRepairServiceIcon
    }
    // {
    //     path: "/transactions",
    //     label: "Transactions",
    //     icon: RepeatIcon
    // },
    // {
    //     path: "/support",
    //     label: "Support",
    //     icon: SupportAgentIcon
    // }
    // {
    //     path: "/dashboard",
    //     label: "Dashboard",
    //     icon: WidgetsRoundedIcon
    // }
];

export default function AppNav() {
    return (
        <Stack>
            {items.map((item) => (
                <NavItem key={item.path} {...item} />
            ))}
        </Stack>
    );
}
