export const connectNautilus = async () => {
    const granted = await window.ergoConnector?.nautilus?.connect({
        createErgoObject: false
    });

    if (!granted) {
        alert("Failed to connect!");
        return false;
    }
    return true;
};

export const checkNautilusConnected = async () => {
    return window.ergoConnector?.nautilus?.isConnected();
};

export const getBalance = async (token) => {
    if (!(await checkNautilusConnected())) {
        alert("Please connect to Nautilus first");
        return;
    }
    const context = await window.ergoConnector.nautilus.getContext();
    return context.get_balance(token);
};

export const getUtxos = async (amount, token) => {
    if (!(await checkNautilusConnected())) {
        alert("Please connect to Nautilus first");
        return;
    }
    const context = await window.ergoConnector.nautilus.getContext();
    return context.get_utxos(amount, token);
};

export const getChangeAddress = async () => {
    if (!(await checkNautilusConnected())) {
        alert("Please connect to Nautilus first");
        return;
    }
    const context = await window.ergoConnector.nautilus.getContext();
    return context.get_change_address();
};

export const signTX = async (tx) => {
    if (!(await checkNautilusConnected())) {
        alert("Please connect to Nautilus first");
        return;
    }
    const context = await window.ergoConnector.nautilus.getContext();
    return context.sign_tx(tx);
};

export const submitTx = async (tx) => {
    if (!(await checkNautilusConnected())) {
        alert("Please connect to Nautilus first");
        return;
    }
    const context = await window.ergoConnector.nautilus.getContext();
    return context.submit_tx(tx);
};
