import rosen_config from "../configs/rosen.json";
import { consts } from "../configs";

let ergolib = import('ergo-lib-wasm-browser');

export const generateTX = async (inputIds, change_address) => {
  const wasm = await ergolib;
  const fee = consts.fee;
  const minBoxValue = consts.minBoxValue;
  const height = 0;

  const rosenBox = new wasm.ErgoBoxCandidateBuilder(
    wasm.BoxValue.from_i64(wasm.I64.from_str(minBoxValue)),
    wasm.Contract.pay_to_address(rosen_config["bank_address"]),
    height
  );
  
  //TODO: Create changebox

  const feeBox = wasm.ErgoBoxCandidate.new_miner_fee_box(
    wasm.BoxValue.from_i64(wasm.I64.from_str(fee.toString())),
    height
  );


}
