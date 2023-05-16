import React from "react";
import {Box, Typography} from "@mui/material";

export default function DisplayId({value, endingSize = 6, sx, ...restProps}) {
    const cutIndex = value.length - endingSize;
    const valueStart = value.substring(0, cutIndex);
    const valueEnd = value.substring(cutIndex);
    return (
        <Box display="flex" sx={sx}>
            <Typography noWrap {...restProps} sx={{ flexGrow: 0, fontSize: "inherit", fontFamily: "inherit", color: "inherit", marginRight: "-3px" }}>
                {valueStart}
            </Typography>
            <Typography noWrap {...restProps} sx={{ flexShrink: 0, fontSize: "inherit", fontFamily: "inherit" }}>
                {valueEnd}
            </Typography>
        </Box>
    )
}
