import React from "react";
import {Box, styled, Typography} from "@mui/material";
import Toolbar from "./Toolbar";

const Root = styled(Box)(({theme}) => ({
    minHeight: "100%",
    backgroundColor: theme.palette.background.default,
    borderTopLeftRadius: theme.shape.borderRadius*2,
    borderBottomLeftRadius: theme.shape.borderRadius*2,
    paddingTop: theme.shape.borderRadius,
    paddingBottom: theme.shape.borderRadius*4,
    paddingLeft: theme.shape.borderRadius*2,
    paddingRight: theme.shape.borderRadius*2,

    [theme.breakpoints.down("tablet")]: {
        backgroundColor: theme.palette.background.paper,
        borderTopRightRadius: theme.shape.borderRadius*2,
        borderBottomLeftRadius: 0,
        paddingBottom: theme.spacing(10),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    }
}))

const Header = styled(Box)(({theme}) => ({
    display: "flex",
    flexDirection: "row",
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2),

    [theme.breakpoints.down("tablet")]: {
        "& .toolbar": {
            display: "none"
        }
    }
}))

export default function PageLayout({title, subtitle, ...restProps}) {
    return (
        <Root>
            <Header>
                <Box flexGrow={1}>
                    <Typography variant="h1" textAlign="center" sx={{mb: 1}}>{title}</Typography>
                    <Typography color="textSecondary" textAlign="center">{subtitle}</Typography>
                </Box>
                <Toolbar/>
            </Header>
            {restProps.children}
        </Root>
    )
}
