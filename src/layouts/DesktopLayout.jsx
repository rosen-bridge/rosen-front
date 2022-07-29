import React from "react";
import {Box, Button} from "@mui/material";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import AppNav from "./AppNav";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import {Outlet} from "react-router-dom";
import {styled, useTheme} from "@mui/material/styles";

const RootBox = styled(Box) (({ theme }) => `
    background-color: ${theme.palette.background.root};
    height: 100vh;
    display: flex;
    padding: 24px 24px 0 0;
`)

const MainBox = styled(Box) (() => `
    height: 100%;
    flex-grow: 1;
    border-radius: 24px 24px 0 0;
    overflow: auto;
`)

const SideBox = styled(Box) (() => `
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px 12px;
`)

const Brand = styled(Box) (({ theme }) => `
    color: ${theme.palette.secondary.dark};
    font-size: small;
`)

const CircleButton = styled(Button) (({ theme }) => `
    color: ${theme.palette.navbar.text};
    min-width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 40px;
    :hover {
        color: ${theme.palette.navbar.textHover};
        background-color: #ffffff1f; 
    }
`)

export default function DesktopLayout({toggle_mode}) {
    const theme = useTheme();
    return (
        <RootBox>
            <SideBox>
                <Box textAlign="center">
                    <DiamondRoundedIcon color="secondary" fontSize="large"/>
                    <Brand>Rosen Bridge</Brand>
                </Box>
                <AppNav/>
                <Box textAlign="center">
                    <CircleButton onClick={toggle_mode}>
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </CircleButton>
                </Box>
            </SideBox>

            <MainBox>
                <Outlet/>
            </MainBox>
        </RootBox>
    )
}
