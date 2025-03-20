# Troubleshoot missing editor

<p class="description">How to troubleshoot a missing editor error on Toolpad Studio.</p>

## When using Visual Studio Code

1. When clicking on the "Open editor" button on the query editor, you might run into the following error

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/editor-path/missing-editor.png", "alt": "Missing editor error", "caption": "Missing editor error"}}

2. This is most likely caused by a missing `code` command in your system `PATH`.

3. To fix this, go to the Command Palette, through `View` &rarr; `Command Palette` (or <kbd>Cmd</kbd> /<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>)

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/editor-path/command-palette.png", "alt": "VS Code command palette", "caption": "The command palette on Visual Studio Code", "aspectRatio": 2, "width": 600, "zoom": false }}

4. Type `code` to find the `Install 'code' command in PATH` option, and press enter to select it:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/editor-path/code-install.png", "alt": "VS Code add 'code' to PATH", "caption": "Install 'code' option", "aspectRatio": 2, "width": 600, "zoom": false }}

## When using another editor

Toolpad Studio understands the `$EDITOR` environment variable. Make sure you can open your editor of choice from the command line. Then provide the command in the `$EDITOR` environment variable. You can use a `.env` file in the root of your project to set the variable.

For example with WebStorm, make sure to [install the CLI command](https://www.jetbrains.com/help/webstorm/working-with-the-ide-features-from-command-line.html#standalone) in the `PATH` variable, then declare the WebStorm command:

```bash
# ./.env

EDITOR=webstorm
```
