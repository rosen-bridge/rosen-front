import React, {useContext} from "react";
import {Box, IconButton, Stack, useTheme} from "@mui/material";
import * as Unicons from '@iconscout/react-unicons';
import {ColorModeContext} from "./AppTheme";

export default function Toolbar() {
    const theme = useTheme()
    const colorMode = useContext(ColorModeContext);

    return (
        <Box className="toolbar">
            <Stack direction="row">
                <IconButton onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === "light" ? <Unicons.UilMoon/> : <Unicons.UilSun/> }
                </IconButton>
            </Stack>
        </Box>
    )
}
