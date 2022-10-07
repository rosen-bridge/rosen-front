const getUtxos = async (adaLib, rawUtxos) => {
    let Utxos = [];

    try {
        for (const rawUtxo of rawUtxos) {
            const utxo = adaLib.TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
            const input = utxo.input();
            const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString("hex");
            const txindx = input.index();
            const output = utxo.output();
            const amount = output.amount().coin().to_str(); // ADA amount in lovelace
            const multiasset = output.amount().multiasset();
            let multiAssetStr = "";

            if (multiasset) {
                const keys = multiasset.keys(); // policy Ids of thee multiasset
                const N = keys.len();
                for (let i = 0; i < N; i++) {
                    const policyId = keys.get(i);
                    const policyIdHex = Buffer.from(policyId.to_bytes(), "utf8").toString("hex");
                    // console.log(`policyId: ${policyIdHex}`)
                    const assets = multiasset.get(policyId);
                    const assetNames = assets.keys();
                    const K = assetNames.len();
                    // console.log(`${K} Assets in the Multiasset`)

                    for (let j = 0; j < K; j++) {
                        const assetName = assetNames.get(j);
                        const assetNameString = Buffer.from(assetName.name(), "utf8").toString();
                        const assetNameHex = Buffer.from(assetName.name(), "utf8").toString("hex");
                        const multiassetAmt = multiasset.get_asset(policyId, assetName);
                        multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`;
                        // console.log(assetNameString)
                        // console.log(`Asset Name: ${assetNameHex}`)
                    }
                }
            }

            const obj = {
                txid: txid,
                txindx: txindx,
                amount: amount,
                str: `${txid} #${txindx} = ${amount}`,
                multiAssetStr: multiAssetStr,
                TransactionUnspentOutput: utxo
            };
            Utxos.push(obj);
            // console.log(`utxo: ${str}`)
        }
        return Utxos;
    } catch (err) {
        console.log(err);
    }
};

export const generateAdaTX = async (
    adaLib,
    bankAddress,
    changeAddress,
    assetNameHex,
    assetPolicyIdHex,
    assetAmount,
    utxos,
    nami
) => {
    const txBuilder = adaLib.TransactionBuilder.new(
        adaLib.TransactionBuilderConfigBuilder.new()
            .fee_algo(
                adaLib.LinearFee.new(adaLib.BigNum.from_str("440"), adaLib.BigNum.from_str("1553810"))
            )
            .pool_deposit(adaLib.BigNum.from_str("500000000"))
            .key_deposit(adaLib.BigNum.from_str("2000000"))
            .coins_per_utxo_word(adaLib.BigNum.from_str("34482"))
            .max_value_size(5000)
            .max_tx_size(16384)
            .prefer_pure_change(true)
            .build()
    );
    const shelleyOutputAddress = adaLib.Address.from_bech32(bankAddress);
    const shelleyChangeAddress = adaLib.Address.from_bech32(changeAddress);

    let txOutputBuilder = adaLib.TransactionOutputBuilder.new();
    txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);
    txOutputBuilder = txOutputBuilder.next();

    let multiAsset = adaLib.MultiAsset.new();
    let assets = adaLib.Assets.new();
    assets.insert(
        adaLib.AssetName.new(Buffer.from(assetNameHex, "hex")), // Asset Name
        adaLib.BigNum.from_str(assetAmount.toString()) // How much to send
    );
    multiAsset.insert(
        adaLib.ScriptHash.from_bytes(Buffer.from(assetPolicyIdHex, "hex")), // PolicyID
        assets
    );

    txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(
        multiAsset,
        adaLib.BigNum.from_str("34482")
    );
    const txOutput = txOutputBuilder.build();

    txBuilder.add_output(txOutput);

    // Find the available UTXOs in the wallet and
    // us them as Inputs
    let txOutputs = adaLib.TransactionUnspentOutputs.new();
    const processedUtxos = await getUtxos(adaLib, utxos);
    for (const utxo of processedUtxos) {
        txOutputs.add(utxo.TransactionUnspentOutput);
    }
    txBuilder.add_inputs_from(txOutputs, 3);

    // set the time to live - the absolute slot value before the tx becomes invalid
    // txBuilder.set_ttl(51821456);

    // calculate the min fee required and send any change to an address
    txBuilder.add_change_if_needed(shelleyChangeAddress);

    const to = adaLib.TransactionMetadatum.new_text("to");
    const ergo = adaLib.TransactionMetadatum.new_text("ergo");
    const bridgeFee = adaLib.TransactionMetadatum.new_text("bridgeFee");
    const bridgeFee100 = adaLib.TransactionMetadatum.new_text("2");
    const networkFee = adaLib.TransactionMetadatum.new_text("networkFee");
    const networkFee100 = adaLib.TransactionMetadatum.new_text("1");
    const toAddress = adaLib.TransactionMetadatum.new_text("toAddress");
    const addr = adaLib.TransactionMetadatum.new_text(
        "9hPoYNQwVDbtAyt5uhYyKttye7ZPzZ7ePcc6d2rgKr9fiZm6DhD"
    );


    const map = adaLib.MetadataMap.new();
    map.insert(to, ergo);
    map.insert(bridgeFee, bridgeFee100);
    map.insert(networkFee, networkFee100);
    map.insert(toAddress, addr);
    const rosen = adaLib.TransactionMetadatum.new_map(map);
    const md = adaLib.GeneralTransactionMetadata.new();
    const zz = adaLib.BigNum.from_str("0");
    md.insert(zz, rosen);
    const data = adaLib.AuxiliaryData.new();
    data.set_metadata(md);

    txBuilder.set_auxiliary_data(data);

    // once the transaction is ready, we build it to get the tx body without witnesses
    const txBody = txBuilder.build();
    const API = await nami.getAPI();

    const transactionWitnessSet = adaLib.TransactionWitnessSet.new();

    const tx = adaLib.Transaction.new(
        txBody,
        adaLib.TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
        data
    );

    let txVkeyWitnesses = await API.signTx(
        Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
        false
    );

    txVkeyWitnesses = adaLib.TransactionWitnessSet.from_bytes(
        Buffer.from(txVkeyWitnesses, "hex")
    );

    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    console.log(tx.auxiliary_data());

    const signedTx = adaLib.Transaction.new(tx.body(), transactionWitnessSet, tx.auxiliary_data());

    //console.log(signedTx)

    const submittedTxHash = await API.submitTx(
        Buffer.from(signedTx.to_bytes(), "utf8").toString("hex")
    );
    console.log(submittedTxHash);

    console.log("Hooray");
};
