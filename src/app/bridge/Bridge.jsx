import React, { useState, useEffect } from "react";
import { Box, Card, Divider, Grid, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PageBox from "layouts/PageBox";
import InputSelect from "components/InputSelect";
import useObject from "reducers/useObject";
import InputText from "components/InputText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Nautilus, Nami } from "../../wallets";
import token_maps from "../../configs/tokenmap.json";
import { hex2a, a2hex, generateTX, generateAdaTX, getAux } from "../../utils";

const nautilus = new Nautilus();
const nami = new Nami();

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
    const [sourceChain, setSourceChain] = useState("");
    const [balance, setBalance] = useState(0);
    const [ergoTokens, setErgoTokens] = useState([]);
    const [cardanoTokens, setCardanoTokens] = useState([]);
    const [targetChains, setTargetChains] = useState([]);
    const [targetTokens, setTargetTokens] = useState([]);
    const [transfering, setTransfering] = useState(false);

    const updateStatus = async () => {
        if (sourceChain === "ERG") {
            const connected = await nautilus.isConnected();
            setWalletConnected(connected);
        } else {
            const connected = await nami.isConnected();
            setWalletConnected(connected);
        }
    };

    const allChains = [
        { id: "ERG", label: "Ergo", icon: "ERG.svg", tokenmap_name: "ergo" },
        { id: "ADA", label: "Cardano", icon: "ADA.svg", tokenmap_name: "cardano" }
    ];

    const resetAll = () => {
        form.data.token = {};
        form.data.target = {};
        form.data.targetToken = {};
        form.data.amount = "";
        form.data.address = "";
        setTargetTokens([]);
        setWalletConnected(false);
        setBalance(0);
    };

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
                        policyId: cardanoItem.policyID,
                        icon: "ADA.svg",
                        min: 20
                    };
                })
            );
        } else {
            if (data["source"].id !== sourceChain) {
                resetAll();
                setSourceChain(data["source"].id);
                setTargetChains(allChains.filter((item) => item.id !== data["source"].id));
            }
        }
    }, [form.data["source"]]);

    useEffect(() => {
        const { data } = form;
        if (data["source"] && data["token"] && data["target"]) {
            const source = Object.keys(data["source"]).length > 0 ? data["source"] : undefined;
            const token = Object.keys(data["token"]).length > 0 ? data["token"] : undefined;
            const target = Object.keys(data["target"]).length > 0 ? data["target"] : undefined;
            if (source && token && target) {
                const sourceName = source.tokenmap_name;
                const targetName = target.tokenmap_name;
                const sourceId = token_maps.idKeys[sourceName];
                const token_records = token_maps.tokens?.filter((item) => {
                    return item[sourceName][sourceId] === token.id;
                });
                if (token_records) {
                    if (targetName === "ergo") {
                        const ergoItem = token_records[0].ergo;
                        const ergoToken = {
                            id: ergoItem.tokenID,
                            label: ergoItem.tokenName,
                            icon: "ERG.svg",
                            min: 10
                        };
                        setTargetTokens([ergoToken]);
                        form.data.targetToken = ergoToken;
                    } else if (targetName === "cardano") {
                        const cardanoItem = token_records[0].cardano;
                        const cardanoToken = {
                            id: cardanoItem.fingerprint,
                            label: hex2a(cardanoItem.assetID),
                            policyId: cardanoItem.policyID,
                            icon: "ADA.svg",
                            min: 20
                        };
                        setTargetTokens([cardanoToken]);
                        form.data.targetToken = cardanoToken;
                    }
                }
            }
        }
    }, [form.data["target"], form.data["token"]]);

    useEffect(() => {
        const { data } = form;
        if (data["token"] && Object.keys(data["token"]).length > 0 && walletConnected) {
            if (sourceChain === "ERG") {
                nautilus.getBalance(data.token?.id).then((balance) => setBalance(balance));
            } else {
                nami.getBalance(data.token?.id).then((balance) => setBalance(balance));
            }
        }
    }, [form.data["token"], walletConnected]);

    async function handle_submit() {
        if (!walletConnected) {
            if (sourceChain === "ERG") {
                await nautilus.connect();
                await updateStatus();
            } else if (sourceChain === "ADA") {
                await nami.connect();
                await updateStatus();
            }
        } else {
            const token = form.data["token"];
            const target = form.data["target"];
            const targetToken = form.data["targetToken"];
            const amount = form.data["amount"];
            const address = form.data["address"];
            if (
                !token ||
                !target ||
                !targetToken ||
                Object.keys(token).length === 0 ||
                Object.keys(target).length === 0 ||
                Object.keys(targetToken).length === 0
            ) {
                alert("Please enter source and target");
                return;
            }
            if (!amount || !address) {
                alert("Please enter amount and address");
                return;
            }
            if (amount > balance) {
                alert("Insufficient balance");
                return;
            }
            setTransfering(true);
            if (sourceChain === "ERG") {
                let uTxos;
                try {
                    uTxos = await nautilus.getUtxos(amount, form.data.token.id);
                } catch (e) {
                    console.error(e);
                    setWalletConnected(false);
                    setBalance(0);
                    setTransfering(false);
                    return;
                }
                const changeAddress = await nautilus.getChangeAddress();
                const uTx = await generateTX(
                    uTxos,
                    changeAddress,
                    form.data["target"].id,
                    address,
                    form.data.token.id,
                    amount
                );
                try {
                    const signedTx = await nautilus.signTX(uTx);
                    const result = await nautilus.submitTx(signedTx);
                    alert("Done, txid: " + result);
                    resetAll();
                } catch (e) {
                    alert(e.info);
                    console.error(e);
                }
                setTransfering(false);
            } else if (sourceChain === "ADA") {
                try {
                    let utxos;
                    try {
                        utxos = await nami.getUtxos();
                    } catch (e) {
                        console.error(e);
                        setWalletConnected(false);
                        setBalance(0);
                        return;
                    }
                    const userAddress = await nami.getChangeAddress();
                    const toAddress = address;
                    const txBody = await generateAdaTX(
                        userAddress,
                        a2hex(form.data.token.label),
                        form.data.token.policyId,
                        amount,
                        utxos,
                        toAddress,
                        String("addr_test1qpjwf0e2wv2lmdaws") //TODO
                    );
                    const result = await nami.signAndSubmitTx(
                        txBody,
                        await getAux(toAddress, String("addr_test1qpjwf0e2wv2lmdaws"))
                    );
                    alert("Done, txid: " + result);
                    resetAll();
                } catch (e) {
                    alert(e.info);
                    console.error(e);
                }
                setTransfering(false);
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
                                options={allChains}
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
                                options={targetChains}
                                disabled={!form.data["source"] || !form.data["token"]}
                                form={form}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <InputSelect
                                name="targetToken"
                                label="To Token"
                                options={targetTokens}
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
                            <LoadingButton
                                loading={transfering}
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                onClick={handle_submit}
                                sx={{ mt: 2 }}
                            >
                                {walletConnected ? "Transfer" : "Connect Wallet"}
                            </LoadingButton>
                        </Box>
                    </Stack>
                </Stack>
            </Card>
        </PageBox>
    );
}
