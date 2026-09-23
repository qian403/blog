---
title: 'Debian、Ubuntu 更換 APT 來源：改用 TWDS 鏡像站'
published: 2026-09-23
description: '直接修改 Debian、Ubuntu 的 APT 來源，改用 TWDS 台灣數位串流鏡像站，附 sources.list 與 .sources 設定範例。'
tags: [Linux, Debian, Ubuntu, APT, Mirror]
draft: false
---

## Debian

如果用 `/etc/apt/sources.list`，開啟設定檔

```bash
sudo vim /etc/apt/sources.list
```

把 Debian 官方來源的網域改成 `mirror.twds.com.tw`。以 Debian 12（`bookworm`）為例，改完會像這樣

```text
deb https://mirror.twds.com.tw/debian bookworm main non-free-firmware
deb https://mirror.twds.com.tw/debian bookworm-updates main non-free-firmware
deb https://mirror.twds.com.tw/debian-security bookworm-security main non-free-firmware
```

原本有 `deb-src` 的話，也修改對應網址。只改網址，版本代號、套件分類與其他選項維持原樣

### 使用 .sources 的版本

如果來源放在 `/etc/apt/sources.list.d/debian.sources`，就編輯這份，不用另外新增 `sources.list`：

```bash
sudo vim /etc/apt/sources.list.d/debian.sources
```

把一般套件的 `URIs:` 改成 `/debian`，安全更新的改成 `/debian-security`。Debian 13（`trixie`）範例如下：

```text
Types: deb
URIs: https://mirror.twds.com.tw/debian
Suites: trixie trixie-updates
Components: main non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

Types: deb
URIs: https://mirror.twds.com.tw/debian-security
Suites: trixie-security
Components: main non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
```

如果是 Debian 12，保留原本的 `bookworm` 系列代號。

## Ubuntu

Ubuntu 24.04 通常使用 `/etc/apt/sources.list.d/ubuntu.sources`：

```bash
sudo vim /etc/apt/sources.list.d/ubuntu.sources
```

將一般套件與安全更新段落的 `URIs:` 都改成 `https://mirror.twds.com.tw/ubuntu`，其他欄位不變。以 Ubuntu 24.04（`noble`）為例：

```text
Types: deb
URIs: https://mirror.twds.com.tw/ubuntu
Suites: noble noble-updates noble-backports
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: https://mirror.twds.com.tw/ubuntu
Suites: noble-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

如果是 ARM 主機，原本使用 `ports.ubuntu.com/ubuntu-ports`，則把網址改成 `https://mirror.twds.com.tw/ubuntu-ports`。

### 使用 sources.list 的版本

Ubuntu 22.04 若使用 `/etc/apt/sources.list`，開啟後修改現有來源網址：

```bash
sudo vim /etc/apt/sources.list
```

以 Ubuntu 22.04（`jammy`）為例：

```text
deb https://mirror.twds.com.tw/ubuntu jammy main restricted universe multiverse
deb https://mirror.twds.com.tw/ubuntu jammy-updates main restricted universe multiverse
deb https://mirror.twds.com.tw/ubuntu jammy-backports main restricted universe multiverse
deb https://mirror.twds.com.tw/ubuntu jammy-security main restricted universe multiverse
```

同樣只改網址，保留原本的版本代號、分類與選項；Ports 主機則使用 `/ubuntu-ports`。

## 更新套件索引

按 `Esc`，輸入 `:wq` 後按 Enter 儲存並離開 Vim。接著執行：

```bash
sudo apt update
```

看到來源出現 `mirror.twds.com.tw`，而且沒有錯誤，就完成了。

參考：[TWDS 鏡像站](https://mirror.twds.com.tw/) 
