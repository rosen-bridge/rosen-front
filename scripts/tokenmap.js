const fetch = require("node-fetch");
const fs = require("fs");

const tokenMapConfig = require("../src/configs/remote.json");
const githubRepo = tokenMapConfig.contratcs.github_repo;
const networkType = tokenMapConfig.contratcs.network_type;
const settings = { method: "Get" };

fetch(`https://api.github.com/repos/${githubRepo}/releases?per_page=1`, settings)
    .then((res) => res.json())
    .then((json) => {
        const releaseTag = json[0].tag_name;
        const url = `https://github.com/${githubRepo}/releases/download/${releaseTag}/tokensMap-${networkType}-${releaseTag}.json`;
        fetch(url, settings)
            .then((res) => res.json())
            .then((json) => {
                const path = __dirname.split("/");
                path.pop();
                const filePath = path.join("/") + "/src/configs/tokenmap.json";
                fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
            });
    });
