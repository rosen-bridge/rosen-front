import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function AlertDialog({
    open,
    onClose,
    onProceed,
    title,
    text,
    closeText,
    proceedText,
    link,
    linkText
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <span>{text}</span>
                    <br />
                    {link && link.trim() !== "" && (
                        <a href={link} target="_blank" rel="noreferrer">
                            {linkText}
                        </a>
                    )}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onProceed} autoFocus disabled={proceedText === ""}>
                    {proceedText}
                </Button>
                <Button onClick={onClose}>{closeText}</Button>
            </DialogActions>
        </Dialog>
    );
}
