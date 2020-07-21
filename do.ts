import { Octokit } from "@octokit/rest";
const { GH_TOKEN } = process.env;

let octokit = new Octokit();
if (GH_TOKEN) {   
    octokit = new Octokit({auth: GH_TOKEN!});
}

interface outputItem {
    asset_name: string;
    output_file: string;
}

let toDo: outputItem[] = [
    {
        asset_name: "installer.exe",
        output_file: "latest.txt"
    },
    {
        asset_name: "CorporateClash.dmg",
        output_file: "latest_macos.txt"
    }
];


(async () => {
    let release = await octokit.repos.getLatestRelease({ owner: "CorporateClash", repo: "pyside2-releases" });

    for await (const todoItem of toDo) {
        let _assets = release.data.assets.filter(asset => asset.name == todoItem.asset_name);
        if (_assets.length != 1) {
            console.log(`Error: unable to find ${todoItem.asset_name} in the latest release on GitHub.`);
            continue;
        }
        let itemAsset = _assets[0];
        console.log(itemAsset.browser_download_url);
        let existing = await octokit.repos.getContents({
            owner: "CorporateClash",
            repo: "pyside2-releases",
            path: todoItem.output_file,
        }).catch((err) => { console.log(err); console.log(`Failed getting ${todoItem.output_file}, assuming nonexistant`); });
        if (!process.env.GITHUB_ACTIONS) continue;
        if (existing) {
            await octokit.repos.createOrUpdateFile({
                owner: "CorporateClash",
                repo: "pyside2-releases",
                path: todoItem.output_file,
                // @ts-ignore
                sha: existing.data.sha,
                message: "Update latest release url",
                content: Buffer.from(itemAsset.browser_download_url).toString('base64')
            });
        }
        else {
            await octokit.repos.createOrUpdateFile({
                owner: "CorporateClash",
                repo: "pyside2-releases",
                path: todoItem.output_file,
                message: "Update latest release url",
                content: Buffer.from(itemAsset.browser_download_url).toString('base64')
            });
        }
    }
    console.log("Done!")
    process.exit(0)
})()
