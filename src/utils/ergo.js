import rosen_config from "../configs/rosen.json";
import { consts } from "../configs";
import { string2uint8, unsignedErgoTxToProxy } from "../utils";

let ergolib = import("ergo-lib-wasm-browser");
const height = 0;
const minBoxValue = consts.minBoxValue;
const testnet = process.env.NETWORK === "testnet";

const getRosenBox = async (rosenValue, tokenId, amount, toChain, toAddress, fromAddress) => {
    const wasm = await ergolib;
    const networkFee = consts.networkFee;
    const bridgeFee = consts.bridgeFee;

    const rosenBox = new wasm.ErgoBoxCandidateBuilder(
        rosenValue,
        wasm.Contract.pay_to_address(
            testnet
                ? wasm.Address.from_testnet_str(rosen_config["ergo_bank_address"])
                : wasm.Address.from_mainnet_str(rosen_config["ergo_bank_address"])
        ),
        height
    );
    rosenBox.add_token(
        wasm.TokenId.from_str(tokenId),
        wasm.TokenAmount.from_i64(wasm.I64.from_str(amount.toString()))
    );
    rosenBox.set_register_value(
        wasm.NonMandatoryRegisterId.R4,
        wasm.Constant.from_coll_coll_byte([
            string2uint8(toChain.toString()),
            string2uint8(toAddress.toString()),
            string2uint8(networkFee.toString()),
            string2uint8(bridgeFee.toString()),
            string2uint8(fromAddress.toString())
        ])
    );
    return rosenBox.build();
};

const proxyTx = async (uTx, inputs) => {
    const serial = JSON.parse(uTx.to_json());
    serial.inputs = inputs.map((curIn) => {
        return {
            ...curIn,
            extension: {}
        };
    });
    return unsignedErgoTxToProxy(serial);
};

export const generateTX = async (inputs, changeAddress, toChain, toAddress, tokenId, amount) => {
    const wasm = await ergolib;
    const fee = wasm.TxBuilder.SUGGESTED_TX_FEE();
    const rosenValue = wasm.BoxValue.from_i64(wasm.I64.from_str(minBoxValue));

    const boxSelector = new wasm.SimpleBoxSelector();
    const targetBalance = wasm.BoxValue.from_i64(rosenValue.as_i64().checked_add(fee.as_i64()));
    const targetTokens = new wasm.Tokens();
    const token = new wasm.Token(
        wasm.TokenId.from_str(tokenId),
        wasm.TokenAmount.from_i64(wasm.I64.from_str(amount.toString()))
    );
    targetTokens.add(token);
    const boxSelection = boxSelector.select(
        wasm.ErgoBoxes.from_boxes_json(inputs),
        targetBalance,
        targetTokens
    );

    const rosenBox = await getRosenBox(rosenValue, tokenId, amount, toChain, toAddress, changeAddress);
    const txOutputs = new wasm.ErgoBoxCandidates(rosenBox);
    const txBuilder = wasm.TxBuilder.new(
        boxSelection,
        txOutputs,
        height,
        fee,
        testnet
            ? wasm.Address.from_testnet_str(changeAddress)
            : wasm.Address.from_mainnet_str(changeAddress)
    );

    const uTx = txBuilder.build();
    return proxyTx(uTx, inputs);
};
