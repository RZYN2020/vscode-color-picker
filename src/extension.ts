import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // 创建颜色装饰器类型
    const colorDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: ' ',
            border: 'solid 0.1em #000',
            margin: '0.1em 0.2em 0 0.2em',
            width: '0.8em',
            height: '0.8em'
        },
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
    });

    let activeEditor = vscode.window.activeTextEditor;
    let timeout: NodeJS.Timeout | undefined = undefined;

    // 更新装饰器
    function updateDecorations() {
        if (!activeEditor) {
            return;
        }

        // 检查当前文件是否在禁用列表中
        const config = vscode.workspace.getConfiguration('colorPicker');
        const disabledFiles = config.get<string[]>('disabledFiles', []);
        if (disabledFiles.some(pattern => 
            new RegExp(pattern).test(activeEditor!.document.fileName))) {
            return;
        }

        const regEx = /#([A-Fa-f0-9]{6})\b/g;
        const text = activeEditor.document.getText();
        const colorDecorations: vscode.DecorationOptions[] = [];

        let match;
        while ((match = regEx.exec(text))) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration = {
                range: new vscode.Range(startPos, endPos),
                renderOptions: {
                    before: {
                        backgroundColor: match[0]
                    }
                }
            };
            colorDecorations.push(decoration);
        }

        activeEditor.setDecorations(colorDecorationType, colorDecorations);
    }

    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations();
        }
    }

    // 注册命令：打开颜色选择器
    let disposable = vscode.commands.registerCommand('color-picker.pickColor', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('没有活动的文本编辑器');
            return;
        }

        const position = editor.selection.active;
        const wordRange = editor.document.getWordRangeAtPosition(position, /#[A-Fa-f0-9]{6}\b/);
        
        if (!wordRange) {
            vscode.window.showInformationMessage('未找到有效的颜色值。请将光标放在十六进制颜色值上（如 #FF0000）');
            return;
        }

        const currentColor = editor.document.getText(wordRange);
        
        // 验证颜色值的有效性
        const colorRegex = /^#[0-9A-Fa-f]{6}$/;
        if (!colorRegex.test(currentColor)) {
            vscode.window.showErrorMessage(`无效的颜色值：${currentColor}。请使用标准的十六进制颜色格式，如 #FF0000`);
            return;
        }

        // 创建并显示 webview
        const panel = vscode.window.createWebviewPanel(
            'colorPicker',
            'Color Picker',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(context.extensionPath)]
            }
        );

        // 获取 HTML 内容
        const getWebviewContent = (color: string) => {
            return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Color Picker</title>
                <style>
                    body {
                        padding: 10px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .color-picker-container {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        width: 300px;
                    }
                    .color-preview {
                        width: 100%;
                        height: 50px;
                        border: 1px solid #ccc;
                        margin-bottom: 10px;
                    }
                    .color-inputs {
                        display: flex;
                        gap: 10px;
                    }
                    .color-slider {
                        width: 100%;
                        margin: 5px 0;
                    }
                    .color-value {
                        font-family: monospace;
                        padding: 5px;
                        text-align: center;
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        border-radius: 3px;
                    }
                    button {
                        margin-top: 10px;
                        padding: 8px 16px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                    }
                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    label {
                        color: var(--vscode-foreground);
                    }
                </style>
            </head>
            <body>
                <div class="color-picker-container">
                    <div class="color-preview" id="colorPreview"></div>
                    <div>
                        <label>Red:</label>
                        <input type="range" min="0" max="255" value="0" class="color-slider" id="redSlider">
                    </div>
                    <div>
                        <label>Green:</label>
                        <input type="range" min="0" max="255" value="0" class="color-slider" id="greenSlider">
                    </div>
                    <div>
                        <label>Blue:</label>
                        <input type="range" min="0" max="255" value="0" class="color-slider" id="blueSlider">
                    </div>
                    <div class="color-value" id="hexValue">#000000</div>
                    <button id="confirmButton">Confirm</button>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    const colorPreview = document.getElementById('colorPreview');
                    const redSlider = document.getElementById('redSlider');
                    const greenSlider = document.getElementById('greenSlider');
                    const blueSlider = document.getElementById('blueSlider');
                    const hexValue = document.getElementById('hexValue');
                    const confirmButton = document.getElementById('confirmButton');

                    // 初始化颜色
                    function initializeColor(color) {
                        const r = parseInt(color.substr(1, 2), 16);
                        const g = parseInt(color.substr(3, 2), 16);
                        const b = parseInt(color.substr(5, 2), 16);
                        
                        redSlider.value = r;
                        greenSlider.value = g;
                        blueSlider.value = b;
                        updateColor();
                    }

                    // 更新颜色显示
                    function updateColor() {
                        const r = parseInt(redSlider.value);
                        const g = parseInt(greenSlider.value);
                        const b = parseInt(blueSlider.value);
                        
                        const hex = '#' + 
                            r.toString(16).padStart(2, '0') + 
                            g.toString(16).padStart(2, '0') + 
                            b.toString(16).padStart(2, '0');
                        
                        colorPreview.style.backgroundColor = hex;
                        hexValue.textContent = hex;
                    }

                    // 监听滑块变化
                    redSlider.addEventListener('input', updateColor);
                    greenSlider.addEventListener('input', updateColor);
                    blueSlider.addEventListener('input', updateColor);

                    // 确认按钮点击事件
                    confirmButton.addEventListener('click', () => {
                        vscode.postMessage({
                            type: 'colorSelected',
                            color: hexValue.textContent
                        });
                    });

                    // 初始化颜色值
                    initializeColor('${color}');
                </script>
            </body>
            </html>`;
        };

        // 设置 webview 内容
        panel.webview.html = getWebviewContent(currentColor);

        // 处理来自 webview 的消息
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.type) {
                    case 'colorSelected':
                        const newColor = message.color;
                        await editor.edit(editBuilder => {
                            editBuilder.replace(wordRange, newColor.toLowerCase());
                        });
                        panel.dispose();
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    // 监听事件
    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations(true);
        }
    }, null, context.subscriptions);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
