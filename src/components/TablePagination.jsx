import React from "react";
import {useMedia} from "reducers/useMedia";
import {Box, Pagination, Typography} from "@mui/material";

export default function ({pageNumber, pagesCount, startIndex, total, pageLength, handle_change_page}) {
    const {isMobile} = useMedia()
    return (
        <Box py={1} px={2} display="flex" alignItems="center" gap={1} flexDirection={isMobile?"column":"row"}>
            <Typography variant="body2" sx={{flexGrow: 1}}>
                Showing {startIndex+1} to {startIndex+pageLength} of {total} entries
            </Typography>
            <Pagination page={pageNumber} count={pagesCount} onChange={handle_change_page}/>
        </Box>
    )
}
