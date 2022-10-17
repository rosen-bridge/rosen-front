const fetch = require("node-fetch");
const fs = require("fs");

const tokenMapConfig = require("../src/configs/remote.json");

const githubRepo = tokenMapConfig.bank.github_repo;
const releaseTag = tokenMapConfig.bank.release_tag;
const pureVersion = releaseTag.replace("v", "");
const url = `https://github.com/${githubRepo}/releases/download/${releaseTag}/rosen-${pureVersion}.json`;
let settings = { method: "Get" };

console.log(url)

fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
        const path = __dirname.split("/");
        path.pop();
        const filePath = path.join("/") + "/src/configs/rosen.json";
        fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
    });
