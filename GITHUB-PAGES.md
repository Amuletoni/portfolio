# Publish your portfolio on GitHub Pages

These instructions take the prepared Windows folder to a public portfolio URL. You need a GitHub account, Git for Windows, and Node.js with npm to preview the site. The included workflow deploys the contents of `dist/` whenever you push to `main`. GitHub Free supports Pages in public repositories. [GitHub Pages publishing settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 1. Open the project and preview it

Open the handover folder in File Explorer, enter **website**, right-click the folder background, and select **Open in Terminal**. Use PowerShell. If you moved the bundle, these same steps work in its new location.

```powershell
Get-Location
Test-Path .github/workflows/pages.yml
git --version
node --version
npm run check
npm run dev
```

The path should end in `Portfolio Handover\website`, the file check should print `True`, and the portfolio check should pass. Open the local URL printed by the server. Review the case studies, career details, and contact links, then press **Ctrl+C** in that terminal. If tools are missing, install [Git for Windows](https://git-scm.com/downloads/win) and [Node.js](https://nodejs.org/en/download), then reopen PowerShell.

## 2. Create an empty public repository

Sign in to GitHub and open [New repository](https://github.com/new). Choose your personal account as owner, enter `toni-portfolio` as the repository name, and select **Public**. Leave the README, .gitignore, and license initialization options empty. Click **Create repository**. On the new repository page, copy its **HTTPS** repository URL. It will end in `/toni-portfolio.git`. [GitHub’s guide to importing local code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

## 3. Upload the project

Run these commands from **website**. The last command lists what will be uploaded.

```powershell
git init -b main
git add .
git diff --cached --name-only
```

Expect `.github/workflows/pages.yml`, `dist/`, `scripts/`, `package.json`, and the project documentation. If you see the reference PDF or a parent `website/` prefix, stop and check your working directory. The public repository exposes committed files, including draft JSON. The Pages site serves only `dist/`.

```powershell
git commit -m "Add Toni Guillem portfolio"
$portfolioRemote = Read-Host 'https://github.com/Amuletoni/portfolio.git'
git remote add origin $portfolioRemote
git remote -v
git push -u origin main
```

Confirm that `origin` points to your repository and complete the GitHub sign-in if Git opens a browser. If the commit reports **Author identity unknown**, set `git config user.name "Toni Guillem"` and `git config user.email "toni.guillem@gmail.com"` with your chosen GitHub commit email, then rerun the commit and following commands. [GitHub’s upload instructions](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

## 4. Enable Pages and run the deployment

1. Refresh the repository on GitHub. Confirm that **dist**, **scripts**, and **.github/workflows/pages.yml** appear at its root.
2. Open **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**. Your workflow is already in the repository.
3. Open **Actions → Publish portfolio to GitHub Pages**. Click **Run workflow**, select **main**, and confirm **Run workflow**. This handles the case where the first push attempted deployment before you enabled Pages.
4. Open the newest run. Wait for **check-and-package** and **deploy** to succeed. Open the deployment URL from the run or click **Visit site** in **Settings → Pages**. The workflow uses the permissions supplied by GitHub, so there is no hosting token to paste. [Publishing source settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [How the Pages workflow works](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## 5. Verify and share the visitor URL

For a repository named `toni-portfolio`, the normal project-site address is `https://YOUR-USERNAME.github.io/toni-portfolio/`. Copy the actual **Visit site** address from GitHub. Open it in a private browser window while signed out, click **Rainbow Six Siege**, and refresh that case study. Confirm its images load, then check **The workshop → Level design**. Share the homepage or a project URL from the address bar. [GitHub Pages site types and URLs](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## Update it later

Run `npm run dev` from the same **website** folder. Edit using the [local content editor](http://127.0.0.1:4173/studio), save, and preview. Stop the server with Ctrl+C and run the following commands, changing the commit message to describe your update.

```powershell
npm run check
git add .
git diff --cached --stat
git commit -m "Add a level design experiment"
git push
```

The next successful workflow updates the same public address. For large playable exports, use a hosted playable link or an external build download. The editor’s 200 MB local upload ceiling exceeds GitHub’s 100 MiB limit for individual files in normal Git pushes. [GitHub file size limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)

## If the site does not appear

| Symptom                                 | What to check                                                                                                                    |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| No workflow listed                      | Check that `.github/workflows/pages.yml` is on `main` and Actions is enabled for the repository.                                 |
| The first run failed at Configure Pages | Complete step 4, then run the workflow again. Open the failed step for its exact error.                                          |
| GitHub shows a 404                      | Use the URL from **Settings → Pages** after a successful deployment, including the repository name and trailing slash.           |
| A project image is missing              | Check its committed filename and capitalization. Use a path such as `assets/siege.webp`, relative to the repository’s Pages URL. |
| The editor is unavailable online        | Start `npm run dev` on your computer and use its printed editor URL. Save, commit, and push to update the live portfolio.        |
