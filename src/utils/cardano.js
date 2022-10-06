export const generateAdaTX = async (adaLib, utxos, networkId) => {
    const txBuilder = adaLib.TransactionBuilder.new(
        adaLib.TransactionBuilderConfigBuilder.new()
            .fee_algo(
                adaLib.LinearFee.new(adaLib.BigNum.from_str("44"), adaLib.BigNum.from_str("155381"))
            )
            .pool_deposit(adaLib.BigNum.from_str("500000000"))
            .key_deposit(adaLib.BigNum.from_str("2000000"))
            .coins_per_utxo_word(adaLib.BigNum.from_str("34482"))
            .max_value_size(5000)
            .max_tx_size(16384)
            .prefer_pure_change(true)
            .build()
    );
    const shelleyOutputAddress = adaLib.Address.from_bech32(this.state.addressBech32SendADA);
    const shelleyChangeAddress = adaLib.Address.from_bech32(this.state.changeAddress);

    let txOutputBuilder = adaLib.TransactionOutputBuilder.new();
    txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);
    txOutputBuilder = txOutputBuilder.next();

    let multiAsset = adaLib.MultiAsset.new();
    let assets = adaLib.Assets.new();
    assets.insert(
        adaLib.AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
        adaLib.BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
    );
    multiAsset.insert(
        adaLib.ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
        assets
    );

    txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(
        multiAsset,
        BigNum.from_str(this.protocolParams.coinsPerUtxoWord)
    );
    const txOutput = txOutputBuilder.build();

    txBuilder.add_output(txOutput);

    // Find the available UTXOs in the wallet and
    // us them as Inputs
    const txUnspentOutputs = await this.getTxUnspentOutputs();
    txBuilder.add_inputs_from(txUnspentOutputs, 3);

    // set the time to live - the absolute slot value before the tx becomes invalid
    // txBuilder.set_ttl(51821456);

    // calculate the min fee required and send any change to an address
    txBuilder.add_change_if_needed(shelleyChangeAddress);

    // once the transaction is ready, we build it to get the tx body without witnesses
    const txBody = txBuilder.build();

    // Tx witness
    const transactionWitnessSet = adaLib.TransactionWitnessSet.new();

    const tx = adaLib.Transaction.new(
        txBody,
        adaLib.TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
    );

    let txVkeyWitnesses = await this.API.signTx(
        Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
        true
    );
    txVkeyWitnesses = adaLib.TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    const signedTx = adaLib.Transaction.new(tx.body(), transactionWitnessSet);

    const submittedTxHash = await this.API.submitTx(
        Buffer.from(signedTx.to_bytes(), "utf8").toString("hex")
    );
    console.log(submittedTxHash);
    console.log("Hooray");
};
