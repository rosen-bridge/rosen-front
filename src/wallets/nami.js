export const connectNami = async () => {
    const granted = await window.cardano?.nami?.enable();

    if (!granted) {
        alert("Failed to connect!");
        return false;
    }
    return true;
};

export const checkNamiConnected = async () => {
    return window.cardano?.nami?.isEnabled();
};

export const getNamiBalance = async (token) => {
    if (!(await checkNamiConnected())) {
        alert("Please connect to Nami first");
        return;
    }
    const API = await window.cardano.nami.enable();
    return await API.getBalance();
};
