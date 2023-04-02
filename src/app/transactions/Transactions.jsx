import React, { useEffect, useRef, useState } from "react";
import PageBox from "layouts/PageBox";
import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Typography,
    TableBody,
    Box,
    Card,
    Tooltip,
    Snackbar,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Checkbox
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NumberFormat from "react-number-format";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import copy from "copy-to-clipboard";
import { shortenString } from "utils";
import { apiInstance } from "utils/network";
import { AxiosError } from "axios";

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

export default function Assets() {
    const [transactions, setTransactions] = useState([
        {
            observationId: 40,
            fromChain: "cardano",
            toChain: "ergo",
            fromAddress:
                "addr1qy3xqgsqdc3d00rqgms82xz3fk0qmvx9pe3kjxcslktxtk8rhhf0cwv9ek5rtscrdgegjcjenjd4cjdg7ef9dcqq6njqvh7kek",
            toAddress: "9eqUX6LWEs8F58hZbXhNXseQcUDAYDRaBhgdrhDxGNgWQwapYrh",
            creationHeight: 8590878,
            amount: "19400000",
            networkFee: "1200000",
            bridgeFee: "194000",
            sourceChainTokenId: "asset1v25eyenfzrv6me9hw4vczfprdctzy5ed3x99p2",
            requestId: "13be59e27b43914ccd927cf2c654c1173fd465ef5936c2eb4e5e8edaf4d3ab33",
            eventId: "13be59e27b43914ccd927cf2c654c1173fd465ef5936c2eb4e5e8edaf4d3ab33",
            feePaymentTx: "4321aaf49c0382044a0d8810a911d42760ccdddc1c9742b029f49d62146c4be3",
            status: "Done",
            lastHeight: 972893
        }
    ]);
    const [fetched, setFetched] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [snackSeverity, setSnackSeverity] = useState("info");
    const [snackMessage, setSnackMessage] = useState("");
    const mountFlag = useRef(true);

    const handleCopyClick = (event, text) => {
        event.preventDefault();
        copy(text);
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

    return (
        <PageBox
            title="Bridge Transactions"
            subtitle="All transactions that have been bridged using Rosen between networks."
            maxWidth="xl"
        >
            <Card variant="outlined" sx={{ mb: 5, bgcolor: "background.content" }}>
                <ContainerBox>
                    <Box sx={{ display: "flex", justifyContent: "left", m: 2 }}>
                        <Typography sx={{ fontWeight: "bold", mr: 1, alignSelf: "center" }}>
                            Filter by
                        </Typography>
                        <Box sx={{ mr: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel id="network-filter-label">Network</InputLabel>
                                <Select
                                    labelId="network-filter-label"
                                    id="network-filter"
                                    value={"All Networks"}
                                    // onChange={handleNetworkFilterChange}
                                >
                                    <MenuItem value="">All Networks</MenuItem>
                                    <MenuItem value="Network A">Network A</MenuItem>
                                    <MenuItem value="Network B">Network B</MenuItem>
                                    <MenuItem value="Network C">Network C</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ mr: 2 }}>
                            <TextField
                                label="Token ID"
                                variant="outlined"
                                value={"1"}
                                // onChange={null}
                            />
                        </Box>
                        <Box>
                            <FormControl>
                                <Checkbox
                                    checked={true}
                                    // onChange={handleEventFilterChange}
                                    color="primary"
                                />
                                <InputLabel>Event</InputLabel>
                            </FormControl>
                        </Box>
                    </Box>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>From Chain</TableCell>
                                <TableCell>To Chain</TableCell>
                                <TableCell>From Address</TableCell>
                                <TableCell>To Address</TableCell>
                                <TableCell>Creation Height</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Network Fee</TableCell>
                                <TableCell>Bridge Fee</TableCell>
                                <TableCell>Source Chain Token ID</TableCell>
                                {/* {showEvents && <TableCell>Event ID</TableCell>} */}
                                <TableCell>Status</TableCell>
                                <TableCell>Last Height</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions?.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.fromChain}</TableCell>
                                    <TableCell>{row.toChain}</TableCell>
                                    <TableCell>{shortenString(row.fromAddress)}</TableCell>
                                    <TableCell>{shortenString(row.toAddress)}</TableCell>
                                    <TableCell>{row.creationHeight}</TableCell>
                                    <TableCell>
                                        <NumberFormat
                                            value={row.amount}
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
                                    <TableCell>
                                        <NumberFormat
                                            value={row.bridgeFee}
                                            thousandSeparator
                                            displayType="text"
                                        />
                                    </TableCell>
                                    <TableCell>{shortenString(row.sourceChainTokenId)}</TableCell>
                                    {/* {showEvents && <TableCell>{row.eventId}</TableCell>} */}
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>{row.lastHeight}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
