import React, {useMemo, useRef, useState} from 'react';
import {Avatar, Box, IconButton, InputAdornment, MenuItem, Menu, ListItemText, TextField, ListItemAvatar} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';

const ICON_SIZE = 24;

export default function InputSelect({form, options, name, label, placeholder, clearable=false, disabled, map={label: "label", icon: "icon"}, size="medium", variant, InputSx, ...restProps}) {
    const anchorRef = useRef()
    const [menuDisplay, set_menuDisplay] = useState(false);

    const [value={}, selectedIndex] = useMemo(() => (
        [form?.data[name], options.findIndex(i => i === form?.data[name])]
    ), [form?.data[name]])

    function handle_click_item(event, index) {
        form.put(name, options[index])
        handle_close_menu()
    }
    function handle_clear_value(event) {
        event.stopPropagation()
        form.put(name, undefined)
    }
    function handle_open_menu() {
        set_menuDisplay(true)
    }
    function handle_close_menu() {
        set_menuDisplay(false)
    }

    return (
        <Box {...restProps}>
            <TextField
                ref={anchorRef}
                value={value[map.label] || ""}
                label={label}
                InputProps={{
                    readOnly: true,
                    sx: {
                        ...InputSx,
                        transition: "0.1s",
                        ...menuDisplay && ({
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0
                        })
                    },
                    ...(value[map.icon] && {startAdornment: (
                        <InputAdornment position="start">
                            <Avatar src={`/static/images/${value[map.icon]}`} sx={{width: ICON_SIZE, height: ICON_SIZE}}/>
                        </InputAdornment>
                    )}),
                    endAdornment: (
                        <InputAdornment position="end">
                            {clearable && value[map.label] && (
                                <IconButton onClick={handle_clear_value} size={size} disabled={disabled}><CloseIcon fontSize={size}/></IconButton>
                            )}
                            <IconButton size={size} disabled={disabled}><ArrowDropDownIcon fontSize={size}/></IconButton>
                        </InputAdornment>
                    )
                }}
                inputProps={{tabIndex: -1,}}
                onClick={disabled ? null : handle_open_menu}
                disabled={disabled}
                placeholder={placeholder}
                variant={variant}
                fullWidth
            />
            <Menu
                anchorEl={anchorRef.current}
                open={menuDisplay}
                onClose={handle_close_menu}
                sx={{'& .MuiPaper-root': {
                    width: anchorRef?.current?.offsetWidth,
                    borderTopRightRadius: 0,
                    borderTopLeftRadius: 0
                }}}
            >
                {options.map((option, index) => (
                    <MenuItem
                        key={index}
                        selected={index === selectedIndex}
                        onClick={(event) => handle_click_item(event, index)}
                    >
                        <ListItemAvatar>
                            <Avatar src={`/static/images/${option[map.icon]}`} sx={{width: ICON_SIZE, height: ICON_SIZE}}/>
                        </ListItemAvatar>
                        <ListItemText primary={option[map.label]} />
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
