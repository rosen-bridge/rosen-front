export class Nami {
    constructor() {
        this.API = null;
    }

    async connect() {
        const granted = await window.cardano?.nami?.enable();

        if (!granted) {
            alert("Failed to connect!");
            return false;
        }
        this.API = granted;
        return true;
    }

    async getAPI() {
        if (!(await this.isConnected())) {
            alert("Please connect to Nami first");
            return;
        }
        if (this.API == null) {
            this.API = await window.cardano.nami.enable();
        }
        return this.API;
    }

    async isConnected() {
        return window.cardano?.nami?.isEnabled();
    }

    async getBalance(token) {
      const API = await this.getAPI();
      return API.getBalance();
    }
}
