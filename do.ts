import { Octokit } from "@octokit/rest";
const { GH_TOKEN } = process.env;

let octokit = new Octokit();
if (GH_TOKEN) {   
    octokit = new Octokit({auth: GH_TOKEN!});
}



(async () => {
    let release = await octokit.repos.getLatestRelease({ owner: "CorporateClash", repo: "pyside2-releases" });
    let _assets = release.data.assets.filter(asset => asset.name == "installer.exe")
    if (_assets.length != 1) {
        console.log("Error: no installer.exe asset in the latest release on GitHub.")
        process.exit(1)
    }
    let installer = _assets[0]
    console.log(installer.browser_download_url)
    if (process.env.GITHUB_ACTIONS) {
        await octokit.repos.createOrUpdateFile({
            owner: "CorporateClash",
            repo: "pyside2-releases",
            path: "latest.txt",
            message: "Update latest release url", // commit message
            content: Buffer.from(installer.browser_download_url).toString('base64')
        })
    }
    else {
        console.log("Not running in GH actions, exiting")
    }
    process.exit(0)
})()
