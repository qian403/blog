---
title: 'Better Nano 靜態分析：它不是 Nano 外掛，而是替換成 Vim'
published: 2024-05-06
lastUpdated: 2026-09-21
description: '對 better_nano 的固定版本做靜態檢查，還原執行檔內的安裝命令、說明它如何替換 /usr/bin/nano，並提供安全的檢查與復原方式。'
tags: [Nano, Vim, Linux, Terminal, Security, Static Analysis]
draft: false
---

## 結論先說

`better_nano` 不是替 Nano 安裝外掛，也沒有修改 `.nanorc`。目前儲存庫提供的 `BetterNano` 執行檔會把 `/usr/bin/nano` 移到 `/usr/bin/nano_original`，再建立一個名為 `/usr/bin/nano`、實際指向 `/usr/bin/vim` 的符號連結。

換句話說，安裝後輸入 `nano`，啟動的是 Vim。這會改動套件管理器維護的系統檔案；如果系統沒有 `/usr/bin/vim`，仍可能建立一個目標不存在的符號連結，導致 `nano` 無法啟動。因此不建議在日常使用的電腦上執行。

本文檢查的是儲存庫 commit [`119e774`](https://github.com/osga24/better_nano/tree/119e77425118d43bd5cb5e6e152103f62578b6ef)，檢查日期為 2026-09-21。之後若專案有更新，檔案內容與雜湊可能不同。

## 儲存庫裡實際有什麼

在上述版本中，根目錄只有 `README.md` 與 `BetterNano` 兩個檔案，沒有 README 所說的可閱讀安裝 script，也沒有原始碼、release 或授權檔案。

先固定 commit，再做不執行程式的檢查：

```bash
git clone https://github.com/osga24/better_nano.git
cd better_nano
git checkout 119e77425118d43bd5cb5e6e152103f62578b6ef
file BetterNano
sha256sum BetterNano
```

這個版本的結果是：

```text
BetterNano: ELF 64-bit LSB pie executable, ARM aarch64, dynamically linked, not stripped
f0fcf098e2f9fe48e227a26bc2866a7a3cfabac975e4dbdef6c471cec1f19f97  BetterNano
```

它是給 AArch64 Linux 使用的動態連結執行檔，不是所有 Linux 電腦都能執行。`sha256sum` 只能確認取得的檔案是否與本文檢查的版本相同，不能證明程式安全。

## 不執行檔案也能還原安裝命令

使用 `strings` 檢查可列印字串時，可以找到以下內容：

```bash
strings -a -n 4 BetterNano
```

```text
echo 'c3VkbyBtdiAvdXNyL2Jpbi9uYW5vIC91c3IvYmluL25hbm9fb3JpZ2luYWwgJiYgc3VkbyBsbiAtcyAvdXNyL2Jpbi92aW0gL3Vzci9iaW4vbmFubw==' | base64 -d | bash
```

加上偏移量可確認這段字串位於檔案位址 `0x1720`：

```bash
strings -a -t x BetterNano | grep "echo 'c3Vkby"
```

再用 `objdump -d --demangle BetterNano` 檢查 `main`，可以看到程式把 `0x1720` 的位址放進第一個參數暫存器，緊接著呼叫 `system()`：

```text
d7c: adrp x0, 0x1000
d80: add  x0, x0, #0x720
d84: bl   0x950 <system@plt>
```

因此，這不只是未使用的文字或匯入符號；`main` 確實會把這段命令交給 Shell 執行。

這段字串把命令用 Base64 包起來，再直接交給 Bash。不要照原字串執行；只解碼、不接到 Shell，就能查看內容：

```bash
encoded='c3VkbyBtdiAvdXNyL2Jpbi9uYW5vIC91c3IvYmluL25hbm9fb3JpZ2luYWwgJiYgc3VkbyBsbiAtcyAvdXNyL2Jpbi92aW0gL3Vzci9iaW4vbmFubw=='
printf '%s' "$encoded" | base64 -d
```

解碼結果是：

```bash
sudo mv /usr/bin/nano /usr/bin/nano_original && sudo ln -s /usr/bin/vim /usr/bin/nano
```

這兩個動作分別是：

1. 把套件安裝的 Nano 執行檔改名為 `/usr/bin/nano_original`。
2. 建立 `/usr/bin/nano` 符號連結，目標是 `/usr/bin/vim`。

Base64 是編碼，不是加密，也不是安全機制。從已內嵌的命令與上述呼叫位置，就能知道它會改動哪些路徑，以及為什麼不該直接提供 sudo 密碼執行。這項分析只描述固定 commit 的安裝行為，不代表已窮盡執行檔的所有功能。

## 這種做法的風險

- **名稱與行為不一致**：使用者輸入 `nano`，實際得到 Vim；兩者的操作模式與離開方式完全不同。
- **直接修改 `/usr/bin`**：這些檔案通常由套件管理器維護，手動搬移可能造成套件驗證、升級或移除時的狀態不一致。
- **可能建立無效連結**：命令先移走 Nano，才建立連結。`ln -s` 不會確認連結目標是否存在；若 `/usr/bin/vim` 不存在，安裝仍可能顯示成功，但 `nano` 無法啟動。
- **平台限制沒有說清楚**：執行檔是 AArch64，x86-64 Linux 無法直接執行；動態連結版本也可能不符合較舊的發行版。
- **缺少可審查原始碼與解除安裝程序**：使用者無法從儲存庫重現編譯結果，也沒有專案提供的復原工具。

這些問題不代表檔案一定含有惡意程式，但已足以判斷安裝方式不透明，而且不符合一般 Linux 套件管理習慣。

## 已執行時如何檢查與復原

先確認目前狀態，不要直接刪除檔案：

```bash
command -v nano
ls -l /usr/bin/nano /usr/bin/nano_original /usr/bin/vim
readlink /usr/bin/nano
```

只有在輸出明確顯示 `/usr/bin/nano` 是指向 `/usr/bin/vim` 的符號連結，而且 `/usr/bin/nano_original` 是原本的 Nano 執行檔時，才依序復原：

```bash
sudo rm /usr/bin/nano
sudo mv /usr/bin/nano_original /usr/bin/nano
nano --version
```

如果檔案狀態不同、`nano_original` 不存在，或無法確定它是否為原始檔案，應交給發行版的套件管理器重新安裝 Nano，不要任意搬移其他檔案。例如 Debian／Ubuntu 可用：

```bash
sudo apt install --reinstall nano
```

Fedora 可用 `sudo dnf reinstall nano`，Arch Linux 可用 `sudo pacman -S nano`。完成後再用套件管理器的驗證功能檢查檔案狀態。

## 想改善 Nano，不需要替換執行檔

GNU Nano 本身已支援行號、滑鼠、縮排與語法定義。先備份個人設定檔，再編輯 `~/.nanorc`：

```bash
cp -a ~/.nanorc ~/.nanorc.backup 2>/dev/null || true
nano ~/.nanorc
```

可依需求加入：

```text
set linenumbers
set mouse
set tabsize 4
set tabstospaces
include "/usr/share/nano/*.nanorc"
```

不同發行版的語法定義路徑可能不同，可以先查找：

```bash
find /usr/share -path '*nano*' -name '*.nanorc'
```

若設定造成問題，刪除新增的設定，或把備份還原即可。這種方式不需要把 Nano 換成另一個編輯器，也不會修改套件管理器維護的 `/usr/bin`。
