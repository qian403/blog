---
title: 'Better Nano: 讓你的 Nano 編輯器更好用 (優化腳本推薦)'
published: 2024-05-06
description: '介紹 better-nano 優化腳本，為 Nano 提供各種優化，提升使用效率。'
image: ''
tags: [Nano, Linux, Terminal, Editor, Productivity, Shell]
category: 'Linux'
draft: false 
lang: 'zh-TW'
---

## 前言：為什麼需要優化 Nano？

對於許多 Linux 使用者和系統管理員來說，**Nano** 是最常接觸的文字編輯器之一。它輕量、簡單，且幾乎預裝在所有的 Linux 發行版中。然而，預設的 Nano 功能較為陽春，缺乏語法高亮、行號顯示等現代編輯器常見的功能，這在編輯程式碼或設定檔時可能會降低效率。

這篇文章要介紹一個由 [OsGa](https://www.osga.lol/) 開發的 **better-nano** 優化腳本，它能一鍵升級你的 Nano 使用體驗。

## Better Nano 的主要功能

這個腳本主要針對以下幾個方面進行優化：

1. **外觀優化 (Interface)**：
   - 開啟 **語法高亮 (Syntax Highlighting)**：讓程式碼和設定檔更易於閱讀。
   - 顯示 **行號 (Line Numbers)**：方便除錯和定位特定行數。
   - 改善狀態列資訊。

2. **效能與操作 (Performance & Usability)**：
   - 啟用 **滑鼠支援**：允許使用滑鼠游標移動插入點（視終端機支援而定）。
   - 優化縮排設定 (Tab/Space)。

3. **快捷鍵優化 (Keybindings)**：
   - 調整部分快捷鍵以符合現代操作習慣（具體細節視腳本版本而定）。

## 如何安裝

安裝過程非常簡單，只需要一行指令即可完成。

### 步驟 1：取得腳本

你可以前往 GitHub 專案頁面查看詳細資訊：
[👉 前往 GitHub: osga24/better_nano](https://github.com/osga24/better_nano)

### 步驟 2：執行安裝

通常這類腳本會需要 `git` clone 下來後執行安裝檔。

```bash
git clone https://github.com/osga24/better_nano.git
cd better_nano
chmod +x install.sh
./install.sh
```

> [!WARNING]
> **注意事項**：
> 執行此腳本可能會要求輸入 `sudo` 密碼，因為它需要修改系統層級或使用者層級的 Nano 設定檔（如 `/etc/nanorc` 或 `~/.nanorc`）。請確保你信任來源程式碼再執行。

## 結語

透過 **better-nano**，你可以保留 Nano 的輕量優勢，同時獲得接近 IDE 的視覺體驗。如果你是 Vim 或 Emacs 的苦手，但又需要比預設 Nano 更強大的功能，這個腳本絕對值得一試。

---

*感謝 [OsGa](https://www.osga.lol/) 開發此工具。*
||請不要扁我||