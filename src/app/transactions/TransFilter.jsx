import React, {Fragment} from "react";
import {Box, Divider, FormControlLabel, FormLabel, Switch} from "@mui/material";
import InputSelect from "components/InputSelect";
import BoxFlex from "components/BoxFlex";
import {useMedia} from "reducers/useMedia";

export default function ({form}) {
    const {isMobile} = useMedia()

    const sourceChains = [
        {id: "BTC", label: "Bitcoin", icon: "BTC.svg", min: 0.001},
        {id: "ETH", label: "Ethereum", icon: "ETH.svg", min: 1},
        {id: "ADA", label: "Cardano", icon: "ADA.svg", min: 10},
    ]

    return (
        <Fragment>
            <BoxFlex title="Filter transactions" sx={{bgcolor: "secondary.light"}}>
                {!isMobile && <FormLabel>From chain</FormLabel>}
                <InputSelect
                    name="network"
                    label={isMobile ? "From chain": undefined}
                    placeholder="Choose network"
                    options={sourceChains}
                    clearable
                    form={form}
                    size="small"
                    variant="standard"
                    sx={{flexGrow: 1, width: {mobile: "100%", tablet: 200}}}
                />
                {!isMobile && <FormLabel>Token</FormLabel>}
                <InputSelect
                    name="token"
                    label={isMobile ? "Token": undefined}
                    placeholder="Choose token"
                    options={sourceChains}
                    disabled={!form?.data["network"]}
                    clearable
                    form={form}
                    size="small"
                    variant="standard"
                    sx={{flexGrow: 1, width: {mobile: "100%", tablet: 200}}}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={form?.data?.onlyWithEvents||false}
                            onChange={event => form.put("onlyWithEvents",event.target.checked)}
                        />
                    }
                    label="Event Txs"
                />
                <Box flexGrow={10}/>
            </BoxFlex>
            <Divider/>
        </Fragment>
    )
}
