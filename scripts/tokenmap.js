const fetch = require("node-fetch");
const fs = require("fs");

const tokenMapConfig = require("../src/configs/remote.json");
const githubRepo = tokenMapConfig.tokenmap.github_repo;

let settings = { method: "Get" };
fetch(`https://api.github.com/repos/${githubRepo}/releases?per_page=1`, settings)
    .then((res) => res.json())
    .then((json) => {
        const releaseTag = json[0].tag_name;
        const pureVersion = releaseTag.replace("v", "");
        const url = `https://github.com/${githubRepo}/releases/download/${releaseTag}/tokensmap-${pureVersion}.json`;
        fetch(url, settings)
            .then((res) => res.json())
            .then((json) => {
                const path = __dirname.split("/");
                path.pop();
                const filePath = path.join("/") + "/src/configs/tokenmap.json";
                fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
            });
    });
