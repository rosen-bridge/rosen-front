export function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = "";
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

export function string2uint8(str) {
    return new Uint8Array(str.split("").map((letter) => letter.charCodeAt(0)));
}

export function tokenAmountToProxy(tokenAmount) {
    return {
        ...tokenAmount,
        amount: tokenAmount.amount.toString()
    };
}

export function unsignedInputToProxy(input) {
    return {
        ...input,
        value: input.value.toString(),
        assets: input.assets.map((a) => tokenAmountToProxy(a))
    };
}

export function ergoBoxCandidateToProxy(box) {
    return {
        ...box,
        value: box.value.toString(),
        assets: box.assets.map((a) => tokenAmountToProxy(a))
    };
}

export function unsignedErgoTxToProxy(tx) {
    return {
        ...tx,
        inputs: tx.inputs.map((i) => unsignedInputToProxy(i)),
        outputs: tx.outputs.map((o) => ergoBoxCandidateToProxy(o))
    };
}
