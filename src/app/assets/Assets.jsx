import React from "react"
import {TableCell, Typography, Box, Card, Tooltip} from "@mui/material";
import NumberFormat from 'react-number-format';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PageLayout from "layouts/PageLayout";
import TablePro from "components/TablePro";
import AssetRow from "./AssetRow";

export default function Assets() {

    const get_assets = (payload) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const res = {
                "data": [
                    {"tokenName":"erg","tokenId":"erg","bankAddress":"nB3L2PD3JXHPkNza7R4acW1bLX4tWLU8ou6rvFZnVnmu9SUMA57RFsnE9u5ZF9hKbox893JPvxqTZwmg4HxkgNNr5Z5fu4oycyErt8B7Q9UXbBLSvNtxerJT5uL3yBGksCtJGpyaMZzjf","lockedAmount":"209099634000","coldLockedAmount":"0","tokenNetwork":"ergo","tokenType":"ERG"},
                    {"tokenName":"COMET","tokenId":"0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b","bankAddress":"nB3L2PD3JXHPkNza7R4acW1bLX4tWLU8ou6rvFZnVnmu9SUMA57RFsnE9u5ZF9hKbox893JPvxqTZwmg4HxkgNNr5Z5fu4oycyErt8B7Q9UXbBLSvNtxerJT5uL3yBGksCtJGpyaMZzjf","lockedAmount":"2765699","coldLockedAmount":"0","tokenNetwork":"ergo","tokenType":"EIP-004"},
                    {"tokenName":"HOSKY","tokenId":"asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9","bankAddress":"addr1v9f6u4cy7n59gd3vezcgkhsz988unx9jxamfawjkz4apqmqtwafc2","lockedAmount":"4522401803","coldLockedAmount":"0","tokenNetwork":"cardano","tokenType":"CIP26"},
                    {"tokenName":"ADA","tokenId":"lovelace","bankAddress":"addr1v9f6u4cy7n59gd3vezcgkhsz988unx9jxamfawjkz4apqmqtwafc2","lockedAmount":"1124990587","coldLockedAmount":"0","tokenNetwork":"cardano","tokenType":"ADA"}
                ],
                "total": 4,
            }
            resolve(res)
        },500)
    })

    return (
        <PageLayout
            title="Bridge Assets"
            subtitle="All assets currently locked in Rosen"
        >
            <Box sx={{display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", p: 2, mt: 2}}>
                <Typography sx={{fontWeight: "bold", color: "text.secondary"}}>Total Value Locked</Typography>
                <span>
                        <Tooltip title="USD equivalent value of all assets locked in Rosen">
                            <InfoOutlinedIcon sx={{fontSize: "small", mr: 2, ml: 0.5, mb: "2px"}}/>
                        </Tooltip>
                    </span>
                <Typography sx={{fontSize: "x-large", color: "primary.main", wordBreak: "break-all"}}><NumberFormat value={11925641973211233000000000000} thousandSeparator displayType="text" prefix="$"/></Typography>
            </Box>

            <Card>
                <TablePro onGet={get_assets} Row={<AssetRow/>}>
                    <TableCell width={120}>Asset Name</TableCell>
                    <TableCell width={250}>Asset ID</TableCell>
                    <TableCell width={120}>Asset Type</TableCell>
                    <TableCell width={120}>Network</TableCell>
                    <TableCell width={250}>Bank Address	</TableCell>
                    <TableCell width={120} align="right">Locked Amount</TableCell>
                    <TableCell width={120} align="right">Cold Locked</TableCell>
                </TablePro>
            </Card>
        </PageLayout>
    )
}
