import React, { useState, useEffect } from "react";
import { Box, Card, Divider, Grid, Stack, Typography, Snackbar, Alert } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PageBox from "layouts/PageBox";
import InputSelect from "components/InputSelect";
import useObject from "reducers/useObject";
import InputText from "components/InputText";
import AlertDialog from "layouts/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Nautilus, Nami } from "../../wallets";
import tokenMapFile from "../../configs/tokenmap.json";
import { TokenMap } from "@rosen-bridge/tokens";
import ergoContract from "../../configs/contract-ergo.json";
import cardanoConract from "../../configs/contract-cardano.json";
import {
    hex2ascii,
    connectToWallet,
    transfer,
    isValidAddressErgo,
    isValidAddressCardano,
    countDecimals,
    fixedDecimals,
    generateTxLink
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
    ergoContract.tokens.RSNRatioNFT
);
const cardanoMinfee = new BridgeMinimumFee(
    explorerConfig.ergo_explorer.base_url,
    cardanoConract.tokens.RSNRatioNFT
);
const minFee = [ergoMinfee, cardanoMinfee];
const tokenMap = new TokenMap(tokenMapFile);

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
    const [dialogLinkText, setDialogLinkText] = useState("");
    const [dialogLink, setDialogLink] = useState("");
    const [bridgeFee, setBridgeFee] = useState(-1);
    const [networkFee, setNetworkFee] = useState(-1);
    const [fetchedFees, setFetchedFees] = useState({
        bridgeFee: -1,
        networkFee: -1
    });
    const [feeToken, setFeeToken] = useState("");
    const [receivingAmount, setReceivingAmount] = useState(0);
    const [minTransferAmount, setMinTransferAmount] = useState(0);
    const [amount, setAmount] = useState(0);
    const [openSnack, setOpenSnack] = useState(false);
    const [snackSeverity, setSnackSeverity] = useState("info");
    const [snackMessage, setSnackMessage] = useState("");
    const [amountLabel, setAmountLabel] = useState("Amount");

    const closeDialog = () => {
        setDialogTitle("");
        setDialogText("");
        setDialogProceedText("");
        setOpendialog(false);
    };

    const closeSnack = () => {
        setOpenSnack(false);
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

    const showAlert = (title, text, proceedText, link = "", linkText = "") => {
        setDialogTitle(title);
        setDialogText(text);
        setDialogProceedText(proceedText);
        setDialogLink(link);
        setDialogLinkText(linkText);
        setOpendialog(true);
    };

    const showSnack = (messgae, severity = "info", duration = 2000, cb) => {
        setSnackMessage(messgae);
        setSnackSeverity(severity);
        setOpenSnack(true);
        setTimeout(() => {
            setOpenSnack(false);
            if (cb) {
                cb();
            }
        }, duration);
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

    const resetAll = (resetSource = false) => {
        if (resetSource) {
            form.data.source = {};
        }
        form.data.token = {};
        form.data.target = {};
        form.data.targetToken = {};
        setAmount(0);
        form.data.address = "";
        setTargetTokens([]);
        setWalletConnected(false);
        setBalance(0);
        setBridgeFee(-1);
        setNetworkFee(-1);
        setFetchedFees({
            bridgeFee: -1,
            networkFee: -1
        });
        setFeeToken("");
        setReceivingAmount(0);
    };

    const updateFees = (amount, fees) => {
        let paymentAmount = amount * Math.pow(10, form.data["token"].decimals || 0);
        if (amount < 0) {
            setBridgeFee(-1);
            setReceivingAmount(0);
            setNetworkFee(-1);
            return;
        }
        setNetworkFee(fees.networkFee);
        const bridgeFee = Math.max(fees.bridgeFee, Math.ceil(paymentAmount * consts.feeRatio));
        setBridgeFee(bridgeFee);
        setReceivingAmount(paymentAmount - (fees.networkFee + bridgeFee));
        setMinTransferAmount(
            Math.max(
                bridgeFee + fees.networkFee,
                Math.ceil(fees.networkFee / (1 - consts.feeRatio))
            )
        );
    };

    const moveAllBalance = () => setAmount(balance / Math.pow(10, form.data.token?.decimals || 0));

    useEffect(() => {
        const { data } = form;
        if (!data["source"]) {
            const tokens = tokenMapFile.tokens;
            setErgoTokens(
                tokens.map((item) => {
                    const ergoItem = item.ergo;
                    return {
                        id: ergoItem.tokenId,
                        label: ergoItem.tokenName,
                        icon: "ERG.svg",
                        decimals: ergoItem.decimals || 0
                    };
                })
            );
            setCardanoTokens(
                tokens.map((item) => {
                    const cardanoItem = item.cardano;
                    return {
                        id: cardanoItem.fingerprint,
                        label: hex2ascii(cardanoItem.assetName),
                        policyId: cardanoItem.policyId,
                        icon: "ADA.svg",
                        decimals: cardanoItem.fingerprint === consts.cardanoTokenName ? 6 : 0
                    };
                })
            );
        } else {
            if (data["source"].id !== sourceChain) {
                resetAll();
                setSourceChain(data["source"].id);
                setTargetChains(
                    consts.supportedChains.filter((item) => item.id !== data["source"].id)
                );
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
                const sourceId = tokenMap.getIdKey(sourceName);
                const token_records = tokenMap.search(sourceName, {
                    [sourceId]: token.id
                });
                if (token_records) {
                    if (targetName === "ergo") {
                        const ergoItem = token_records[0].ergo;
                        const ergoToken = {
                            id: ergoItem.tokenId,
                            label: ergoItem.tokenName,
                            icon: "ERG.svg",
                            decimals: ergoItem.decimals || 0
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
                            decimals: cardanoItem.fingerprint === consts.cardanoTokenName ? 6 : 0
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
            const wallet = sourceChain === "ERG" ? nautilus : nami;
            wallet.getBalance(data.token?.id).then((balance) => setBalance(balance));
        }
    }, [form.data["token"], walletConnected]);

    useEffect(() => {
        async function caclucateFees(tokenId, chain) {
            let localMinFees = {
                networkFee: -1,
                bridgeFee: -1
            };
            try {
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
                if (
                    fees.bridgeFee !== nextFees.bridgeFee ||
                    fees.networkFee !== nextFees.networkFee
                ) {
                    showAlert(
                        "Warning",
                        "Fees might change depending on the height of mining the transactions.",
                        ""
                    );
                }
                localMinFees = {
                    networkFee: Number(fees.networkFee.toString()),
                    bridgeFee: Number(fees.bridgeFee.toString())
                };
            } catch (e) {
                showSnack(
                    "Failed to fetch fees! Retrying...",
                    "error",
                    5000,
                    caclucateFees.bind(null, tokenId, chain)
                );
            } finally {
                setFetchedFees(localMinFees);
                setFeeToken(form.data.token.id);
                updateFees(amount, localMinFees);
            }
        }
        if (form.data.token && Object.keys(form.data.token).length > 0) {
            updateFees(-1, {});
            if (form.data.token.id !== feeToken) {
                const chain = form.data.source.id === "ERG" ? "ergo" : "cardano";
                const idKey = tokenMap.getIdKey(chain);
                const tokens = tokenMap.search(chain, {
                    [idKey]: form.data.token.id
                });

                caclucateFees(tokens[0].ergo.tokenId, chain);
                return;
            } else {
                const paymentAmount = amount * Math.pow(10, form.data["token"].decimals);
                setReceivingAmount(paymentAmount - (networkFee + bridgeFee));
            }
        }
        if (amount >= 0 && form.data?.token?.id === feeToken) {
            updateFees(amount, fetchedFees);
        }
    }, [amount, form.data["token"]]);

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
            setTransfering(true);
            const token = form.data["token"];
            const target = form.data["target"];
            const targetToken = form.data["targetToken"];
            const paymentAmount = amount * Math.pow(10, form.data["token"].decimals);
            const address = form.data["address"];
            const targetMinUTXO = Number(target === "ERG" ? consts.minBoxValue : consts.minBoxADA);
            const isTargetNative =
                targetToken.id === consts.ergTokenName ||
                targetToken.id === consts.cardanoTokenName;
            if (
                !token ||
                !target ||
                !targetToken ||
                Object.keys(token).length === 0 ||
                Object.keys(target).length === 0 ||
                Object.keys(targetToken).length === 0 ||
                !address
            ) {
                setDialogTitle("Error");
                setDialogText("Please fill out the form completely before submitting.");
                setOpendialog(true);
                setTransfering(false);
                return;
            }
            if (paymentAmount - (bridgeFee + networkFee) <= 0) {
                showAlert("Error", "The transfer is not possible since the amount is too low.", "");
                setTransfering(false);
                return;
            }
            if (paymentAmount > balance) {
                showAlert("Error", "Insufficient token balance.", "");
                setTransfering(false);
                return;
            }
            if (isTargetNative && receivingAmount < targetMinUTXO) {
                showAlert(
                    "Error",
                    "The transfer is not possible since the amount is lower than minUTXO.",
                    ""
                );
                setTransfering(false);
                return;
            }
            if (
                (target.id === "ERG" && !(await isValidAddressErgo(address))) ||
                (target.id === "ADA" && !(await isValidAddressCardano(address)))
            ) {
                showAlert("Error", "Invalid target address.", "");
                return setTransfering(false);
            }
            if (bridgeFee <= 0 || networkFee <= 0) {
                showAlert("Error", "Fees are not fetched yet.", "");
                return setTransfering(false);
            }
            try {
                let txId = "";
                if (sourceChain === "ERG") {
                    txId = await transfer(
                        sourceChain,
                        nautilus,
                        paymentAmount,
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
                        paymentAmount,
                        token.policyId,
                        target.id,
                        address,
                        networkFee,
                        bridgeFee,
                        token.label
                    );
                }
                showAlert(
                    "Success",
                    "Transaction submitted successfully.",
                    "",
                    generateTxLink(sourceChain, txId),
                    "View on Explorer"
                );
                resetAll(true);
            } catch (e) {
                const errorMessage = e.message || e;
                showAlert("Error", "Failed to submit transaction. " + errorMessage, "");
            } finally {
                setTransfering(false);
            }
        }
    }

    async function handle_amount(e) {
        const newValue = e.target.value;
        if (!newValue) {
            setAmount(0);
        } else if (countDecimals(newValue) > form.data.token.decimals) {
            setAmount(fixedDecimals(newValue, form.data.token.decimals));
        } else {
            setAmount(newValue);
        }
    }
    return (
        <PageBox
            title="Rosen Bridge - Public Test"
            subtitle="Testing Rosen bridge on Ergo and Cardano main-nets using test tokens"
            maxWidth="md"
            header={
                <p style={{ color: "#FBC02D", textAlign: "justify" }}>
                    <b>Attention</b>: The bridge is in public test mode. You can use it if you have
                    test tokens. However you are able to transfer real ERG and ADA, please use these
                    assets at your own risk and only try with some amounts that you're willing to
                    lose. At this stage, there is no guarantee of a successful transfer or a refund.
                    Also, redeem ERG/ADA during the test period, since the bridged assets will be
                    completely worthless.
                </p>
            }
        >
            <AlertDialog
                open={openDialog}
                onClose={closeDialog}
                title={dialogTitle}
                text={dialogText}
                closeText="Close"
                proceedText={dialogProceedText}
                onProceed={proceedDialog}
                link={dialogLink}
                linkText={dialogLinkText}
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
                                options={consts.supportedChains}
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
                                disabled={true}
                                form={form}
                            />
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            sx={{
                                marginTop: "0.5rem"
                            }}
                        >
                            <InputText
                                type="number"
                                name="amount"
                                label={
                                    feeToken === "" && !form.data.token?.id
                                        ? ""
                                        : feeToken === ""
                                        ? "Calculating Fees"
                                        : amountLabel
                                }
                                placeholder={
                                    form.data.token?.id && bridgeFee + networkFee > 0
                                        ? `Minimum ${
                                              minTransferAmount /
                                              Math.pow(10, form.data.token?.decimals || 0)
                                          } ${form.data.token?.label} `
                                        : "Amount"
                                }
                                onFocus={() => setAmountLabel("Amount")}
                                onBlur={() =>
                                    setAmountLabel(
                                        `Minimum ${
                                            minTransferAmount /
                                            Math.pow(10, form.data.token?.decimals || 0)
                                        } ${form.data.token?.label} `
                                    )
                                }
                                helperText={
                                    walletConnected && form.data.token?.id ? (
                                        <div style={{ fontSize: "0.9rem" }}>
                                            <span style={{ fontWeight: "bold" }}>Max</span>:{" "}
                                            <span
                                                onClick={moveAllBalance}
                                                style={{
                                                    color: theme.palette.primary.main,
                                                    cursor: "pointer",
                                                    textDecoration: "underline",
                                                    userSelect: "none"
                                                }}
                                            >
                                                {balance /
                                                    Math.pow(10, form.data.token?.decimals || 0)}
                                            </span>
                                            <span> {form.data.token.label}</span>
                                        </div>
                                    ) : (
                                        ""
                                    )
                                }
                                disabled={feeToken === ""}
                                form={form}
                                text={amount}
                                manualChange={handle_amount}
                                sx={{ input: { fontSize: "1rem" } }}
                            />
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            sx={{
                                marginTop: "0.5rem"
                            }}
                        >
                            <InputText
                                name="address"
                                label={`${
                                    form.data.target?.id ? form.data.target.label : "Destination"
                                } Address`}
                                form={form}
                            />
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
                            title="Amount"
                            value={amount}
                            unit={form.data.token?.label || ""}
                        />
                        <ValueDisplay
                            title="Bridge Fee"
                            value={
                                bridgeFee >= 0
                                    ? bridgeFee / Math.pow(10, form.data.token.decimals)
                                    : "Pending"
                            }
                            unit={form.data.token?.label || ""}
                        />
                        <ValueDisplay
                            title="Network Fee"
                            value={
                                networkFee >= 0
                                    ? networkFee / Math.pow(10, form.data.token.decimals)
                                    : "Pending"
                            }
                            unit={form.data.token?.label || ""}
                        />
                        <Divider />
                        <ValueDisplay
                            title="You will receive"
                            value={
                                receivingAmount >= 0
                                    ? fixedDecimals(
                                          receivingAmount /
                                              Math.pow(10, form.data.targetToken?.decimals || 0),
                                          form.data.targetToken?.decimals || 0
                                      )
                                    : "-"
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
            <Snackbar open={openSnack} anchorOrigin={{ horizontal: "center", vertical: "bottom" }}>
                <Alert onClose={closeSnack} severity={snackSeverity} sx={{ width: "100%" }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </PageBox>
    );
}
