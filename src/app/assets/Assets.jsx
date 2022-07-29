import React, {useEffect, useState} from "react"
import PageBox from "layouts/PageBox";
import {Table, TableContainer, TableHead, TableRow, TableCell, Typography, TableBody, Box, Card, Tooltip} from "@mui/material";
import {styled} from "@mui/material/styles";
import NumberFormat from 'react-number-format';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {assetsData} from "../data";

const ContainerBox = styled(TableContainer) (({ theme }) => `
    & th {
        font-weight: bold;
        font-size: small;
        white-space: nowrap;
        color: ${theme.palette.text.secondary};
    }
`)

export default function Assets() {
    const [assets, set_assets] = useState([])

    useEffect(() => {
        set_assets(assetsData)
    },[])

    return (
        <PageBox
            title="Bridged Assets"
            subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
            maxWidth="lg"
            indent={58}
            header={
                <Box sx={{display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", p: 2, mt: 2}}>
                    <Typography sx={{fontWeight: "bold", color: "text.secondary"}}>Total Value Locked</Typography>
                    <span>
                        <Tooltip title="USD equivalent value of all assets locked in Rosen">
                            <InfoOutlinedIcon sx={{fontSize: "small", mr: 2, ml: 0.5, mb: "2px"}}/>
                        </Tooltip>
                    </span>
                    <Typography sx={{fontSize: "x-large", color: "primary.main"}}><NumberFormat value={11925641973211233000000000000} thousandSeparator displayType="text" prefix="$"/></Typography>
                </Box>
            }
        >
            <Card variant="outlined" sx={{mb: 5, bgcolor: "background.content"}}>
                <ContainerBox>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Symbol</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Origin Address</TableCell>
                                <TableCell>Mapping Address</TableCell>
                                <TableCell>Total Locked</TableCell>
                                <TableCell>Total Locked USD</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {assets.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.symbol}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell sx={{fontFamily: "monospace"}}>{row.originAddress}</TableCell>
                                    <TableCell sx={{fontFamily: "monospace"}}>{row.mappingAddress}</TableCell>
                                    <TableCell><NumberFormat value={row.totalLocked} thousandSeparator displayType="text"/></TableCell>
                                    <TableCell><NumberFormat value={row.totalLockedUsd} thousandSeparator displayType="text" prefix="$"/></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ContainerBox>
            </Card>
        </PageBox>
    )
}
