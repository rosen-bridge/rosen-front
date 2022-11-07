const fetch = require("node-fetch");
const explorerConfig = require("../configs/remote.json");

class Explorer {
    constructor(address) {
        this.address = address;
    }

    async getHeight() {
        const url = this.address + "/blocks?limit=1";
        let height = 0;
        try {
            const response = await fetch(url, {
                method: "Get"
            });
            const json = await response.json();
            height = json[0].block_height;
        } catch (e) {
            console.error("Error fetching height", e);
        }
        return height;
    }
}

export default new Explorer(explorerConfig.cardano_explorer.base_url + "/v0");
