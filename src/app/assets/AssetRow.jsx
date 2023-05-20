import React, {Fragment, useState} from "react";
import * as Unicons from "@iconscout/react-unicons";
import {Button, TableCell, TableRow} from "@mui/material";
import TableCellAddress from "components/TableCellAddress";
import TableCellNumber from "components/TableCellNumber";
import {useMedia} from "reducers/useMedia";

export default function AssetRow(row) {
    const {isMobile} = useMedia()
    const [expand, set_expand] = useState(false)

    const toggle_expand = () => {
        set_expand(prevState => !prevState)
    }

    if (isMobile) return (
        <Fragment>
            <TableRow className="divider">
                <TableCell width="40%">Asset Name</TableCell>
                <TableCell width="60%">{row.tokenName}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell>Asset ID</TableCell>
                <TableCellAddress>{row.tokenId}</TableCellAddress>
            </TableRow>
            <TableRow>
                <TableCell>Asset Type</TableCell>
                <TableCell>{row.tokenType}</TableCell>
            </TableRow>
            {expand && <>
                <TableRow>
                    <TableCell>Network</TableCell>
                    <TableCell>{row.tokenNetwork}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Bank Address</TableCell>
                    <TableCellAddress>{row.bankAddress}</TableCellAddress>
                </TableRow>
                <TableRow>
                    <TableCell>Locked Amount</TableCell>
                    <TableCellNumber>{row.lockedAmount}</TableCellNumber>
                </TableRow>
                <TableRow>
                    <TableCell>Cold Locked</TableCell>
                    <TableCellNumber>{row.coldLockedAmount}</TableCellNumber>
                </TableRow>
            </>}
            <TableRow>
                <TableCell padding="none" >
                    <Button
                        variant="text"
                        onClick={toggle_expand}
                        sx={{fontSize: "inherit", px: 2}}
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
                <TableCell>{row.tokenName}</TableCell>
                <TableCellAddress>{row.tokenId}</TableCellAddress>
                <TableCell>{row.tokenType}</TableCell>
                <TableCell>{row.tokenNetwork}</TableCell>
                <TableCellAddress>{row.bankAddress}</TableCellAddress>
                <TableCellNumber>{row.lockedAmount}</TableCellNumber>
                <TableCellNumber>{row.coldLockedAmount}</TableCellNumber>
            </TableRow>
        </Fragment>
    )
}
