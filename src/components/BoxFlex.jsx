import React, {useState} from "react";
import {Box, Collapse , IconButton, Typography} from "@mui/material";
import * as Unicons from "@iconscout/react-unicons";
import {useMedia} from "reducers/useMedia";

export default function ({title, sx, ...restProps}) {
    const {isMobile} = useMedia()
    const [expand, set_expand] = useState(isMobile)

    const toggle_expand = () => {
        set_expand(prevState => !prevState)
    }

    return (
        <Box pt={{mobile: 1, tablet: 2}} sx={sx}>
            {title && (
                <Typography onClick={toggle_expand} variant="h5" color="textSecondary" sx={{px: 2}}>
                    {title}
                    {isMobile && (
                        <IconButton>
                            {expand ? <Unicons.UilAngleUp/> : <Unicons.UilAngleDown/>}
                        </IconButton>
                    )}
                </Typography>
            )}
            <Collapse in={!isMobile || expand}>
                <Box sx={{
                    display: "flex",
                    flexDirection: {mobile: "column", tablet: "row"},
                    alignItems: {mobile: "start", tablet: "center"},
                    flexWrap: "wrap",
                    gap: {mobile: 2, tablet: 1},
                    px: 2,
                    mb: {mobile: 0, tablet: 2},
                    mt: 1,
                }} {...restProps}/>
            </Collapse>
        </Box>
    )
}
