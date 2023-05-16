import React, {Fragment, useState} from "react";
import * as Unicons from "@iconscout/react-unicons";
import {Button, TableCell, TableRow} from "@mui/material";
import TableCellAddress from "components/TableCellAddress";
import {useMedia} from "reducers/useMedia";

export default function (row) {
    const {isMobile} = useMedia()
    const [expand, set_expand] = useState(false)

    const toggle_expand = () => {
        set_expand(prevState => !prevState)
    }

    if (isMobile) return (
        <Fragment>
            <TableRow className="divider">
                <TableCell width="40%">ID</TableCell>
                <TableCell width="60%">{row.observationId}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell>From chain</TableCell>
                <TableCell>{row.fromChain}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell>To chain</TableCell>
                <TableCell>{row.toChain}</TableCell>
            </TableRow>
            {expand && <>
                <TableRow>
                    <TableCell>From Address</TableCell>
                    <TableCellAddress>{row.fromAddress}</TableCellAddress>
                </TableRow>
                <TableRow>
                    <TableCell>To Address</TableCell>
                    <TableCellAddress>{row.toAddress}</TableCellAddress>
                </TableRow>
                <TableRow>
                    <TableCell>Token</TableCell>
                    <TableCellAddress>{row.sourceChainTokenId}</TableCellAddress>
                </TableRow>
                <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>{Number(row.amount).toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Creation Height</TableCell>
                    <TableCell>{row.creationHeight.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Bridge fee</TableCell>
                    <TableCell>{Number(row.bridgeFee).toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Network fee</TableCell>
                    <TableCell>{Number(row.networkFee).toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>{row.status}</TableCell>
                </TableRow>
            </>}
            <TableRow>
                <TableCell padding="none" >
                    <Button
                        variant="text"
                        onClick={toggle_expand}
                        sx={{fontSize: "inherit"}}
                        endIcon={expand ? <Unicons.UilAngleUp/> : <Unicons.UilAngleDown/>}
                    >
                        {expand ? "Show less" : "Show more"}
                    </Button>
                </TableCell>
                <TableCell/>
            </TableRow>
        </Fragment>
    )
    return (
        <Fragment>
            <TableRow className="divider">
                <TableCell>{row.observationId}</TableCell>
                <TableCell>{row.fromChain}</TableCell>
                <TableCell>{row.toChain}</TableCell>
                <TableCellAddress>{row.fromAddress}</TableCellAddress>
                <TableCellAddress>{row.toAddress}</TableCellAddress>
                <TableCellAddress>{row.sourceChainTokenId}</TableCellAddress>
                <TableCell align="right">{Number(row.amount).toLocaleString()}</TableCell>
                <TableCell align="right">{row.creationHeight.toLocaleString()}</TableCell>
                <TableCell align="right">{Number(row.bridgeFee).toLocaleString()}</TableCell>
                <TableCell align="right">{Number(row.networkFee).toLocaleString()}</TableCell>
                <TableCell>{row.status}</TableCell>
            </TableRow>
        </Fragment>
    )
}
