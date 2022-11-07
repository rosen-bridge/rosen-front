import * as React from "react";
import NumberFormat from "react-number-format";
import TextField from "@mui/material/TextField";
import { Box, InputAdornment } from "@mui/material";

const NumberFormatCustom = React.forwardRef(function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
        <NumberFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.floatValue
                    }
                });
            }}
            style={{ direction: "ltr" }}
        />
    );
});

export default function InputText({
    form,
    type = "text",
    name,
    label,
    disabled,
    required,
    readOnly,
    startAdornment,
    endAdornment,
    numberProps,
    placeholder,
    error,
    helperText,
    ...restProps
}) {
    const value = form.data[name] || "";

    function handle_change(e) {
        form.put(name, e.target.value);
    }

    return (
        <Box {...restProps}>
            <TextField
                autoComplete='off'
                label={label}
                value={value}
                onChange={handle_change}
                multiline={type === "textarea"}
                rows={3}
                placeholder={placeholder}
                helperText={helperText}
                error={error}
                fullWidth
                inputProps={{
                    readOnly,
                    required,
                    ...numberProps
                }}
                disabled={disabled}
                InputProps={{
                    ...(type === "number" && { inputComponent: NumberFormatCustom }),
                    ...(startAdornment && {
                        startAdornment: (
                            <InputAdornment position="start">{startAdornment}</InputAdornment>
                        )
                    }),
                    ...(endAdornment && {
                        endAdornment: <InputAdornment position="end">{endAdornment}</InputAdornment>
                    })
                }}
            />
        </Box>
    );
}
