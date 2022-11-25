import { consts } from "../configs";
import { fixedDecimals } from "../utils";

const minBoxValue = consts.minBoxValue;
const feeString = consts.ergoFee;

export class Nautilus {
    constructor() {
        this.context = null;
    }

    async getContext() {
        if (!(await this.isConnected())) {
            console.error("Failed to connect!");
            return;
        }
        if (this.context == null) {
            this.context = await window.ergoConnector.nautilus.getContext();
        }
        return this.context;
    }

    async connect() {
        const granted = await window.ergoConnector?.nautilus?.connect({
            createErgoObject: false
        });

        if (!granted) {
            console.error("Failed to connect!");
            return false;
        }
        return true;
    }

    async isConnected() {
        return window.ergoConnector?.nautilus?.isConnected();
    }

    async getBalance(token) {
        const context = await this.getContext();
        if (token === "erg") {
            const amount = (await context.get_balance()) / Math.pow(10, 9);
            return fixedDecimals(amount, 2);
        }
        return context.get_balance(token);
    }

    async getUtxos(amount, token) {
        const context = await this.getContext();
        const tokenId = token === consts.ergTokenName ? consts.ergTokenNameEIP12 : token;
        const tokenUTXOs = await context.get_utxos(amount, tokenId);
        const minErgRequired = 2 * Number(minBoxValue) + Number(feeString);
        let ergAmount = 0;
        const boxIds = [];
        for (const box of tokenUTXOs) {
            ergAmount += Number(box.value);
            boxIds.push(box.boxId);
        }
        if (ergAmount < minErgRequired) {
            let extraUTXOs = await context.get_utxos(minErgRequired, "ERG");
            extraUTXOs = extraUTXOs.filter((box) => {
                return boxIds.indexOf(box.boxId) === -1;
            });
            tokenUTXOs.push(...extraUTXOs);
        }
        return tokenUTXOs;
    }

    async getChangeAddress() {
        const context = await this.getContext();
        return context.get_change_address();
    }

    async signTX(tx) {
        const context = await this.getContext();
        return context.sign_tx(tx);
    }

    async submitTx(tx) {
        const context = await this.getContext();
        return context.submit_tx(tx);
    }
}
