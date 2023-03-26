import React, { useState } from "react";
import { Box, Button, SvgIcon } from "@mui/material";
import { items } from "./AppNav";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { Outlet, useLocation } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const RootBox = styled(Box)(
    ({ theme }) => `
    background-color: ${theme.palette.background.root};
    height: 100vh;
    display: flex;
    flex-direction: column;
`
);

const MainBox = styled(Box)(
    () => `
    flex-grow: 1;
    overflow: auto;
`
);

const HeaderBox = styled(Box)(
    ({ theme }) => `
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px 8px;
`
);

const NavBox = styled(Box)(
    ({ theme }) => `
    .MuiTab-root {
        color: ${theme.palette.navbar.textHover};
    }
    .Mui-selected {
        color: ${theme.palette.secondary.main};
    }
`
);

const Brand = styled(Box)(
    ({ theme }) => `
    color: ${theme.palette.secondary.dark};
    font-size: large;
    flex-grow: 1;
    margin: 0 12px;
`
);

const CircleButton = styled(Button)(
    ({ theme }) => `
    color: ${theme.palette.navbar.text};
    min-width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 40px;
    :hover {
        color: ${theme.palette.navbar.textHover};
        background-color: #ffffff1f; 
    }
`
);

const CircleBorder = styled(Box)(
    ({ theme }) => `
    margin-bottom: 12px;
    border: 2px solid;
    border-radius: 36px;
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.palette.navbar.textHover}0f;
`
);

function LinkTab({ label, path, icon, ...restProps }) {
    return (
        <Tab
            label={label}
            icon={
                <CircleBorder>
                    <SvgIcon component={icon} />
                </CircleBorder>
            }
            href={"#" + path}
            {...restProps}
        />
    );
}

export default function MobileLayout({ toggle_mode }) {
    const theme = useTheme();
    const location = useLocation();
    const [value, setValue] = useState(() =>
        items.findIndex((item) => item.path === location.pathname)
    );

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <RootBox>
            <HeaderBox style={{ display: "flex", justifyContent: "space-between" }}>
                <img
                    src={`/static/images/Rosen2.png`}
                    alt="Rosen"
                    style={{ width: "7em", height: "auto" }}
                />

                <Box textAlign="center">
                    <CircleButton onClick={toggle_mode}>
                        {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                    </CircleButton>
                </Box>
            </HeaderBox>
            <NavBox>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {items.map((item) => (
                        <LinkTab key={item.path} {...item} />
                    ))}
                </Tabs>
            </NavBox>

            <MainBox>
                <Outlet />
            </MainBox>
        </RootBox>
    );
}
