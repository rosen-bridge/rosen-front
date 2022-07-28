import React from "react";
import {Button, Card, Grid, Stack, Typography} from "@mui/material";
import InputText from "components/InputText";
import useObject from "reducers/useObject";

export default function Contact() {
    const form = useObject()

    function handle_submit() {
        console.log(form.data)
    }

    return (
        <Grid container>
            <Grid item xs={12} md={6} p={5}>
                <Typography variant="h4" gutterBottom>Need specific help?</Typography>
                <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card sx={{border: "3px solid", borderColor: "secondary.dark", pb: 2, pl: 2, overflow: "visible", marginRight: "32px", backgroundColor: "#0000001a"}}>
                    <Card sx={{p: 2, marginTop: "-32px", marginRight: "-32px"}}>
                        <Stack spacing={2}>
                            <InputText
                                name="name"
                                label="Name"
                                form={form}
                            />
                            <InputText
                                name="email"
                                label="Email"
                                form={form}
                            />
                            <InputText
                                name="message"
                                label="Message"
                                type="textarea"
                                form={form}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                onClick={handle_submit}
                            >Submit</Button>
                        </Stack>
                    </Card>
                </Card>
            </Grid>
        </Grid>
    )
}
