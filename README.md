# Toni Guillem · Technical Game Designer

A static portfolio with six professional case studies and a workshop for Level Design and Game Design prototypes. The files under `dist/` are the editable website source. There is no compilation step.

## Run it on your computer

Use Node.js 24 and npm. Open a terminal in the folder containing `package.json` and run the following commands. The project has no third-party packages to install.

```powershell
npm run check
npm run dev
```

Open the [portfolio](http://127.0.0.1:4173/) or the [local editor](http://127.0.0.1:4173/studio). Keep the terminal open while editing. Press Ctrl+C to stop the server. If the original project is still serving on port 4173, run `$env:PORT = '4174'` in PowerShell before starting this copy and use the URLs printed by the server.

## Add a prototype

1. In the editor, select **New experiment**, choose **Level design** or **Game design**, and give the entry a title, URL slug, and short summary. Keep the slug stable once shared.
2. Add design notes and a cover with descriptive alternative text. Upload an MP4 or WebM, paste a hosted video link, or attach a playable URL and controls. A native build can be offered as a ZIP download.
3. For a self-hosted browser build, copy the complete export into `dist/builds/my-project/` and use `builds/my-project/index.html` as the playable URL. Use an embedded player only if the build and its host support framing. Test it under the repository subpath after publishing.
4. Check **Show this entry in the portfolio**, click **Save entry**, and preview the saved entry. Unchecking the option hides a draft in the interface. Draft text and uploaded files are still present in the repository and deployment if committed.
5. Run the checks and push the update using the [GitHub Pages guide](GITHUB-PAGES.md).

The editor writes entries to `dist/content.json` and files to `dist/uploads/`. It keeps the previous content JSON at `content.backup.json`, which Git ignores. The editor runs on your computer. GitHub Pages serves the visitor site.

For existing case studies, use **Profile & professional projects → Open content JSON** or edit the file directly. See the [agent handover](AI-HANDOVER.md) for the other files that contain homepage copy.
