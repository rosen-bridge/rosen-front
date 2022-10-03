import CoinSelection from "./coinSelection";
import { testnetAPIKey } from "../configs/ada";

const getApiKey = (networkId) => {
    //TODO
    if (networkId === 0) {
        return testnetAPIKey;
    } else {
        return "";
    }
};

const blockfrostRequest = async ({
    body,
    endpoint = "",
    networkId = 0,
    headers = {},
    method = "GET"
}) => {
    let networkEndpoint =
        networkId === 0
            ? "https://cardano-testnet.blockfrost.io/api/v0"
            : "https://cardano-mainnet.blockfrost.io/api/v0";
    let blockfrostApiKey = getApiKey(networkId);

    try {
        return await (
            await fetch(`${networkEndpoint}${endpoint}`, {
                headers: {
                    project_id: blockfrostApiKey,
                    ...headers
                },
                method: method,
                body
            })
        ).json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

const getProtocolParameter = async (networkId) => {
    let latestBlock = await blockfrostRequest({
        endpoint: "/blocks/latest",
        networkId: networkId,
        method: "GET"
    });
    if (!latestBlock) throw Error("Failed to get latest block");

    let p = await blockfrostRequest({
        endpoint: `/epochs/${latestBlock.epoch}/parameters`,
        networkId: networkId,
        method: "GET"
    });

    return {
        linearFee: {
            minFeeA: p.min_fee_a.toString(),
            minFeeB: p.min_fee_b.toString()
        },
        minUtxo: "1000000",
        poolDeposit: p.pool_deposit,
        keyDeposit: p.key_deposit,
        maxTxSize: p.max_tx_size,
        slot: latestBlock.slot
    };
};

const makeMultiAsset = (assets, adaLib) => {
    let AssetsMap = {};
    for (let asset of assets) {
        console.log(asset);
        let [policy, assetName] = asset.unit.split(".");
        let quantity = asset.quantity;
        if (!Array.isArray(AssetsMap[policy])) {
            AssetsMap[policy] = [];
        }
        AssetsMap[policy].push({
            unit: Buffer.from(assetName, "ascii").toString("hex"),
            quantity: quantity
        });
    }

    let multiAsset = adaLib.MultiAsset.new();

    for (const policy in AssetsMap) {
        const ScriptHash = adaLib.ScriptHash.from_bytes(Buffer.from(policy, "hex"));
        const Assets = adaLib.Assets.new();

        const _assets = AssetsMap[policy];

        for (const asset of _assets) {
            const AssetName = adaLib.AssetName.new(Buffer.from(asset.unit, "hex"));
            const BigNum = adaLib.BigNum.from_str(asset.quantity.toString());

            Assets.insert(AssetName, BigNum);
        }

        multiAsset.insert(ScriptHash, Assets);
    }

    return multiAsset;
};

const txBuilder = async ({
    PaymentAddress,
    Utxos,
    Outputs,
    ProtocolParameter,
    metadata = null,
    adaLib
}) => {
    const MULTIASSET_SIZE = 5000;
    const VALUE_SIZE = 5000;
    const totalAssets = 0;

    CoinSelection.setProtocolParameters(
        ProtocolParameter.minUtxo.toString(),
        ProtocolParameter.linearFee.minFeeA.toString(),
        ProtocolParameter.linearFee.minFeeB.toString(),
        ProtocolParameter.maxTxSize.toString()
    );

    const selection = await CoinSelection.randomImprove(Utxos, Outputs, 20 + totalAssets);
    const inputs = selection.input;
    const txBuilder = adaLib.TransactionBuilder.new(
        adaLib.LinearFee.new(
            adaLib.BigNum.from_str(ProtocolParameter.linearFee.minFeeA),
            adaLib.BigNum.from_str(ProtocolParameter.linearFee.minFeeB)
        ),
        adaLib.BigNum.from_str(ProtocolParameter.minUtxo.toString()),
        adaLib.BigNum.from_str(ProtocolParameter.poolDeposit.toString()),
        adaLib.BigNum.from_str(ProtocolParameter.keyDeposit.toString()),
        MULTIASSET_SIZE,
        MULTIASSET_SIZE
    );

    for (let i = 0; i < inputs.length; i++) {
        const utxo = inputs[i];
        txBuilder.add_input(utxo.output().address(), utxo.input(), utxo.output().amount());
    }

    let AUXILIARY_DATA;
    if (metadata) {
        AUXILIARY_DATA = adaLib.AuxiliaryData.new();
        const generalMetadata = adaLib.GeneralTransactionMetadata.new();
        Object.entries(metadata).map(([MetadataLabel, Metadata]) => {
            generalMetadata.insert(
                adaLib.BigNum.from_str(MetadataLabel),
                adaLib.encode_json_str_to_metadatum(JSON.stringify(Metadata), 0)
            );
        });

        txBuilder.set_auxiliary_data(AUXILIARY_DATA);
    }

    for (let i = 0; i < Outputs.len(); i++) {
        txBuilder.add_output(Outputs.get(i));
    }

    const change = selection.change;
    const changeMultiAssets = change.multiasset();
    // check if change value is too big for single output
    if (changeMultiAssets && change.to_bytes().length * 2 > VALUE_SIZE) {
        const partialChange = adaLib.Value.new(adaLib.BigNum.from_str("0"));

        const partialMultiAssets = adaLib.MultiAsset.new();
        const policies = changeMultiAssets.keys();
        const makeSplit = () => {
            for (let j = 0; j < changeMultiAssets.len(); j++) {
                const policy = policies.get(j);
                const policyAssets = changeMultiAssets.get(policy);
                const assetNames = policyAssets.keys();
                const assets = adaLib.Assets.new();
                for (let k = 0; k < assetNames.len(); k++) {
                    const policyAsset = assetNames.get(k);
                    const quantity = policyAssets.get(policyAsset);
                    assets.insert(policyAsset, quantity);
                    //check size
                    const checkMultiAssets = adaLib.MultiAsset.from_bytes(
                        partialMultiAssets.to_bytes()
                    );
                    checkMultiAssets.insert(policy, assets);
                    const checkValue = adaLib.Value.new(adaLib.BigNum.from_str("0"));
                    checkValue.set_multiasset(checkMultiAssets);
                    if (checkValue.to_bytes().length * 2 >= VALUE_SIZE) {
                        partialMultiAssets.insert(policy, assets);
                        return;
                    }
                }
                partialMultiAssets.insert(policy, assets);
            }
        };

        makeSplit();
        partialChange.set_multiasset(partialMultiAssets);

        const minAda = adaLib.min_ada_required(
            partialChange,
            adaLib.BigNum.from_str(ProtocolParameter.minUtxo)
        );
        partialChange.set_coin(minAda);

        txBuilder.add_output(
            adaLib.TransactionOutput.new(adaLib.Address.from_bech32(PaymentAddress), partialChange)
        );
    }
    txBuilder.add_change_if_needed(adaLib.Address.from_bech32(PaymentAddress));
    const transaction = adaLib.Transaction.new(
        txBuilder.build(),
        adaLib.TransactionWitnessSet.new(),
        AUXILIARY_DATA
    );

    const size = transaction.to_bytes().length * 2;
    if (size > ProtocolParameter.maxTxSize) throw new Error("Transaction size is too big");

    return transaction.to_bytes();
};

export const transaction = async ({
    PaymentAddress = "",
    recipients = [],
    metadata = null,
    utxosRaw = [],
    networkId = 0,
    adaLib = null
}) => {
    let utxos = utxosRaw.map((u) =>
        adaLib.TransactionUnspentOutput.from_bytes(Buffer.from(u, "hex"))
    );
    let protocolParameter = await getProtocolParameter(networkId);
    let outputs = adaLib.TransactionOutputs.new();

    let outputValues = {};
    let costValues = {};
    for (let recipient of recipients) {
        let lovelace = Math.floor((recipient.amount || 0) * 1000000).toString();
        let ReceiveAddress = recipient.address;
        let multiAsset = makeMultiAsset(recipient?.assets || [], adaLib);

        let outputValue = adaLib.Value.new(adaLib.BigNum.from_str(lovelace));
        let minAdaMint = adaLib.Value.new(adaLib.BigNum.from_str("0"));

        if ((recipient?.assets || []).length > 0) {
            outputValue.set_multiasset(multiAsset);
            let minAda = adaLib.min_ada_required(
                outputValue,
                adaLib.BigNum.from_str(protocolParameter.minUtxo)
            );

            if (adaLib.BigNum.from_str(lovelace).compare(minAda) < 0) outputValue.set_coin(minAda);
        }

        if (parseInt(outputValue.coin().to_str()) > 0) {
            outputValues[recipient.address] = outputValue;
        }
        if ((recipient.mintedAssets || []).length > 0) {
            let requiredMintAda = adaLib.Value.new(adaLib.BigNum.from_str("0"));
            requiredMintAda.set_coin(minAdaMint);
            if (outputValue.coin().to_str() == 0) {
                outputValue = requiredMintAda;
            } else {
                outputValue = outputValue.checked_add(requiredMintAda);
            }
        }
        if (ReceiveAddress != PaymentAddress) costValues[ReceiveAddress] = outputValue;
        outputValues[ReceiveAddress] = outputValue;
        if (parseInt(outputValue.coin().to_str()) > 0) {
            outputs.add(
                adaLib.TransactionOutput.new(
                    adaLib.Address.from_bech32(ReceiveAddress),
                    outputValue
                )
            );
        }
    }
    let RawTransaction = await txBuilder({
        PaymentAddress: PaymentAddress,
        Utxos: utxos,
        Outputs: outputs,
        ProtocolParameter: protocolParameter,
        Metadata: metadata,
        Delegation: null,
        adaLib
    });
    return Buffer.from(RawTransaction, "hex").toString("hex");
};

export const generateAdaTX = async (adaLib, utxos, networkId) => {
    const tx = await transaction({
        PaymentAddress:
            "addr_test1qpjwf0e2wv2lmdaws5qt49m3ca2ux36wymaqxm32vp9c9ma42p340evq3vj8swjrufv4mcu0qv0frt7lnhf9v0t882lstx5x3l",
        recipients: [
            {
                address:
                    "addr_test1qpjwf0e2wv2lmdaws5qt49m3ca2ux36wymaqxm32vp9c9ma42p340evq3vj8swjrufv4mcu0qv0frt7lnhf9v0t882lstx5x3l",
                amount: "10"
            }
        ],
        utxosRaw: utxos,
        adaLib,
        networkId
    });
    console.log("Hooray", tx);
};
