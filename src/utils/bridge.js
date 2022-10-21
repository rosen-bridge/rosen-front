import { ascii2hex, generateTX, generateAdaTX, getAux } from ".";

export const connectToWallet = async (sourceChain, ergoWallet, cardanoWallet) => {
    if (sourceChain === "ERG") {
        const connected = await ergoWallet.connect();
        if (connected) {
            return 0;
        } else {
            return 1;
        }
    } else if (sourceChain === "ADA") {
        const connected = await cardanoWallet.connect();
        if (connected) {
            return 0;
        } else {
            return 1;
        }
    } else {
        return -1;
    }
};

export const transfer = async (
    sourceChain,
    wallet,
    amount,
    tokenId,
    targetId,
    address,
    targetLabel = ""
) => {
    if (sourceChain === "ERG") {
        let uTxos;
        try {
            uTxos = await wallet.getUtxos(amount, tokenId);
        } catch (e) {
            console.error(e);
            throw new Error("Failed to get UTXOs");
        }
        const changeAddress = await wallet.getChangeAddress();
        const uTx = await generateTX(uTxos, changeAddress, targetId, address, tokenId, amount);
        try {
            const signedTx = await wallet.signTX(uTx);
            const result = await wallet.submitTx(signedTx);
            return result;
        } catch (e) {
            console.error(e);
            throw new Error(e.info);
        }
    } else if (sourceChain === "ADA") {
        let utxos;
        try {
            utxos = await wallet.getUtxos();
        } catch (e) {
            console.error(e);
            throw new Error("Failed to get UTXOs");
        }
        const userAddress = await wallet.getChangeAddress();
        const toAddress = address;
        const txBody = await generateAdaTX(
            userAddress,
            ascii2hex(targetLabel),
            tokenId,
            amount,
            utxos,
            toAddress
        );
        try {
            const result = await wallet.signAndSubmitTx(
                txBody,
                await getAux(toAddress, userAddress)
            );
            return result;
        } catch (e) {
            throw new Error(e.info);
        }
    }
};
