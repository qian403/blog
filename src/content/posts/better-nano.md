---
title: 'Better Nano 專案檢視：安裝前先確認這些風險'
published: 2024-05-06
lastUpdated: 2026-09-03
description: '檢視 better_nano 專案目前的檔案、安裝限制與安全風險，並提供不執行未知程式也能改善 GNU Nano 的設定方式。'
image: ''
tags: [Nano, Linux, Terminal, Editor, Productivity, Shell]
category: 'Linux'
draft: false
lang: 'zh-TW'
---

## 前言：舊版安裝方式已經不適用

這篇文章原本把 [osga24/better_nano](https://github.com/osga24/better_nano) 描述成能開啟語法高亮、行號與滑鼠操作的安裝腳本，並提供 `./install.sh` 的執行方式。重新檢查專案後，這些說明並不符合目前的儲存庫內容，因此不能繼續當成安裝教學使用。

截至 2026 年 9 月，專案根目錄只有 `README.md` 與名為 `BetterNano` 的執行檔，並沒有 `install.sh`。README 表示此工具只支援 Linux，執行時會要求密碼並修改 Nano，但沒有列出實際變更、還原方式或各項功能的技術細節。

## 為什麼不建議直接執行

`BetterNano` 是已編譯的 Linux 執行檔，不是可以直接閱讀的 Shell 腳本。任何會取得 `sudo` 權限並修改系統編輯器的程式，都應該先確認原始碼、變更內容與還原流程；目前這個專案提供的資訊不足以完成這些檢查。

你可以下載檔案做靜態確認，但先不要執行它：

```bash
git clone https://github.com/osga24/better_nano.git
cd better_nano
ls -la
file BetterNano
sha256sum BetterNano
```

若系統沒有 `sha256sum`，macOS 可改用 `shasum -a 256 BetterNano`。雜湊只能用來確認檔案是否改變，不能證明程式安全。若真的要研究，請放在沒有重要資料的拋棄式 Linux 虛擬機，並在執行前建立快照。

## 不安裝額外工具也能改善 Nano

GNU Nano 本身已經支援常見的易用性設定。先備份個人設定檔，再編輯 `~/.nanorc`：

```bash
cp -a ~/.nanorc ~/.nanorc.backup 2>/dev/null || true
nano ~/.nanorc
```

可以依需求加入：

```text
set linenumbers
set mouse
set tabsize 4
set tabstospaces
include "/usr/share/nano/*.nanorc"
```

- `linenumbers` 顯示行號。
- `mouse` 啟用滑鼠操作，實際效果取決於終端機。
- `tabsize` 與 `tabstospaces` 控制縮排。
- `include` 載入系統提供的語法定義；不同 Linux 發行版的路徑可能不同，可先用 `find /usr/share -path '*nano*' -name '*.nanorc'` 查找。

修改後可用 `nano --rcfile ~/.nanorc 檔名` 測試。若設定造成問題，將備份還原即可：

```bash
mv ~/.nanorc.backup ~/.nanorc
```

## 結論

目前不建議把 `better_nano` 當成可直接安裝的 Nano 優化方案；至少應等到專案公開可審查的原始碼、明確列出變更內容，並提供解除安裝方式。只想要行號、滑鼠、縮排與語法高亮時，使用 Nano 自己的設定檔更透明，也更容易復原。
||請不要扁我||
