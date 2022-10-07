import { HexToAscii } from "../utils";
import adaLoader from "../utils/cardanoLoader";
import AssetFingerprint from "@emurgo/cip14-js";

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

    async getNetworkId() {
        const API = await this.getAPI();
        const networkId = await API.getNetworkId();
        return networkId;
    }

    async getUtxos() {
        const API = await this.getAPI();
        return API.getUtxos();
    }

    async getBalance(fingerprint) {
        const API = await this.getAPI();
        const ADA = await adaLoader.load();

        const balanceCBORHex = await API.getBalance();
        const value = ADA.Value.from_bytes(Buffer.from(balanceCBORHex, "hex"));

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
                    const fingerprint = AssetFingerprint.fromParts(
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
        const balance = assets.reduce((acc, asset) => {
            return acc + (asset.fingerprint === fingerprint ? Number(asset.quantity) : 0);
        }, 0);

        return balance;
    }

    async getChangeAddress() {
        const API = await this.getAPI();
        const adaLib = await adaLoader.load();
        const raw = await API.getChangeAddress();
        const changeAddress = adaLib.Address.from_bytes(Buffer.from(raw, "hex")).to_bech32();
        return changeAddress;
    }

    async signAndSubmitTx(txBody, aux) {
        const API = await this.getAPI();
        const adaLib = await adaLoader.load();

        const transactionWitnessSet = adaLib.TransactionWitnessSet.new();
        const tx = adaLib.Transaction.new(
            txBody,
            adaLib.TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
            aux
        );

        let txVkeyWitnesses = await API.signTx(
            Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
            false
        );

        txVkeyWitnesses = adaLib.TransactionWitnessSet.from_bytes(
            Buffer.from(txVkeyWitnesses, "hex")
        );

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = adaLib.Transaction.new(
            tx.body(),
            transactionWitnessSet,
            tx.auxiliary_data()
        );

        const submittedTxHash = await API.submitTx(
            Buffer.from(signedTx.to_bytes(), "utf8").toString("hex")
        );
        return submittedTxHash;
    }
}
