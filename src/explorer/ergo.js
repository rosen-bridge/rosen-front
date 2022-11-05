const fetch = require("node-fetch");
const explorerConfig = require("../configs/remote.json");

class Explorer {
    constructor(address) {
        this.address = address;
    }

    async getHeight() {
        const url = this.address + "/networkState";
        let height = 0;
        try {
            const response = await fetch(url, { method: "Get" });
            const json = await response.json();
            height = json.height;
        } catch (e) {
            console.error("Error fetching height", e);
        }
        return height;
    }
}

export default new Explorer(explorerConfig.ergo_explorer.base_url + "/v1");
