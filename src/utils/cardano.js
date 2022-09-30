export const transaction = async ({
    PaymentAddress = "",
    recipients = [],
    metadata = null,
    metadataHash = null,
    addMetadata = true,
    utxosRaw = [],
    networkId = 0,
    ttl = 3600,
    multiSig = false,
    adaLib = null
}) => {
    let utxos = utxosRaw.map((u) =>
        adaLib.TransactionUnspentOutput.from_bytes(Buffer.from(u, "hex"))
    );
    let protocolParameter = await this._getProtocolParameter(networkId);
    let mintedAssetsArray = [];
    let outputs = adaLib.TransactionOutputs.new();

    let minting = 0;
    let outputValues = {};
    let costValues = {};
    for (let recipient of recipients) {
        let lovelace = Math.floor((recipient.amount || 0) * 1000000).toString();
        let ReceiveAddress = recipient.address;
        let multiAsset = this._makeMultiAsset(recipient?.assets || []);
        let mintedAssets = this._makeMintedAssets(recipient?.mintedAssets || []);

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
        (recipient?.mintedAssets || []).map((asset) => {
            minting += 1;
            mintedAssetsArray.push({
                ...asset,
                address: recipient.address
            });
        });

        if (parseInt(outputValue.coin().to_str()) > 0) {
            outputValues[recipient.address] = outputValue;
        }
        if ((recipient.mintedAssets || []).length > 0) {
            minAdaMint = adaLib.min_ada_required(
                mintedAssets,
                adaLib.BigNum.from_str(protocolParameter.minUtxo)
            );

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
    let RawTransaction = null;
    if (minting > 0) {
        outputValues[PaymentAddress] = adaLib.Value.new(adaLib.BigNum.from_str("0"));

        RawTransaction = await this._txBuilderMinting({
            PaymentAddress: PaymentAddress,
            Utxos: utxos,
            Outputs: outputs,
            mintedAssetsArray: mintedAssetsArray,
            outputValues: outputValues,
            ProtocolParameter: protocolParameter,
            metadata: metadata,
            metadataHash: metadataHash,
            addMetadata: addMetadata,
            multiSig: multiSig,
            ttl: ttl,
            costValues: costValues
        });
    } else {
        RawTransaction = await this._txBuilder({
            PaymentAddress: PaymentAddress,
            Utxos: utxos,
            Outputs: outputs,
            ProtocolParameter: protocolParameter,
            Metadata: metadata,

            Delegation: null
        });
    }
    return Buffer.from(RawTransaction, "hex").toString("hex");
};
