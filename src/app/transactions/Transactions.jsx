import React from "react"
import PageLayout from "layouts/PageLayout";
import {Card, TableCell,} from "@mui/material";
import TablePro from "components/TablePro";
import TransRow from "./TransRow";
import TransFilter from "./TransFilter";

export default function Transactions() {

    const get_transactions = (payload, filter) => new Promise((resolve, reject) => {
        const packet = {
            ...payload,
            network: filter.network?.id,
            tokenId: filter.token?.id,
            onlyWithEvents: filter.onlyWithEvents,
        }
        console.log("get_data",packet)
        setTimeout(() => {
            const res = {
                "data":[{"observationId":200,"fromChain":"cardano","toChain":"ergo","fromAddress":"addr1q9u49r9k383gq7dcdxvsq74jqaalws8kx6reg8mlucn9qljf5tfwneq99r7lkdmlwdzuc6y4fahyq4pyc4l2apt8ghhsd5tsf4","toAddress":"9h8uhm3hcgpg36dxgBa8Jse2gmRxD4azmxb4i5qgRbjJh5bpDik","creationHeight":8755387,"amount":"12400000000","networkFee":"2000000","bridgeFee":"2000000000","sourceChainTokenId":"asset1epz7gzjqg5py4xrgps6ccv25gz7gd6v8e5gmxx","requestId":"d4941d9dd6abe2050c8d151f2d750b50a4370d2ece46849eb6b19d0045f80894","eventId":"d4941d9dd6abe2050c8d151f2d750b50a4370d2ece46849eb6b19d0045f80894","feePaymentTx":null,"status":"Doing","lastHeight":1001278},{"observationId":199,"fromChain":"ergo","toChain":"cardano","fromAddress":"9hbvry2V8m38j5ggBPRXz18Xx9AtoH6J6yhqSmq1bbZZRiiDywu","toAddress":"addr1qyf5u79aqmkhu2lc20cmgq8md406qp4ntg6fyuxxv907vffzxx324l9rmk5k65exw9jppkdd3tyswd6smf4ju7r38aws86lhgy","creationHeight":1000521,"amount":"3000000000","networkFee":"800000000","bridgeFee":"2000000000","sourceChainTokenId":"erg","requestId":"ade6b0c1760be0a3aa0e4972abbdf3ef2e4b2be34edad5203561a138d885b026","eventId":"ade6b0c1760be0a3aa0e4972abbdf3ef2e4b2be34edad5203561a138d885b026","feePaymentTx":null,"status":"Doing","lastHeight":1000557},{"observationId":198,"fromChain":"ergo","toChain":"cardano","fromAddress":"9hZ2YmzGq2k43i2gqFN6zGpZK5pGzwGvghoBvM8bbjrKRDMKJLD","toAddress":"addr1q9tadt94m54kz43k2d0engh4avsfxm0s4hxpr3qz7mpl6a5kpncs45ntp7a0krf4pak3c3mpa27p3j6rs2jxgvx942psrl29pp","creationHeight":997061,"amount":"4000000000","networkFee":"800000000","bridgeFee":"2000000000","sourceChainTokenId":"erg","requestId":"166a9fb6366c0f36a8577be0fa979d040d4bb2e7baa273c93e7b8ce67bf39e2f","eventId":"166a9fb6366c0f36a8577be0fa979d040d4bb2e7baa273c93e7b8ce67bf39e2f","feePaymentTx":"e8d6ee035c2fcd265844bd12d1e5aa5fdd06b7b55a691013a3b4e3bc13ba5b1f","status":"Done","lastHeight":997155},{"observationId":197,"fromChain":"cardano","toChain":"ergo","fromAddress":"addr1q846m5znt27r995pqzxnqpeyskyngpqs7ev6lcl2qhs94fpw3xzaathxp2rchq83dtgu06lwzf6ma033j3lwezjqgqhqn02et2","toAddress":"9hNXZMGdypCYb1erts2Brc4fjUkS13dVZeP4CpMRaYchsmFPLyG","creationHeight":8720163,"amount":"29000000","networkFee":"9000","bridgeFee":"8500000","sourceChainTokenId":"lovelace","requestId":"cdcb71c288e3a07e9377f76cf9c22bbd20a9c6a87c2d626c78de735adc78c8f2","eventId":"cdcb71c288e3a07e9377f76cf9c22bbd20a9c6a87c2d626c78de735adc78c8f2","feePaymentTx":"0d284072289dbb967168b5d1bb6326ebfcd946defe5bdadf4d81eb363b66b837","status":"Done","lastHeight":994807},{"observationId":196,"fromChain":"cardano","toChain":"ergo","fromAddress":"addr1qyhuv6w60yf5twtv9dky7pgxkayxzcygkqfygje2kwqj5ung67rta7rlkn5g0a73c43efpcpznk9j8uhaukpdr9ye3xqk2kgam","toAddress":"9gh2VssYZWZNFwhbC4VhKytiGDbCdwqYfdorQ6US6Ftj3n74rTX","creationHeight":8719485,"amount":"10000000","networkFee":"9000","bridgeFee":"8500000","sourceChainTokenId":"lovelace","requestId":"17833b1815e136e523bb87424535ed6b2e3c759e3a2f53cbd48c9cae9b6c7d8f","eventId":"17833b1815e136e523bb87424535ed6b2e3c759e3a2f53cbd48c9cae9b6c7d8f","feePaymentTx":"cb7d8d3373298c4de178512cb0d2bc5a501ddb9045fdc23ab42e286421fcd087","status":"Done","lastHeight":997807},{"observationId":195,"fromChain":"ergo","toChain":"cardano","fromAddress":"9fzUTphUikbq15BFobkutCHyYjVQFYFiMcKqitZVErTAJmnxddx","toAddress":"addr1q83ruw4dllfeyzc44nzch6xw9qwef902hjjwuppk6fuqv8y4gcjjt70fcyfxf95ykm4ecq48utddtp70ns77s9x00jzse28q4h","creationHeight":994386,"amount":"21491000","networkFee":"3400000","bridgeFee":"8500000","sourceChainTokenId":"38cb230f68a28436fb3b73ae4b927626673e4620bc7c94896178567d436e416b","requestId":"17006b0bb6bb793b76f6e81ba499fa87dccbba34957f8765ed11a46c8332cf38","eventId":"17006b0bb6bb793b76f6e81ba499fa87dccbba34957f8765ed11a46c8332cf38","feePaymentTx":"dd02476f341c389a16cd6708b7f6ea1a6a922cb763c8555694d3e24bf1494b59","status":"Done","lastHeight":994471},{"observationId":194,"fromChain":"cardano","toChain":"ergo","fromAddress":"addr1q83ruw4dllfeyzc44nzch6xw9qwef902hjjwuppk6fuqv8y4gcjjt70fcyfxf95ykm4ecq48utddtp70ns77s9x00jzse28q4h","toAddress":"9fzUTphUikbq15BFobkutCHyYjVQFYFiMcKqitZVErTAJmnxddx","creationHeight":8718018,"amount":"24000000","networkFee":"9000","bridgeFee":"8500000","sourceChainTokenId":"lovelace","requestId":"2282f16f08bfec108a6cf3551a354588f001b1f455816e323439a1f64225b2b4","eventId":"2282f16f08bfec108a6cf3551a354588f001b1f455816e323439a1f64225b2b4","feePaymentTx":"6ac8922018f357277efb58b726aae291e45b5fe149b6e70103e4ba80f54ad9ee","status":"Done","lastHeight":994432},{"observationId":193,"fromChain":"cardano","toChain":"ergo","fromAddress":"addr1q83ruw4dllfeyzc44nzch6xw9qwef902hjjwuppk6fuqv8y4gcjjt70fcyfxf95ykm4ecq48utddtp70ns77s9x00jzse28q4h","toAddress":"9fzUTphUikbq15BFobkutCHyYjVQFYFiMcKqitZVErTAJmnxddx","creationHeight":8718012,"amount":"32200000000","networkFee":"2000000","bridgeFee":"2000000000","sourceChainTokenId":"asset1epz7gzjqg5py4xrgps6ccv25gz7gd6v8e5gmxx","requestId":"900b7b807b3d0f24c498d625337cd3f3ae55bb3fe02c9671ad6c3b531f088125","eventId":"900b7b807b3d0f24c498d625337cd3f3ae55bb3fe02c9671ad6c3b531f088125","feePaymentTx":"453e0d37d3a8bb8287b8dd3c8f171c3d6412e4b2c5d251f358440c263a9d0886","status":"Done","lastHeight":994426},{"observationId":191,"fromChain":"cardano","toChain":"ergo","fromAddress":"addr1q8vu2kdytzlp8kyg6pj8vvzy76g8k6yv262wxda2ecdaum6glwwy09txggqn6chm5dvmgqc3w9gega637hg4w43gv4dswq0qhu","toAddress":"9gwB4fCtrJGA1DJNUPQiifk9zLjTeVoCdxGJ8TU8T14mfKcAFGN","creationHeight":8717704,"amount":"9000000","networkFee":"9000","bridgeFee":"8500000","sourceChainTokenId":"lovelace","requestId":"01449c7797e7b886b413bfb739c293ccfc65cad4c86ee9e77037e17ccb551197","eventId":"01449c7797e7b886b413bfb739c293ccfc65cad4c86ee9e77037e17ccb551197","feePaymentTx":"ac25ee42053e5355b1782bb9d19a534d10ef5ad2ff0c695b11e7dfa0e06403e2","status":"Done","lastHeight":994368},{"observationId":190,"fromChain":"ergo","toChain":"cardano","fromAddress":"9gwB4fCtrJGA1DJNUPQiifk9zLjTeVoCdxGJ8TU8T14mfKcAFGN","toAddress":"addr1qy0t85t3phwx73wz9aq7ku0hj3temx5s8vmhurffhhz42c6u736jrutuh2xvtfgjxywkq8ezu8uu3ges546erumrwtjsraxxd4","creationHeight":994320,"amount":"349000","networkFee":"100000","bridgeFee":"248000","sourceChainTokenId":"0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b","requestId":"76a81f54cbf8fd21dfe4bee29b9b0e6fecad5afc6aeb5cec0db23a0ad2e8c6c5","eventId":"76a81f54cbf8fd21dfe4bee29b9b0e6fecad5afc6aeb5cec0db23a0ad2e8c6c5","feePaymentTx":"29aeee7dd00ca9eb86b41135074350a4e18e7a53a3abb7b33dd6c9f0f9559c36","status":"Done","lastHeight":994412}],
                "total":197,
                "page":0,
                "pageLength":15
            }
            resolve(res)
        },1000)
    })

    return (
        <PageLayout
            title="Bridge Transactions"
            subtitle="All transactions that have been bridged using Rosen between networks."
        >
            <Card>
                <TablePro onGet={get_transactions} Row={<TransRow/>} Filter={<TransFilter/>}>
                    <TableCell width={60}>ID</TableCell>
                    <TableCell width={120}>From chain</TableCell>
                    <TableCell width={120}>To chain</TableCell>
                    <TableCell width={250}>From address</TableCell>
                    <TableCell width={250}>To address</TableCell>
                    <TableCell width={250}>Token</TableCell>
                    <TableCell width={120} align="right">Amount</TableCell>
                    <TableCell width={120} align="right">Creation Height</TableCell>
                    <TableCell width={120} align="right">Bridge Fee</TableCell>
                    <TableCell width={120} align="right">Network Fee</TableCell>
                    <TableCell width={80}>Status</TableCell>
                </TablePro>
            </Card>
        </PageLayout>
    )
}

