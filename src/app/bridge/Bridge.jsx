import React from "react"
import {
    Box,
    Button,
    Card,
    Divider,
    Grid,
    Stack,
    Typography,
    Alert,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import InputSelect from "components/InputSelect";
import InputText from "components/InputText";
import PageLayout from "layouts/PageLayout";
import useObject from "reducers/useObject";

export function ValueDisplay({title, value, unit, color="primary"}) {
    return (
        <Box display="flex">
            <Typography className="title" sx={{flexGrow: 1}}>{title}</Typography>
            <Typography component="div" color={color}><b>{value}</b></Typography>
            <Typography component="div" color="textSecondary" sx={{ml: 1}}>{unit}</Typography>
        </Box>
    )
}

export default function Bridge() {
    const theme = useTheme();
    const mdUp = useMediaQuery(theme.breakpoints.up('laptop'));
    const form = useObject()
    const sourceChains = [
        {id: "BTC", label: "Bitcoin", icon: "BTC.svg", min: 0.001},
        {id: "ETH", label: "Ethereum", icon: "ETH.svg", min: 1},
        {id: "ADA", label: "Cardano", icon: "ADA.svg", min: 10},
    ]

    function handle_submit() {
        console.log(form.data)
    }

    return (
        <PageLayout
            title="Rosen Bridge - Public Test"
            subtitle="Testing Rosen bridge on Ergo and Cardano main-nets using meme tokens"
        >
            <Alert severity="warning" variant="standard" sx={{mb:3}}>
                <b>Attention:</b> The bridge is in public test mode. Please use it at your own risk and only try with some amounts that you're willing to lose.
                At this stage, there is no guarantee of a successful transfer or a refund.
                Also, redeem your tokens during the test period, since the bridged assets are completely worthless.
            </Alert>
            <Card sx={{maxWidth: {tablet: 500, laptop: 800}, mx: "auto"}}>
                <Stack
                    direction={{ mobile: 'column', laptop: 'row' }}
                    divider={<Divider orientation={mdUp ? "vertical" : "horizontal"} flexItem />}
                    alignItems="flex-end"
                >
                    <Grid container spacing={2} p={2}>
                        <Grid item mobile={12} tablet={6}>
                            <InputSelect
                                name="source"
                                label="Source"
                                options={sourceChains}
                                form={form}
                            />
                        </Grid>
                        <Grid item mobile={12} tablet={6}>
                            <InputSelect
                                name="token"
                                label="From Token"
                                options={sourceChains}
                                disabled={!form.data["source"]}
                                form={form}
                            />
                        </Grid>
                        <Grid item mobile={12} tablet={6}>
                            <InputSelect
                                name="target"
                                label="Target"
                                options={sourceChains}
                                form={form}
                            />
                        </Grid>
                        <Grid item mobile={12} tablet={6}>
                            <InputSelect
                                name="targetToken"
                                label="To Token"
                                options={sourceChains}
                                disabled={!form.data["target"]}
                                form={form}
                            />
                        </Grid>
                        <Grid item mobile={12} >
                            <InputText
                                type="number"
                                name="amount"
                                label="Amount"
                                placeholder="0.00"
                                helperText={form.data["token"] && `Minimum ${form.data["token"]?.min} ${form.data["token"]?.id} `}
                                error={form.data["token"] && form.data["token"].min > form.data["amount"]}
                                form={form}
                                sx={{'input': {fontSize: '2rem'}}}
                            />
                        </Grid>
                        <Grid item mobile={12} >
                            <InputText
                                name="address"
                                label="Address"
                                form={form}
                            />
                        </Grid>
                    </Grid>

                    <Stack spacing={2} p={2} sx={{minWidth: {mobile: "100%", laptop: 320}, alignSelf: "stretch", justifyContent: "flex-end", bgcolor: "secondary.light"}}>
                        <ValueDisplay title="Bridge Fee" value={0.005*form.data["amount"]||0} unit="BTC"/>
                        <ValueDisplay title="Transaction Fee" value={0.01*form.data["amount"]||0} unit="BTC"/>
                        <Divider/>
                        <ValueDisplay title="You will receive" value={0.985*form.data["amount"]||0} unit="BTC" color="secondary.dark"/>
                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                onClick={handle_submit}
                                sx={{mt: 2}}
                            >Connect Wallet</Button>
                        </Box>

                    </Stack>
                </Stack>
            </Card>
        </PageLayout>
    )
}
