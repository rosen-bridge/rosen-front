import {useMediaQuery, useTheme} from "@mui/material";

export function useMedia () {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
    return {
        isMobile
    }
}
