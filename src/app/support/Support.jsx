import React from "react"
import { Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import Faqs from "./Faqs";
import Contact from "./Contact";
import PageLayout from "layouts/PageLayout";

const Heading = styled((props) => (
    <Typography variant="h3" {...props}/>
))(({ theme }) => ({
    margin: theme.spacing(6,2,2,2),
    paddingBottom: theme.spacing(1),
    position: "relative",
    color: theme.palette.secondary.main,
    letterSpacing: 2,
    '&:first-of-type': {
        marginTop: 0
    },
    '&:after': {
        content: `""`,
        width: 90,
        height: 4,
        backgroundColor: theme.palette.secondary.main,
        position: "absolute",
        left: 0,
        bottom: 0
    }
}));

export default function Support() {
    return (
        <PageLayout title="Support">
            <Heading>FAQs</Heading>
            <Faqs/>
            <Heading>Contact Us</Heading>
            <Contact/>
        </PageLayout>
    )
}
