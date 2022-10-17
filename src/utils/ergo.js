import rosen_config from "../configs/rosen.json";
import { consts } from "../configs";
import { string2uint8, unsignedErgoTxToProxy } from "../utils";

let ergolib = import("ergo-lib-wasm-browser");
const height = 0;
const minBoxValue = consts.minBoxValue;
const feeString = consts.ergoFee;
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

const proxyTx = async (uTx, inputs, targetTokenId) => {
    const serial = JSON.parse(uTx.to_json());
    let totalInputTokens = 0;
    for (const input of inputs) {
        let totalBoxTokens = 0;
        for (const token of input.assets) {
            if (token.tokenId === targetTokenId) {
                totalBoxTokens += Number(token.amount);
            }
        }
        totalInputTokens += totalBoxTokens;
    }
    let totalOutputTokens = serial.outputs[0].assets[0].amount;
    for (const token of serial.outputs[1].assets) {
        if (token.tokenId === targetTokenId) {
            totalOutputTokens += Number(token.amount);
        }
    }
    if (totalInputTokens !== totalOutputTokens) {
        let burningAmount = totalInputTokens - totalOutputTokens;
        const newChangeBoxAssets = serial.outputs[1].assets.map((asset) => {
            if (asset.tokenId === targetTokenId) {
                asset.amount = Number(asset.amount) + burningAmount;
                burningAmount = 0;
            }
            return asset;
        });
        serial.outputs[1].assets = newChangeBoxAssets;
    }
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
    const rosenValue = wasm.BoxValue.from_i64(wasm.I64.from_str(minBoxValue));
    const fee = wasm.BoxValue.from_i64(wasm.I64.from_str(feeString));
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

    const rosenBox = await getRosenBox(
        rosenValue,
        tokenId,
        amount,
        toChain,
        toAddress,
        changeAddress
    );
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
    return proxyTx(uTx, inputs, tokenId);
};
