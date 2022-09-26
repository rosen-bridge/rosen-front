export class Nautilus {
    constructor() {
        this.context = null;
    }

    async getContext() {
        if (!(await this.isConnected())) {
            alert("Please connect to Nautilus first");
            return;
        }
        if (this.context == null) {
            console.log("Getting...");
            this.context = await window.ergoConnector.nautilus.getContext();
        }
        return this.context;
    }

    async connect() {
        const granted = await window.ergoConnector?.nautilus?.connect({
            createErgoObject: false
        });

        if (!granted) {
            alert("Failed to connect!");
            return false;
        }
        return true;
    }

    async isConnected() {
        return window.ergoConnector?.nautilus?.isConnected();
    }

    async getBalance(token) {
        const context = await this.getContext();
        return context.get_balance(token);
    }

    async getUtxos(amount, token) {
        const context = await this.getContext();
        return context.get_utxos(amount, token);
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
