import React, { useState, useEffect } from "react";
import { Box, Button, Card, Divider, Grid, Stack, Typography } from "@mui/material";
import PageBox from "layouts/PageBox";
import InputSelect from "components/InputSelect";
import useObject from "reducers/useObject";
import InputText from "components/InputText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
    connectNautilus,
    checkNautilusConnected,
    getBalance,
    getUtxos,
    getChangeAddress
} from "../../wallets";
import token_maps from "../../configs/tokenmap.json";
import { hex2a } from "../../utils";

const updateStatus = (setWalletConnected) => {
    checkNautilusConnected().then((connected) => {
        setWalletConnected(connected);
    });
};

export function ValueDisplay({ title, value, unit, color = "primary" }) {
    return (
        <Box display="flex">
            <Typography className="title" sx={{ flexGrow: 1 }}>
                {title}
            </Typography>
            <Typography component="div" color={color}>
                <b>{value}</b>
            </Typography>
            <Typography component="div" color="textSecondary" sx={{ ml: 1 }}>
                {unit}
            </Typography>
        </Box>
    );
}

export default function Bridge() {
    const theme = useTheme();
    const mdUp = useMediaQuery(theme.breakpoints.up("md"));
    const form = useObject();
    const [walletConnected, setWalletConnected] = useState(false);
    const [ergoTokens, setErgoTokens] = useState([]);
    const [cardanoTokens, setCardanoTokens] = useState([]);
    const [balance, setBalance] = useState(0);

    const sourceChains = [
        { id: "ERG", label: "Ergo", icon: "ERG.svg" },
        { id: "ADA", label: "Cardano", icon: "ADA.svg" }
    ];

    useEffect(() => {
        const { data } = form;
        if (!data["source"]) {
            setErgoTokens(
                token_maps.tokens?.map((item) => {
                    const ergoItem = item.ergo;
                    return {
                        id: ergoItem.tokenID,
                        label: ergoItem.tokenName,
                        icon: "ERG.svg",
                        min: 10
                    };
                })
            );
            setCardanoTokens(
                token_maps.tokens?.map((item) => {
                    const cardanoItem = item.cardano;
                    return {
                        id: cardanoItem.fingerprint,
                        label: hex2a(cardanoItem.assetID),
                        icon: "ADA.svg",
                        min: 20
                    };
                })
            );
        }
        if (data["token"] && walletConnected) {
            getBalance(data.token?.id).then((balance) => setBalance(balance));
        }
    }, [form.data, walletConnected]);

    async function handle_submit() {
        const ergSource = form.data["source"].id === "ERG";
        if (!walletConnected) {
            if (ergSource) {
                await connectNautilus();
                updateStatus(setWalletConnected);
            }
        } else {
            if (ergSource) {
                //TODO: Check amount
                const uTxos = await getUtxos(form.data["amount"], form.data.token.id);
                const changeAddress = await getChangeAddress();
                console.log(changeAddress);
                console.log(uTxos);
            }
        }
    }

    return (
        <PageBox
            title="Bridge"
            subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
            maxWidth="md"
        >
            <Card variant="outlined" sx={{ mb: 5, bgcolor: "background.content" }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    divider={<Divider orientation={mdUp ? "vertical" : "horizontal"} flexItem />}
                    alignItems="flex-end"
                >
                    <Grid container spacing={2} p={2}>
                        <Grid item xs={12} sm={6}>
                            <InputSelect
                                name="source"
                                label="Source"
                                options={sourceChains}
                                form={form}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <InputSelect
                                name="token"
                                label="From Token"
                                options={
                                    form.data.source?.id === "ERG" ? ergoTokens : cardanoTokens
                                }
                                disabled={!form.data["source"]}
                                form={form}
                            />
                        </Grid>
                        <Grid item xs={12}></Grid>
                        <Grid item xs={12} sm={6}>
                            <InputSelect
                                name="target"
                                label="Target"
                                options={sourceChains}
                                disabled={!form.data["source"] || !form.data["token"]}
                                form={form}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <InputSelect
                                name="targetToken"
                                label="To Token"
                                options={
                                    form.data.target?.id === "ERG" ? ergoTokens : cardanoTokens
                                }
                                disabled={!form.data["target"]}
                                form={form}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <InputText
                                type="number"
                                name="amount"
                                label="Amount"
                                placeholder="0.00"
                                helperText={
                                    form.data["token"] &&
                                    `Minimum ${form.data["token"]?.min} ${form.data["token"]?.id} `
                                }
                                error={
                                    form.data["token"] &&
                                    form.data["token"].min > form.data["amount"]
                                }
                                form={form}
                                sx={{ input: { fontSize: "2rem" } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <InputText name="address" label="Address" form={form} />
                        </Grid>
                    </Grid>

                    <Stack
                        spacing={2}
                        p={2}
                        sx={{
                            minWidth: { xs: "100%", md: 320 },
                            alignSelf: "stretch",
                            justifyContent: "flex-end",
                            bgcolor: "background.header"
                        }}
                    >
                        <ValueDisplay
                            title="Wallet Balance"
                            value={balance}
                            unit={form.data.token?.label || "ERG"}
                        />
                        <ValueDisplay
                            title="Bridge Fee"
                            value={0.005 * form.data["amount"] || 0}
                            unit={form.data.token?.label || "ERG"}
                        />
                        <ValueDisplay
                            title="Transaction Fee"
                            value={0.01 * form.data["amount"] || 0}
                            unit={form.data.token?.label || "ERG"}
                        />
                        <Divider />
                        <ValueDisplay
                            title="You will receive"
                            value={0.985 * form.data["amount"] || 0}
                            unit={form.data.targetToken?.label || "ERG"}
                            color="secondary.dark"
                        />
                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                onClick={handle_submit}
                                sx={{ mt: 2 }}
                            >
                                {walletConnected ? "Transfer" : "Connect Wallet"}
                            </Button>
                        </Box>
                    </Stack>
                </Stack>
            </Card>
        </PageBox>
    );
}
