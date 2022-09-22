import rosen_config from "../configs/rosen.json";
import { consts } from "../configs";

let ergolib = import("ergo-lib-wasm-browser");

export const generateTX = async (inputs, changeAddress, toChain, toAddress, tokenId, amount) => {
    const wasm = await ergolib;
    const fee = consts.fee;
    const minBoxValue = consts.minBoxValue;
    const height = 0;

    const rosenBox = new wasm.ErgoBoxCandidateBuilder(
        wasm.BoxValue.from_i64(wasm.I64.from_str(minBoxValue)),
        wasm.Contract.pay_to_address(rosen_config["bank_address"]),
        height
    );
    rosenBox.set_register_value(
        wasm.NonMandatoryRegisterId.R4,
        wasm.Constant.from_js({
            toChain,
            toAddress,
            networkFee: consts.fee,
            bridgeFee: consts.fee
        })
    );
    rosenBox.add_token(tokenId, amount);

    //TODO: Create changebox

    const feeBox = wasm.ErgoBoxCandidate.new_miner_fee_box(
        wasm.BoxValue.from_i64(wasm.I64.from_str(fee.toString())),
        height
    );

    // Create tx
    const unsignedInputArray = inputs
        .map((b) => b.boxId)
        .map(wasm.BoxId.from_str)
        .map(wasm.UnsignedInput.from_box_id);

    const unsignedInputs = new wasm.UnsignedInputs();
    unsignedInputArray.forEach((i) => unsignedInputs.add(i));

    const outputs = new wasm.ErgoBoxCandidates(rosenBox);
    outputs.add(feeBox);
};
