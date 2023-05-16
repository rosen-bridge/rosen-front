import React from "react";
import PageLayout from "layouts/PageLayout";
import {Box, styled, Typography} from "@mui/material";

const Container = styled(Box)({
    width: "100%",
    height: "calc(100vh - 200px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
})

export default function NotFound() {
    return (
        <PageLayout>
            <Container>
                <Typography fontSize="8rem" fontWeight="bold">404</Typography>
                <Typography fontSize="4rem" fontWeight="bold" color="textSecondary" sx={{paddingLeft: "5rem", marginTop: "-6rem"}}>error</Typography>
                <Typography fontSize="1.95rem" color="textSecondary" sx={{marginTop: "-2rem"}}>Page not found</Typography>
            </Container>
        </PageLayout>
    )
}
