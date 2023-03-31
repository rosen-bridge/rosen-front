/* global BigInt */

export function hex2ascii(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = "";
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

export function ascii2hex(str) {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n++) {
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join("");
}

export function string2uint8(str) {
    return new Uint8Array(str.split("").map((letter) => letter.charCodeAt(0)));
}

export function tokenAmountToProxy(tokenAmount) {
    return {
        ...tokenAmount,
        amount: BigInt(tokenAmount.amount).toString()
    };
}

export function unsignedInputToProxy(input) {
    return {
        ...input,
        value: BigInt(input.value).toString(),
        assets: input.assets.map((a) => tokenAmountToProxy(a))
    };
}

export function ergoBoxCandidateToProxy(box) {
    return {
        ...box,
        value: BigInt(box.value).toString(),
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

export function HexToBuffer(string) {
    return Buffer.from(string, "hex");
}

export function HexToAscii(string) {
    return HexToBuffer(string).toString("ascii");
}

export function fixedDecimals(number, decimals) {
    return Math.trunc(Number(number) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function countDecimals(number) {
    if (Math.floor(number) === number) return 0;
    return number.toString().split(".")[1].length || 0;
}

export function shortenString(str) {
    if (str.length <= 20) {
        return str;
    }

    const firstChars = str.substring(0, 10);
    const lastChars = str.substring(str.length - 10);

    return `${firstChars}...${lastChars}`;
}
