import React, { useState, useEffect } from "react";
import { Box, Card, Divider, Grid, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PageBox from "layouts/PageBox";
import InputSelect from "components/InputSelect";
import useObject from "reducers/useObject";
import InputText from "components/InputText";
import AlertDialog from "layouts/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Nautilus, Nami } from "../../wallets";
import token_maps from "../../configs/tokenmap.json";
import ergoContract from "../../configs/contract-ergo.json";
import cardanoConract from "../../configs/contract-cardano.json";
import {
    hex2ascii,
    connectToWallet,
    transfer,
    isValidAddressErgo,
    isValidAddressCardano
} from "../../utils";
import { consts } from "configs";
import { BridgeMinimumFee } from "@rosen-bridge/minimum-fee-browser";
import { default as ergoExplorer } from "../../explorer/ergo";
import { default as cardanoExplorer } from "../../explorer/cardano";

const explorerConfig = require("../../configs/remote.json");
const nautilus = new Nautilus();
const nami = new Nami();
const ergoMinfee = new BridgeMinimumFee(
    explorerConfig.ergo_explorer.base_url,
    consts.feeConfigErgoTreeTemplateHash,
    ergoContract.tokens.RSNRatioNFT
);
const cardanoMinfee = new BridgeMinimumFee(
    explorerConfig.ergo_explorer.base_url,
    consts.feeConfigErgoTreeTemplateHash,
    cardanoConract.tokens.RSNRatioNFT
);
const minFee = [ergoMinfee, cardanoMinfee];

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
    const [openDialog, setOpendialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogText, setDialogText] = useState("");
    const [dialogProceedText, setDialogProceedText] = useState("");
    const [bridgeFee, setBridgeFee] = useState(0);
    const [networkFee, setNetworkFee] = useState(0);
    const [fetchedFees, setFetchedFees] = useState({
        bridgeFee: 0,
        networkFee: 0
    });
    const [feeToken, setFeeToken] = useState("");

    const closeDialog = () => {
        setDialogTitle("");
        setDialogText("");
        setDialogProceedText("");
        setOpendialog(false);
    };

    const proceedDialog = () => {
        const installNautilus = dialogProceedText === "Install Nautilus";
        const installNami = dialogProceedText === "Install Nami";
        closeDialog();
        if (installNautilus) {
            window.open(consts.nautilusUrl, "_blank");
        } else if (installNami) {
            window.open(consts.namiUrl, "_blank");
        }
    };

    const showAlert = (title, text, proceedText) => {
        setDialogTitle(title);
        setDialogText(text);
        setDialogProceedText(proceedText);
        setOpendialog(true);
    };

    const updateStatus = async () => {
        if (sourceChain === "ERG") {
            const connected = await nautilus.isConnected();
            setWalletConnected(connected);
        } else if (sourceChain === "ADA") {
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
        setBridgeFee(0);
        setNetworkFee(0);
        setFetchedFees({
            bridgeFee: 0,
            networkFee: 0
        });
        setFeeToken("");
    };

    const mapTokenMap = (cb) => {
        return token_maps.tokens?.map(cb);
    };

    const updateFees = (amount, fees) => {
        setNetworkFee(fees.networkFee);
        setBridgeFee(Math.max(fees.bridgeFee, Math.ceil(amount * consts.feeRatio)));
    };

    useEffect(() => {
        const { data } = form;
        if (!data["source"]) {
            setErgoTokens(
                mapTokenMap((item) => {
                    const ergoItem = item.ergo;
                    return {
                        id: ergoItem.tokenId,
                        label: ergoItem.tokenName,
                        icon: "ERG.svg",
                        min: 1,
                        decimals: ergoItem.decimals || 0
                    };
                })
            );
            setCardanoTokens(
                mapTokenMap((item) => {
                    const cardanoItem = item.cardano;
                    return {
                        id: cardanoItem.fingerprint,
                        label: hex2ascii(cardanoItem.assetName),
                        policyId: cardanoItem.policyId,
                        icon: "ADA.svg",
                        min: 1
                    };
                })
            );
        } else {
            if (data["source"].id !== sourceChain) {
                resetAll();
                setSourceChain(data["source"].id);
                setTargetChains(allChains.filter((item) => item.id !== data["source"].id));
                connectToWallet(data["source"].id, nautilus, nami).then((result) => {
                    if (result === 0) setWalletConnected(true);
                });
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
                            id: ergoItem.tokenId,
                            label: ergoItem.tokenName,
                            icon: "ERG.svg",
                            min: 1
                        };
                        setTargetTokens([ergoToken]);
                        form.data.targetToken = ergoToken;
                    } else if (targetName === "cardano") {
                        const cardanoItem = token_records[0].cardano;
                        const cardanoToken = {
                            id: cardanoItem.fingerprint,
                            label: hex2ascii(cardanoItem.assetName),
                            policyId: cardanoItem.policyId,
                            icon: "ADA.svg",
                            min: 1
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
                nautilus
                    .getBalance(data.token?.id)
                    .then((balance) => setBalance(balance / Math.pow(10, data.token?.decimals)));
            } else {
                nami.getBalance(data.token?.id).then((balance) => setBalance(balance));
            }
        }
    }, [form.data["token"], walletConnected]);

    useEffect(() => {
        async function caclucateFees(tokenId, chain) {
            const height =
                chain === "ergo"
                    ? await ergoExplorer.getHeight()
                    : await cardanoExplorer.getHeight();
            const minFeeIndex = chain === "ergo" ? 0 : 1;
            const fees = await minFee[minFeeIndex].getFee(tokenId, chain, height);
            const nextFees = await minFee[minFeeIndex].getFee(
                tokenId,
                chain,
                height + consts.nextfeeHeight
            );
            if (fees.bridgeFee !== nextFees.bridgeFee || fees.networkFee !== nextFees.networkFee) {
                showAlert(
                    "Warning",
                    "Fees might change depending on the height of mining the transactions.",
                    ""
                );
            }
            const localMinFees = {
                networkFee: Number(fees.networkFee.toString()),
                bridgeFee: Number(fees.bridgeFee.toString())
            };
            setFetchedFees(localMinFees);
            setFeeToken(form.data.token.id);
            updateFees(0, localMinFees);
        }
        if (form.data.token && Object.keys(form.data.token).length > 0) {
            if (form.data.token.id !== feeToken) {
                const chain = form.data.source.id === "ERG" ? "ergo" : "cardano";
                const mappedTokens = mapTokenMap((item) => {
                    if (item.cardano.fingerprint === form.data.token.id) return item.ergo;
                });
                const tokenId =
                    form.data.source.id === "ERG" ? form.data.token.id : mappedTokens[0].tokenId;

                caclucateFees(tokenId, chain);
                return;
            }
        }
        if (form.data.amount && form.data?.token?.id === feeToken) {
            updateFees(form.data.amount, fetchedFees);
        }
    }, [form.data["amount"], form.data["token"]]);

    async function handle_submit() {
        if (!walletConnected) {
            const result = await connectToWallet(sourceChain, nautilus, nami);
            if (result === 0) updateStatus();
            else if (result === 1) {
                if (sourceChain === "ERG") {
                    showAlert(
                        "Install Nautilus",
                        "Please install Nautilus wallet to continue",
                        "Install Nautilus"
                    );
                } else if (sourceChain === "ADA") {
                    showAlert(
                        "Install Nami",
                        "Please install Nami wallet to continue",
                        "Install Nami"
                    );
                }
            } else {
                showAlert("Error", "Please select source chain.", "");
            }
        } else {
            const token = form.data["token"];
            const target = form.data["target"];
            const targetToken = form.data["targetToken"];
            let amount = form.data["amount"];
            const address = form.data["address"];
            if (
                !token ||
                !target ||
                !targetToken ||
                Object.keys(token).length === 0 ||
                Object.keys(target).length === 0 ||
                Object.keys(targetToken).length === 0 ||
                !amount ||
                !address
            ) {
                setDialogTitle("Error");
                setDialogText("Please fill out the form completely before submitting.");
                setOpendialog(true);
                return;
            }
            if(!Number.isInteger(form.data["amount"])) {
                showAlert("Error", "Only integer amounts are valid.", "");
                return;
            }
            if (form.data["amount"] - (bridgeFee + networkFee) <= 0) {
                showAlert("Error", "The transfer is not possible since the amount is too low.", "");
                return;
            }
            if (amount > balance) {
                showAlert("Error", "Insufficient token balance.", "");
                return;
            }
            if (
                (target.id === "ERG" && !(await isValidAddressErgo(address))) ||
                (target.id === "ADA" && !(await isValidAddressCardano(address)))
            ) {
                showAlert("Error", "Invalid target address.", "");
                return;
            }
            setTransfering(true);
            try {
                let txId = "";
                if (sourceChain === "ERG") {
                    amount = amount * Math.pow(10, token.decimals);
                    txId = await transfer(
                        sourceChain,
                        nautilus,
                        amount,
                        token.id,
                        target.id,
                        address,
                        networkFee,
                        bridgeFee
                    );
                } else if (sourceChain === "ADA") {
                    txId = await transfer(
                        sourceChain,
                        nami,
                        amount,
                        token.policyId,
                        target.id,
                        address,
                        networkFee,
                        bridgeFee,
                        token.label
                    );
                }
                showAlert("Success", "Transaction submitted successfully. TxId: " + txId, "");
                resetAll();
            } catch (e) {
                showAlert("Error", "Failed to submit transaction. " + e.message, "");
            } finally {
                setTransfering(false);
            }
        }
    }

    return (
        <PageBox
            title="Rosen Bridge - soft launch"
            subtitle="Testing Rosen Bridge on Ergo and Cardano main-nets using test tokens"
            maxWidth="md"
        >
            <AlertDialog
                open={openDialog}
                onClose={closeDialog}
                title={dialogTitle}
                text={dialogText}
                closeText="Close"
                proceedText={dialogProceedText}
                onProceed={proceedDialog}
            />
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
                                disabled={!form.data["target"]?.id}
                                form={form}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <InputText
                                type="number"
                                name="amount"
                                label={
                                    feeToken === "" && !form.data.token?.id
                                        ? ""
                                        : feeToken === ""
                                        ? "Calculating Fees"
                                        : "Amount"
                                }
                                placeholder="0.00"
                                helperText={
                                    form.data.token?.id &&
                                    `Minimum ${bridgeFee + networkFee + 1} ${
                                        form.data.token?.label
                                    } `
                                }
                                disabled={feeToken === ""}
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
                            unit={form.data.token?.label || ""}
                        />
                        <ValueDisplay
                            title="Bridge Fee"
                            value={bridgeFee > 0 ? bridgeFee : "Pending"}
                            unit={form.data.token?.label || ""}
                        />
                        <ValueDisplay
                            title="Network Fee"
                            value={networkFee > 0 ? networkFee : "Pending"}
                            unit={form.data.token?.label || ""}
                        />
                        <Divider />
                        <ValueDisplay
                            title="You will receive"
                            value={
                                (form.data["amount"] - (bridgeFee + networkFee) || 0) >= 0
                                    ? form.data["amount"] - (bridgeFee + networkFee) || 0
                                    : "Amount is too low"
                            }
                            unit={form.data.targetToken?.label || ""}
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
