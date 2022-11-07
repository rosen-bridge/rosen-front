import ergoContract from "../configs/contract-ergo.json";
import { consts } from "../configs";
import { string2uint8, unsignedErgoTxToProxy } from "../utils";
import { default as ergoExplorer } from "../explorer/ergo";

let ergolib = import("ergo-lib-wasm-browser");
const minBoxValue = consts.minBoxValue;
const feeString = consts.ergoFee;

const getChangeBox = async (height, inputs, changeAddress, tokenId, tokenAmount) => {
    const wasm = await ergolib;
    let sumValue = wasm.I64.from_str("0");
    const tokenMap = new Map();
    for (const box of inputs) {
        sumValue = sumValue.checked_add(wasm.I64.from_str(box.value));
        for (const asset of box.assets) {
            if (tokenMap.has(asset.tokenId)) {
                tokenMap.set(
                    asset.tokenId,
                    tokenMap.get(asset.tokenId).checked_add(wasm.I64.from_str(asset.amount))
                );
            } else {
                tokenMap.set(asset.tokenId, wasm.I64.from_str(asset.amount.toString()));
            }
        }
    }
    const otherBoxesValue = -1 * (Number(minBoxValue) + Number(feeString));
    sumValue = sumValue.checked_add(wasm.I64.from_str(otherBoxesValue.toString()));
    if (tokenMap.get(tokenId).to_str() === tokenAmount.toString()) {
        tokenMap.delete(tokenId);
    } else {
        tokenMap.set(
            tokenId,
            tokenMap.get(tokenId).checked_add(wasm.I64.from_str((-1 * tokenAmount).toString()))
        );
    }

    const changeBox = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(sumValue),
        wasm.Contract.pay_to_address(wasm.Address.from_base58(changeAddress)),
        height
    );
    tokenMap.forEach((amount, tokenId) => {
        changeBox.add_token(wasm.TokenId.from_str(tokenId), wasm.TokenAmount.from_i64(amount));
    });
    return changeBox.build();
};

const getRosenBox = async (
    height,
    rosenValue,
    tokenId,
    amount,
    toChain,
    toAddress,
    fromAddress,
    networkFee,
    bridgeFee
) => {
    const wasm = await ergolib;

    const rosenBox = new wasm.ErgoBoxCandidateBuilder(
        rosenValue,
        wasm.Contract.pay_to_address(wasm.Address.from_base58(ergoContract["addresses"]["lock"])),
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

export const generateTX = async (
    inputs,
    changeAddress,
    toChain,
    toAddress,
    tokenId,
    amount,
    networkFee,
    bridgeFee
) => {
    const wasm = await ergolib;
    const height = await ergoExplorer.getHeight();
    const rosenValue = wasm.BoxValue.from_i64(wasm.I64.from_str(minBoxValue));
    const rosenBox = await getRosenBox(
        height,
        rosenValue,
        tokenId,
        amount,
        toChain,
        toAddress,
        changeAddress,
        networkFee,
        bridgeFee
    );
    const changeBox = await getChangeBox(height, inputs, changeAddress, tokenId, amount);
    const feeBox = wasm.ErgoBoxCandidate.new_miner_fee_box(
        wasm.BoxValue.from_i64(wasm.I64.from_str(feeString)),
        height
    );

    const txOutputs = new wasm.ErgoBoxCandidates(rosenBox);
    txOutputs.add(changeBox);
    txOutputs.add(feeBox);

    const inputIds = inputs.map((input) => input.boxId);
    const unsignedInputArray = inputIds
        .map(wasm.BoxId.from_str)
        .map(wasm.UnsignedInput.from_box_id);
    const unsignedInputs = new wasm.UnsignedInputs();
    unsignedInputArray.forEach((i) => unsignedInputs.add(i));

    const uTx = new wasm.UnsignedTransaction(unsignedInputs, new wasm.DataInputs(), txOutputs);

    return proxyTx(uTx, inputs);
};
