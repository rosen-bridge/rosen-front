import React, {useMemo} from "react";
import {TableCell} from "@mui/material";
import {useMedia} from "reducers/useMedia";

export default function (props) {
    const {isMobile} = useMedia()

    const value = useMemo(() => {
        const value = props.children
        const number = typeof value === "number" ? value : Number(value)
        return number.toLocaleString()
    }, [props.children]);

    return (
        <TableCell align={isMobile ? "left" : "right" }>{value}</TableCell>
    )
}
