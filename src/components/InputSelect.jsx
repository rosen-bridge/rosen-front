import React, {useMemo, useRef, useState} from 'react';
import {Avatar, Box, IconButton, InputAdornment, MenuItem, Menu, ListItemText, TextField, ListItemAvatar} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function InputSelect({form, options, name, label, disabled, map={label: "label", icon: "icon"}, ...restProps}) {
    const anchorRef = useRef()
    const [menuDisplay, set_menuDisplay] = useState(false);

    const [value={}, selectedIndex] = useMemo(() => (
        [form.data[name], options.findIndex(i => i === form.data[name])]
    ), [form.data[name]])

    function handle_click_item(event, index) {
        form.put(name, options[index])
        handle_close_menu()
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
                    ...(value[map.icon] && {startAdornment: (
                        <InputAdornment position="start">
                            <Avatar src={`/static/images/${value[map.icon]}`}/>
                        </InputAdornment>
                    )}),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton><ArrowDropDownIcon/></IconButton>
                        </InputAdornment>
                    )
                }}
                onClick={disabled ? null : handle_open_menu}
                disabled={disabled}
                fullWidth
            />
            <Menu
                // id="lock-menu"
                anchorEl={anchorRef.current}
                open={menuDisplay}
                onClose={handle_close_menu}
                // MenuListProps={{
                //     'aria-labelledby': 'lock-button',
                //     role: 'listbox',
                // }}
                sx={{'& .MuiPaper-root': {width: anchorRef?.current?.offsetWidth}}}
            >
                {options.map((option, index) => (
                    <MenuItem
                        key={index}
                        // disabled={index === 0}
                        selected={index === selectedIndex}
                        onClick={(event) => handle_click_item(event, index)}
                    >
                        <ListItemAvatar>
                            <Avatar src={`/static/images/${option[map.icon]}`}/>
                        </ListItemAvatar>
                        <ListItemText primary={option[map.label]} />
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
