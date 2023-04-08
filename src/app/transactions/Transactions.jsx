import React, { useEffect, useRef, useState } from "react";
import PageBox from "layouts/PageBox";
import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Card,
    Snackbar,
    Alert,
    Grid,
    Switch,
    Button,
    CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NumberFormat from "react-number-format";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import copy from "copy-to-clipboard";
import { hex2ascii, shortenString } from "utils";
import { apiInstance } from "utils/network";
import { AxiosError } from "axios";
import InputSelect from "components/InputSelect";
import useObject from "reducers/useObject";
import InputText from "components/InputText";
import { LoadingButton } from "@mui/lab";
import { useTheme } from "@emotion/react";
import { consts } from "configs";
import tokenMapFile from "../../configs/tokenmap.json";

const ContainerBox = styled(TableContainer)(
    ({ theme }) => `
    & th {
        font-weight: bold;
        font-size: small;
        white-space: nowrap;
        color: ${theme.palette.text.secondary};
    }
`
);
const tokens = tokenMapFile.tokens;

export default function Assets() {
    const [transactions, setTransactions] = useState([]);
    const theme = useTheme();
    const [fetched, setFetched] = useState(false);
    const form = useObject();
    const [openSnack, setOpenSnack] = useState(false);
    const [snackSeverity, setSnackSeverity] = useState("info");
    const [snackMessage, setSnackMessage] = useState("");
    const mountFlag = useRef(true);
    const [pageCount, setPageCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [ergoTokens, setErgoTokens] = useState([]);
    const [cardanoTokens, setCardanoTokens] = useState([]);

    const handleCopyClick = (event, text) => {
        event.preventDefault();
        copy(text);
        showSnack("Copied to clipboard!", "success", 2000);
    };

    const closeSnack = () => {
        setOpenSnack(false);
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

    const fetchTxs = () => {
        const body = {
            limit: consts.defaultPageLength,
            skip: (pageNumber - 1) * consts.defaultPageLength
        };
        if (form.data.network) {
            body.network = form.data.network.tokenmap_name;
        }
        if (form.data.token) {
            body.tokenId = form.data.token.id;
        }
        if (form.data.fetchAll === false) {
            body.onlyWithEvents = true;
        }

        apiInstance
            .post("/transactions/list", body)
            .then((res) => {
                if (typeof res.data === "object") {
                    const response = res.data;
                    setTransactions(response.data);
                    setFetched(true);
                    setPageCount(Math.ceil(response.total / consts.defaultPageLength));
                } else {
                    showSnack("API Url not set!", "error", 3000);
                }
            })
            .catch((err) => {
                if (err instanceof AxiosError) {
                    showSnack(err.message, "error", 3000);
                } else {
                    console.error(err);
                }
            });
    };

    useEffect(() => {
        if (!mountFlag.current) return;
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
        fetchTxs();
        return () => {
            mountFlag.current = false;
        };
    }, []);

    useEffect(() => {
        if (fetched) {
            setFetched(false);
            fetchTxs();
        }
    }, [pageNumber]);

    useEffect(() => {
        const { token, ...newFormData } = form.data;
        form.data = newFormData;
    }, [form.data["network"]]);

    return (
        <PageBox
            title="Bridge Transactions"
            subtitle="All transactions that have been bridged using Rosen between networks."
            maxWidth="xl"
        >
            <Card variant="outlined" sx={{ mb: 5, bgcolor: "background.content" }}>
                <ContainerBox>
                    <Grid
                        container
                        spacing={1}
                        p={2}
                        sx={{ display: "flex", justifyContent: "center" }}
                    >
                        <Grid item lg={2}>
                            <InputSelect
                                name="network"
                                label="From Chain"
                                options={consts.supportedChains}
                                form={form}
                                helpervisible={form.data.network?.label}
                                helperText="Reset"
                                helperClick={() => {
                                    const { network, ...newFormData } = form.data;
                                    form.data = newFormData;
                                }}
                            />
                        </Grid>
                        <Grid item lg={2}>
                            <InputSelect
                                name="token"
                                label="Token"
                                options={
                                    form.data.network?.label === "Ergo"
                                        ? ergoTokens
                                        : form.data.network?.label === "Cardano"
                                        ? cardanoTokens
                                        : ergoTokens.concat(cardanoTokens)
                                }
                                form={form}
                                helpervisible={form.data.token?.label}
                                helperText="Reset"
                                helperClick={() => {
                                    const { token, ...newFormData } = form.data;
                                    form.data = newFormData;
                                }}
                            />
                        </Grid>
                        <Grid
                            item
                            lg={1}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <span>Event Txs</span>
                            <Switch
                                defaultChecked
                                onChange={(e) => {
                                    form.data.fetchAll = e.target.checked;
                                }}
                            />
                            <span>All</span>
                        </Grid>
                        <Grid
                            item
                            lg={1.5}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <LoadingButton
                                loading={false}
                                variant="contained"
                                color="primary"
                                size="medium"
                                sx={{ borderRadius: "5px", padding: "10px 20px" }}
                                onClick={() => {
                                    if (pageNumber !== 1) {
                                        setPageNumber(1);
                                    } else {
                                        fetchTxs();
                                    }
                                }}
                            >
                                {"Apply Filters"}
                            </LoadingButton>
                        </Grid>
                    </Grid>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>From Chain</TableCell>
                                <TableCell>To Chain</TableCell>
                                <TableCell>From Address</TableCell>
                                <TableCell>To Address</TableCell>
                                <TableCell>Token</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Creation Height</TableCell>
                                <TableCell>Bridge Fee</TableCell>
                                <TableCell>Network Fee</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions?.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.observationId}</TableCell>
                                    <TableCell>{row.fromChain}</TableCell>
                                    <TableCell>{row.toChain}</TableCell>
                                    <TableCell
                                        style={{ cursor: "pointer" }}
                                        onClick={(event) => handleCopyClick(event, row.fromAddress)}
                                    >
                                        {shortenString(row.fromAddress)}
                                    </TableCell>
                                    <TableCell
                                        style={{ cursor: "pointer" }}
                                        onClick={(event) => handleCopyClick(event, row.toAddress)}
                                    >
                                        {shortenString(row.toAddress)}
                                    </TableCell>
                                    <TableCell
                                        style={{ cursor: "pointer" }}
                                        onClick={(event) =>
                                            handleCopyClick(event, row.sourceChainTokenId)
                                        }
                                    >
                                        {shortenString(row.sourceChainTokenId)}
                                    </TableCell>
                                    <TableCell>
                                        <NumberFormat
                                            value={Number(row.amount)}
                                            thousandSeparator
                                            displayType="text"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <NumberFormat
                                            value={Number(row.creationHeight)}
                                            thousandSeparator
                                            displayType="text"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <NumberFormat
                                            value={row.bridgeFee}
                                            thousandSeparator
                                            displayType="text"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <NumberFormat
                                            value={row.networkFee}
                                            thousandSeparator
                                            displayType="text"
                                        />
                                    </TableCell>
                                    <TableCell>{row.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!fetched ? (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div style={{ padding: "1rem" }}>
                                <CircularProgress color="secondary" />
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", margin: "16px" }}>
                            <Button
                                onClick={() => setPageNumber(pageNumber - 1)}
                                disabled={pageNumber <= 1}
                                color="secondary"
                                size="small"
                                startIcon={<ArrowBackIcon />}
                            >
                                Previous
                            </Button>
                            <span
                                style={{
                                    margin: "0px 16px",
                                    color: theme.palette.primary.main,
                                    fontWeight: "bold"
                                }}
                            >
                                Page {pageNumber} of {pageCount}
                            </span>
                            <Button
                                onClick={() => setPageNumber(pageNumber + 1)}
                                disabled={pageNumber >= pageCount}
                                color="secondary"
                                size="small"
                                endIcon={<ArrowForwardIcon />}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </ContainerBox>
            </Card>
            <Snackbar open={openSnack} anchorOrigin={{ horizontal: "center", vertical: "bottom" }}>
                <Alert onClose={closeSnack} severity={snackSeverity} sx={{ width: "100%" }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </PageBox>
    );
}
