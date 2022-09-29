import { HexToAscii } from "../utils";
import AssetFingerprint from "@emurgo/cip14-js";
let adalib = import("@emurgo/cardano-serialization-lib-browser");

export class Nami {
    constructor() {
        this.API = null;
        this.ADA = null;
    }

    async getADALib() {
        if (!this.ADA) {
            this.ADA = await adalib;
        }
        return this.ADA;
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

    async getNetworkId() {
        const API = await this.getAPI();
        let networkId = await API.getNetworkId();
        return {
            id: networkId,
            network: networkId === 1 ? "mainnet" : "testnet"
        };
    }

    async getUtxos(amount, token) {
        const API = await this.getAPI();
        return API.getUtxos();
    }

    async getBalance() {
        const API = await this.getAPI();
        const ADA = await this.getADALib();

        const balanceCBORHex = await API.getBalance();
        const value = ADA.Value.from_bytes(Buffer.from(balanceCBORHex, "hex"));
        console.log(value.coin().to_str());
        console.log(value.multiasset());
        const utxos = await this.getUtxos();
        const parsedUtxos = utxos.map((utxo) =>
            ADA.TransactionUnspentOutput.from_bytes(Buffer.from(utxo, "hex"))
        );
        console.log(parsedUtxos);

        const assets = [];
        if (value.multiasset()) {
            const multiAssets = value.multiasset().keys();
            for (let j = 0; j < multiAssets.len(); j++) {
                const policy = multiAssets.get(j);
                const policyAssets = value.multiasset().get(policy);
                const assetNames = policyAssets.keys();
                for (let k = 0; k < assetNames.len(); k++) {
                    const policyAsset = assetNames.get(k);
                    const quantity = policyAssets.get(policyAsset);
                    const asset =
                        Buffer.from(policy.to_bytes(), "hex").toString("hex") +
                        Buffer.from(policyAsset.name(), "hex").toString("hex");
                    const _policy = asset.slice(0, 56);
                    const _name = asset.slice(56);
                    const fingerprint = new AssetFingerprint(
                        Buffer.from(_policy, "hex"),
                        Buffer.from(_name, "hex")
                    ).fingerprint();
                    assets.push({
                        unit: asset,
                        quantity: quantity.to_str(),
                        policy: _policy,
                        name: HexToAscii(_name),
                        fingerprint
                    });
                }
            }
        }
        return 10;
    }
}
