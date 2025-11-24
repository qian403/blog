---
title: uv 完全指南：極速 Python 套件與專案管理工具
published: 2025-11-24
description: 'uv 是一個用 Rust 編寫的極速 Python 包和專案管理器，比 pip 快 10-100 倍！一個工具取代 pip、pip-tools、pipx、poetry、pyenv、virtualenv 等多種工具。'
image: ''
tags: [uv, Python, Package Manager, Rust, Development, Tools]
category: 'Development'
draft: false 
lang: 'zh-TW'
---

# uv：極速 Python 套件與專案管理工具
:::tip 
**已經在使用 uv 了嗎？**  
如果你只是忘記在某些場景下該怎麼下命令，可以直接跳到 [常見場景](#常見場景) 章節快速查找！
如果是忘記指令怎麼下，請直接跳到 [常用命令速查](#常用命令速查) 章節快速查找！
:::

## 什麼是 uv？

`uv` 是一個用 **Rust** 編寫的極速 Python 包和專案管理器，由 [Astral](https://astral.sh) 開發（也就是創造了超快 Python Linter [Ruff](https://github.com/astral-sh/ruff) 的那個團隊！）。

簡單來說，uv 就是一個**超級快速**的 Python 工具，並且下載套件時支援多線程下載，可以幫你管理：
- 📦 Python 套件（取代 pip）
- 🗂️ 專案依賴（取代 poetry）
- 🔧 開發工具（取代 pipx）
- 🐍 Python 版本（取代 pyenv）
- 🌐 虛擬環境（取代 virtualenv）


號稱比傳統的 `pip` **快 10-100 倍**！




## 安裝 uv

### macOS / Linux

使用官方獨立安裝程式：

```bash
$ curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Windows

使用 PowerShell：

```powershell
PS> powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 其他安裝方式

uv 也可以通過以下方式安裝：

```bash
# 使用 pip
pip install uv

# 使用 Homebrew (macOS)
brew install uv

# 使用 pipx
pipx install uv
```

安裝完成後，可以執行以下命令確認安裝成功：

```bash
$ uv --version
```

## 專案管理

uv 可以管理專案依賴項和環境，支援鎖文件、工作區等，類似於 `poetry` 或 `rye`。

### 創建新專案

```bash
$ uv init example
Initialized project `example` at `/home/user/example`

$ cd example
```

### 添加依賴

```bash
$ uv add ruff
Creating virtual environment at: .venv
Resolved 2 packages in 170ms
Built example @ file:///home/user/example
Prepared 2 packages in 627ms
Installed 2 packages in 1ms
  + example==0.1.0 (from file:///home/user/example)
  + ruff==0.5.4
```

### 運行程式

```bash
$ uv run ruff check
All checks passed!
```

### 鎖定依賴

```bash
$ uv lock
Resolved 2 packages in 0.33ms
```

### 同步環境

```bash
$ uv sync
Resolved 2 packages in 0.70ms
Audited 1 package in 0.02ms
```

## 腳本管理

uv 可以管理單文件腳本的依賴項和環境，這對於快速編寫小工具非常有用！

### 創建腳本並添加依賴

```bash
$ echo 'import requests; print(requests.get("https://astral.sh"))' > example.py

$ uv add --script example.py requests
Updated `example.py`
```

這會在 `example.py` 頂部添加內聯元數據來聲明依賴。

### 運行腳本

```bash
$ uv run example.py
Reading inline script metadata from: example.py
Installed 5 packages in 12ms
<Response [200]>
```

uv 會自動創建隔離的虛擬環境來運行腳本，不會污染全局環境！

## 工具管理

uv 可以執行和安裝由 Python 包提供的命令行工具，類似於 `pipx`。

### 臨時運行工具

使用 `uvx`（`uv tool run` 的別名）在臨時環境中運行工具：

> 💡 **什麼是臨時環境？**  
> 臨時環境是指 uv 會為這個工具創建一個獨立的虛擬環境，運行完畢後就會自動清理，不會在你的系統中留下任何痕跡。這樣你就可以快速試用工具，而不用擔心污染系統環境或與其他套件版本衝突！

```bash
$ uvx pycowsay 'hello world!'
Resolved 1 package in 167ms
Installed 1 package in 9ms
  + pycowsay==0.0.0.2
  ------------
< hello world! >
  ------------
   \   ^__^
    \  (oo)\_______
       (__)\       )\/\
           ||----w |
           ||     ||
```

### 安裝工具

```bash
$ uv tool install ruff
Resolved 1 package in 6ms
Installed 1 package in 2ms
  + ruff==0.5.4
Installed 1 executable: ruff

$ ruff --version
ruff 0.5.4
```

## Python 版本管理

uv 可以安裝 Python 並允許在版本之間快速切換，取代 `pyenv` 的功能。

### 安裝多個 Python 版本

```bash
$ uv python install 3.10 3.11 3.12
Searching for Python versions matching: Python 3.10
Searching for Python versions matching: Python 3.11
Searching for Python versions matching: Python 3.12
Installed 3 versions in 3.42s
  + cpython-3.10.14-macos-aarch64-none
  + cpython-3.11.9-macos-aarch64-none
  + cpython-3.12.4-macos-aarch64-none
```

### 創建指定版本的虛擬環境

```bash
$ uv venv --python 3.12.0
Using CPython 3.12.0
Creating virtual environment at: .venv
Activate with: source .venv/bin/activate
```

### 運行特定 Python 版本

```bash
$ uv run --python pypy@3.8 -- python
Python 3.8.16 (a9dbdca6fc3286b0addd2240f11d97d8e8de187a, Dec 29 2022, 11:45:30)
[PyPy 7.3.11 with GCC Apple LLVM 13.1.6 (clang-1316.0.21.2.5)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>>>
```

### 固定專案 Python 版本

在當前目錄中使用特定的 Python 版本：

```bash
$ uv python pin 3.11
Pinned `.python-version` to `3.11`
```

這會創建一個 `.python-version` 文件，uv 會自動使用這個版本。

## pip 兼容接口

如果你已經習慣使用 `pip`，uv 提供了兼容的命令，讓你無縫遷移！

### 創建虛擬環境

```bash
$ uv venv
Using CPython 3.12.3
Creating virtual environment at: .venv
Activate with: source .venv/bin/activate
```
### 關閉虛擬環境

```bash
$ uv venv deactivate
```
### 編譯需求文件

將需求編譯為平台無關的需求文件：

```bash
$ uv pip compile requirements.in \
    --universal \
    --output-file requirements.txt
Resolved 43 packages in 12ms
```

### 安裝套件

```bash
$ uv pip install requests
Resolved 5 packages in 12ms
Installed 5 packages in 23ms
  + certifi==2024.7.4
  + charset-normalizer==3.3.2
  + idna==3.7
  + requests==2.32.3
  + urllib3==2.2.2
```

### 同步需求

```bash
$ uv pip sync requirements.txt
Resolved 43 packages in 11ms
Installed 43 packages in 208ms
  + babel==2.15.0
  + black==24.4.2
  + certifi==2024.7.4
  ...
```

## 常用命令速查

| 功能 | uv 命令 | 傳統工具 |
|------|---------|----------|
| 創建專案 | `uv init <name>` | - |
| 添加依賴 | `uv add <package>` | `poetry add` |
| 移除依賴 | `uv remove <package>` | `poetry remove` |
| 安裝套件 | `uv pip install <package>` | `pip install` |
| 創建虛擬環境 | `uv venv` | `python -m venv` |
| 運行程式 | `uv run <command>` | `poetry run` |
| 運行工具 | `uvx <tool>` | `pipx run` |
| 安裝工具 | `uv tool install <tool>` | `pipx install` |
| 安裝 Python | `uv python install <version>` | `pyenv install` |
| 鎖定依賴 | `uv lock` | `poetry lock` |
| 同步環境 | `uv sync` | `poetry install` |

## 常見場景

### 場景 1：分享專案環境給同事

當你開發完一個專案，想要讓同事能夠快速建立相同的環境時：

**步驟 1：鎖定依賴**

在你的專案目錄中，執行鎖定命令：

```bash
$ uv lock
Resolved 25 packages in 0.5ms
```

這會生成一個 `uv.lock` 文件，記錄了所有依賴的精確版本。

**步驟 2：提交到版本控制**

將以下文件提交到 Git：

```bash
$ git add pyproject.toml uv.lock
$ git commit -m "Add project dependencies"
$ git push
```

**步驟 3：同事取得專案後**

同事只需要執行：

```bash
$ git clone <repository-url>
$ cd <project-name>
$ uv sync
```

這樣就能建立完全相同的開發環境了！✨

### 場景 2：接手別人的專案

當你拿到一個使用 uv 管理的專案源碼時：

**方法 1：使用 uv（推薦）**

```bash
# 1. 進入專案目錄
$ cd project-name

# 2. 同步環境（會自動創建 .venv 並安裝依賴）
$ uv sync
Resolved 25 packages in 0.70ms
Installed 25 packages in 150ms

# 3. 運行專案
$ uv run python main.py
```

**方法 2：如果專案還有 requirements.txt**

```bash
# 創建虛擬環境
$ uv venv

# 啟動虛擬環境
$ source .venv/bin/activate  # macOS/Linux
# 或
$ .venv\Scripts\activate     # Windows

# 安裝依賴
$ uv pip install -r requirements.txt
```

### 場景 3：確保團隊使用相同的 Python 版本

**步驟 1：專案負責人固定 Python 版本**

```bash
$ uv python pin 3.11
Pinned `.python-version` to `3.11`
```

這會創建一個 `.python-version` 文件。

**步驟 2：提交 .python-version 到 Git**

```bash
$ git add .python-version
$ git commit -m "Pin Python version to 3.11"
```

**步驟 3：團隊成員拉取後**

```bash
$ git pull
$ uv sync
```

uv 會自動檢查並使用正確的 Python 版本！如果本地沒有，會提示安裝：

```bash
$ uv python install
```

### 場景 4：更新專案依賴

當你需要更新某個套件版本時：

```bash
# 更新單一套件
$ uv add requests@latest

# 或指定版本
$ uv add "requests>=2.31.0"

# 重新鎖定
$ uv lock

# 提交更新
$ git add pyproject.toml uv.lock
$ git commit -m "Update requests to latest version"
```

團隊成員拉取後執行 `uv sync` 即可同步更新。

### 場景 5：CI/CD 環境設定

在 GitHub Actions 或其他 CI/CD 環境中使用 uv：

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh
      
      - name: Set up Python
        run: uv python install
      
      - name: Install dependencies
        run: uv sync
      
      - name: Run tests
        run: uv run pytest
```

這樣就能確保 CI 環境和本地開發環境完全一致！

### 場景 6：團隊中混用 pip 和 uv

當團隊中有人使用 pip，也有人使用 uv 時，可以透過以下策略協作：

**策略 1：同時維護兩種依賴文件**

專案同時維護 `pyproject.toml` 和 `requirements.txt`，讓兩種工具的使用者都能順利工作：

```bash
# 專案結構
project/
├── pyproject.toml      # uv 使用者使用
├── uv.lock            # uv 鎖定文件
└── requirements.txt   # pip 使用者使用
```

**uv 使用者的工作流程：**

```bash
# 添加新依賴
$ uv add requests

# 生成 requirements.txt 給 pip 使用者
$ uv pip compile pyproject.toml -o requirements.txt

# 提交兩個文件
$ git add pyproject.toml uv.lock requirements.txt
$ git commit -m "Add requests dependency"
```

**pip 使用者的工作流程：**

```bash
# 拉取更新
$ git pull

# 使用 pip 安裝
$ pip install -r requirements.txt
```

**策略 2：使用 uv 的 pip 兼容模式**

pip 使用者也可以使用 uv 的 pip 命令，維持原有的工作流程：

```bash
# 使用 uv 的 pip 命令，速度更快：
$ uv pip install -r requirements.txt    # 取代 pip install
$ uv pip freeze > requirements.txt      # 取代 pip freeze
$ uv venv                               # 取代 python -m venv
```

這樣可以享受 uv 的速度優勢，但維持原有的工作流程！

**協作注意事項：**

1. **在 README 中說明**：清楚記錄團隊使用哪種工具，以及如何安裝依賴。

:::important
文檔很重要，文檔很重要，文檔很重要，因為很重要所以要說三次，如果同事不愛寫文檔，那祝你好運
:::

   ```markdown
   ## 安裝依賴
   
   ### 使用 uv
   \`\`\`bash
   uv sync
   \`\`\`
   
   ### 使用 pip
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
   ```

2. **定期同步**：如果維護兩種文件，記得在添加依賴後更新 `requirements.txt`

3. **使用 pre-commit hook**：自動同步依賴文件

   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash
   if [ -f pyproject.toml ]; then
       uv pip compile pyproject.toml -o requirements.txt
       git add requirements.txt
   fi
   ```

## 注意事項

- uv 目前還在快速發展中，某些功能可能還不夠穩定
- 如果遇到問題，可以查看[官方文檔](https://docs.astral.sh/uv/)或[中文文檔](https://uv.oaix.tech)
- 建議在新專案中使用，舊專案遷移前請做好備份

## 總結

uv 是一個非常強大的 Python 工具，整合了眾多功能，並且速度極快。如果你：

- 受夠了 pip 的慢速度
- 想要嘗試看看更好的依賴管理
- 需要管理多個 Python 版本
- 想要一個統一的工具鏈

那麼 uv 絕對值得一試！

## 參考資料

- [uv 中文文檔](https://uv.oaix.tech)
- [uv 官方文檔](https://docs.astral.sh/uv/)
- [uv GitHub](https://github.com/astral-sh/uv)
- [Astral 官網](https://astral.sh)
