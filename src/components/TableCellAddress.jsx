import React, {useCallback, useMemo, useState} from "react";
import {Alert, Snackbar, TableCell} from "@mui/material";
import DisplayId from "./DisplayId";

export default function ({disableCopyOnClick=false, ...restProps}) {
    const [displayCopyAlert, set_displayCopyAlert] = useState(false)
    const value = useMemo(() => restProps.children, [restProps.children]);

    const handle_copy = useCallback(() => navigator.clipboard.writeText(value).then(() => {
        set_displayCopyAlert(true)
    }),[value])

    const handle_close_copyAlert = () => set_displayCopyAlert(false)

    return (
        <TableCell
            onClick={!disableCopyOnClick ? handle_copy : undefined}
            sx={{
                fontFamily: "monospace",
                color: theme => theme.palette.text.secondary,
                ...!disableCopyOnClick && {
                    cursor: "pointer",
                    "&:hover": {color: theme => theme.palette.text.primary}
                }
            }}
        >
            <DisplayId value={value}/>
            <Snackbar open={displayCopyAlert} autoHideDuration={1500} onClose={handle_close_copyAlert}>
                <Alert onClose={handle_close_copyAlert} severity="success">
                    Copied to clipboard.
                </Alert>
            </Snackbar>
        </TableCell>
    )
}
