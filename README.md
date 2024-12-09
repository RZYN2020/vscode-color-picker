# VSCode Color Picker Extension

这个 VSCode 插件可以自动识别文本中的十六进制颜色代码（如 #7ee787），并提供以下功能：

1. 在颜色代码旁边显示颜色预览
2. 点击颜色代码时可以打开颜色选择器进行调整

## 功能

- 自动识别文本中的十六进制颜色代码
- 在颜色代码旁边显示颜色预览块
- 支持通过颜色选择器修改颜色
- 实时更新颜色预览

## 使用方法

1. 在任何文本文件中，当输入形如 #RRGGBB 的颜色代码时，会自动在旁边显示颜色预览
2. 将光标放在颜色代码上，按下 `F1` 或 `Ctrl+Shift+P`，然后输入 "Pick Color" 来打开颜色选择器
3. 在颜色选择器中调整颜色，确认后会自动更新颜色代码

## 支持的文件类型

- JSON
- JavaScript
- TypeScript
- CSS
- HTML
- 其他文本文件

## 安装方法

1. 克隆此仓库
2. 运行 `npm install`
3. 按 F5 在新窗口中调试
4. 或者运行 `npm run compile` 后将整个文件夹复制到 VSCode 扩展目录

## English README

### Color Picker VSCode Extension

#### Overview
Color Picker is a powerful VSCode extension that enhances your color editing experience by providing an intuitive, built-in color selection interface.

#### Features
- Interactive Color Picker
- Supports Hex Color Codes
- Works with Multiple File Types
- Real-time Color Preview

#### Supported File Types
- JSON
- JavaScript
- TypeScript
- CSS
- HTML

#### Installation
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Color Picker"
4. Click Install

#### Usage
##### Picking a Color
1. Place your cursor on a hex color code (e.g., `#FF0000`)
2. Use one of these methods to open the Color Picker:
   - Press `Ctrl+Alt+C` (Windows/Linux)
   - Press `Cmd+Alt+C` (macOS)
   - Open Command Palette (Ctrl+Shift+P) and type "Pick Color"

##### Color Picker Interface
- Use RGB sliders to adjust color
- See real-time color preview
- Confirm color by clicking "Confirm"

#### Keyboard Shortcut
- `Ctrl+Alt+C` (Windows/Linux)
- `Cmd+Alt+C` (macOS)

#### Requirements
- VSCode 1.85.0 or higher

#### Known Issues
- Only supports 6-digit hex color codes
- Works best with standard color formats

#### Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

#### License
MIT

#### Release Notes
##### 0.0.1
- Initial release of Color Picker extension
