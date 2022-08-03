import React from "react";
import {styled} from "@mui/material/styles";
import {Box, Container, Typography} from "@mui/material";
import PerfectScrollbar from 'react-perfect-scrollbar'

const ContainerBox = styled(PerfectScrollbar) (({ theme }) => `
    background-color: ${theme.palette.background.content};
    height: 100%;
    /*flex-grow: 1;
    border-radius: 24px 24px 0 0;*/
`)

const HeaderBox = styled(Box) (({ theme }) => `
    background-color: ${theme.palette.background.header};
    padding: 2rem 0 0;
    h1 {
        text-align: center;
        padding: ${theme.spacing(0,2,2,2)};
    }
    h2 {
        text-align: center;
        padding: ${theme.spacing(0,2,2,2)};
    }
`)

export default function PageBox({title, subtitle, maxWidth="md", header, indent, ...restProps}) {
    return (
        <ContainerBox options={{suppressScrollX: true, useBothWheelAxes:false}}>
            <HeaderBox sx={{pb: `${indent}px`}}>
                <Container maxWidth={maxWidth}>
                    <Typography variant="h1">{title}</Typography>
                    {subtitle && <Typography variant="h2" color="textSecondary" >{subtitle}</Typography>}
                    {header}
                </Container>
            </HeaderBox>
            <Container maxWidth={maxWidth} sx={{pb: 5, py: indent?0:5, mt: `-${indent}px`}}>
                {restProps.children}
            </Container>
        </ContainerBox>
    )
}
