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
    CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NumberFormat from "react-number-format";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import copy from "copy-to-clipboard";
import { shortenString } from "utils";
import { apiInstance } from "utils/network";
import { AxiosError } from "axios";
import { TokenMap } from "@rosen-bridge/tokens";
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
const tokenMap = new TokenMap(tokenMapFile);

export default function Assets() {
    const [assets, setAssets] = useState([]);
    const [fetched, setFetched] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [snackSeverity, setSnackSeverity] = useState("info");
    const [snackMessage, setSnackMessage] = useState("");
    const mountFlag = useRef(true);

    useEffect(() => {
        if (!mountFlag.current) return;
        apiInstance
            .get("/assets/list")
            .then((res) => {
                if (typeof res.data === "object") {
                    const data = res.data.map((item) => {
                        const network = item.tokenNetwork;
                        const tokens = tokenMap.search(network, {
                            [tokenMap.getIdKey(network)]: item.tokenId
                        });
                        return {
                            ...item,
                            decimals: tokens.length > 0 ? tokens[0][network].decimals || 0 : 0
                        };
                    });
                    setAssets(data);
                    setFetched(true);
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
        return () => {
            mountFlag.current = false;
        };
    }, []);

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

    console.log(assets);
    return (
        <PageBox
            title="Bridge Assets"
            subtitle="All assets currently locked in Rosen"
            maxWidth="lg"
            indent={58}
            header={
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "baseline",
                        p: 2,
                        mt: 2
                    }}
                >
                    <Typography sx={{ fontWeight: "bold", color: "text.secondary" }}>
                        Total Value Locked
                    </Typography>
                    <span>
                        <Tooltip title="USD equivalent value of all assets locked in Rosen">
                            <InfoOutlinedIcon
                                sx={{ fontSize: "small", mr: 2, ml: 0.5, mb: "2px" }}
                            />
                        </Tooltip>
                    </span>
                    <Typography
                        sx={{ fontSize: "x-large", color: "primary.main", wordBreak: "break-all" }}
                    >
                        <NumberFormat value={0} thousandSeparator displayType="text" prefix="$" />
                    </Typography>
                </Box>
            }
        >
            <Card variant="outlined" sx={{ mb: 5, bgcolor: "background.content" }}>
                <ContainerBox>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Asset ID</TableCell>
                                <TableCell>Asset Name</TableCell>
                                <TableCell>Asset Type</TableCell>
                                <TableCell>Network</TableCell>
                                <TableCell>Bank Address</TableCell>
                                <TableCell>Locked Amount</TableCell>
                                <TableCell>Cold Locked</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {assets?.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell
                                        style={{ cursor: "pointer" }}
                                        onClick={(event) => handleCopyClick(event, row.tokenId)}
                                    >
                                        {shortenString(row.tokenId)}
                                    </TableCell>
                                    <TableCell>{row.tokenName}</TableCell>
                                    <TableCell>{row.tokenType}</TableCell>
                                    <TableCell>{row.tokenNetwork}</TableCell>
                                    <TableCell
                                        style={{ cursor: "pointer" }}
                                        onClick={(event) => handleCopyClick(event, row.bankAddress)}
                                    >
                                        {shortenString(row.bankAddress)}
                                    </TableCell>
                                    <TableCell>
                                        <NumberFormat
                                            value={row.lockedAmount / Math.pow(10, row.decimals)}
                                            thousandSeparator
                                            displayType="text"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <NumberFormat
                                            value={
                                                row.coldLockedAmount / Math.pow(10, row.decimals)
                                            }
                                            thousandSeparator
                                            displayType="text"
                                        />
                                    </TableCell>
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
                    ) : null}
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
