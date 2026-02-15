---
title: Fail2ban SSH 防護完整使用教學：安裝、設定與參數詳解
published: 2025-12-10
description: '完整的 Fail2ban SSH 防護教學指南。從安裝到進階設定，詳細說明 Fail2ban 如何自動封鎖暴力破解攻擊，包含 jail 設定、參數調整與實戰測試，保護你的 Linux 伺服器安全。'
image: ''
tags: [fail2ban, ssh, linux, cybersecurity, server-security, network-security, iptables, ubuntu, debian]
category: 'Linux'
draft: false 
lang: ''
---

## 簡介

Fail2ban 是一款強大的開源入侵防禦工具，專門用於保護 Linux 系統免受暴力破解攻擊。它透過即時監控系統日誌檔案，自動偵測異常登入行為，並將可疑的 IP 位址加入防火牆黑名單，有效提升伺服器的安全性。

對於暴露在公網上的 SSH 服務來說，Fail2ban 是不可或缺的第一道防線，能夠有效阻擋自動化的密碼暴力破解攻擊。

---

## 安裝 Fail2ban

### Ubuntu / Debian 系統

使用 APT 套件管理器安裝 Fail2ban：

```bash
sudo apt-get update
sudo apt-get install fail2ban -y
```

安裝完成後，Fail2ban 服務會自動啟動。

---

## 基礎設定

### 主要設定檔案

Fail2ban 的主要設定檔位於 `/etc/fail2ban` 目錄下。核心設定檔為 `/etc/fail2ban/fail2ban.conf`。

**重要提醒**：為避免套件更新時覆蓋你的自訂設定，我們需要建立一個本地設定檔 `/etc/fail2ban/fail2ban.local`，所有修改都在此檔案中進行。

複製預設設定檔：

```bash
sudo cp /etc/fail2ban/fail2ban.conf /etc/fail2ban/fail2ban.local
```

設定開機自動啟動：

```bash
sudo systemctl enable fail2ban
```

### 設定日誌檔案位置

編輯 `/etc/fail2ban/fail2ban.local`，找到 `[Definition]` 區段，設定日誌檔案路徑：

```bash
[Definition]
logtarget = /var/log/fail2ban/fail2ban.log
```

修改完成後，需要手動建立日誌目錄並重啟服務（系統不會自動建立）：

```bash
sudo mkdir -p /var/log/fail2ban  # 建立日誌目錄
sudo service fail2ban restart    # 重啟服務
```

### 檢查服務狀態

重啟完成後，可以檢查 Fail2ban 服務是否正常運作：

```bash
sudo service fail2ban status
```

如果設定正確，你會看到類似以下的輸出：

```
● fail2ban.service - Fail2Ban Service
     Loaded: loaded (/usr/lib/systemd/system/fail2ban.service; enabled; preset: enabled)
    Drop-In: /run/systemd/system/service.d
             └─zzz-lxc-service.conf
     Active: active (running) since Wed 2025-12-10 13:14:12 CST; 3s ago
 Invocation: 5d78b37f2bc84ac891657d15c7014770
       Docs: man:fail2ban(1)
   Main PID: 4002 (fail2ban-server)
      Tasks: 5 (limit: 14406)
     Memory: 25M (peak: 25M)
        CPU: 66ms
     CGroup: /system.slice/fail2ban.service
             └─4002 /usr/bin/python3 /usr/bin/fail2ban-server -xf start

Dec 10 13:14:12 owo systemd[1]: Started fail2ban.service - Fail2Ban Service.
Dec 10 13:14:12 owo fail2ban-server[4002]: Server ready
```

---

## Jail 監獄設定

### 什麼是 Jail？

`jail.conf` 是 Fail2ban 的核心封禁規則設定檔。Jail（監獄）定義了：
- **誰應該被抓**：哪些行為屬於可疑或惡意？
- **怎麼處罰**：封鎖多久？封鎖哪些端口？

### 建立本地 Jail 設定

同樣地，我們需要複製一份本地設定檔來避免被更新覆蓋：

```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo vim /etc/fail2ban/jail.local
```

### 啟用 SSH 防護

在預設狀態下，Fail2ban 對所有服務都是停用的，因此我們需要手動啟用需要的服務。以下以 SSH 為例：

在 `/etc/fail2ban/jail.local` 中找到或新增以下區段：

```ini
[sshd]
enabled = true                    # 啟用 SSH 防護
filter = sshd                     # 使用 sshd 過濾器
maxretry = 3                      # 最大失敗嘗試次數
bantime = 600                     # 封鎖時長（秒）
port = 22                         # SSH 服務端口
logpath = %(sshd_log)s            # SSH 日誌檔案路徑
backend = %(sshd_backend)s        # 日誌讀取後端
```

**設定說明**：
- `enabled = true`：啟用 SSH 監獄
- `filter = sshd`：使用預定義的 sshd 過濾規則
- `maxretry = 3`：允許失敗 3 次後封鎖
- `bantime = 600`：封鎖 10 分鐘（600 秒）
- `port = 22`：監控 SSH 預設端口

修改完成後重啟服務：

```bash
sudo service fail2ban restart
```

---

## 實戰測試

### 模擬攻擊

使用另一台機器嘗試 SSH 登入，並故意輸入錯誤密碼 3 次以上。你會發現第 4 次嘗試時會出現以下錯誤訊息：

```
ssh: connect to host 192.168.139.231 port 22: Connection refused
```

這表示你的 IP 已經被 Fail2ban 成功封鎖。

### 檢查封鎖狀態

使用 `fail2ban-client` 工具檢查當前的封鎖狀態：

```bash
sudo fail2ban-client status sshd
```

你會看到類似以下的輸出，顯示被封鎖的 IP 以及統計資訊：

```bash
Status for the jail: sshd
|- Filter
|  |- Currently failed:	0
|  |- Total failed:	0
|  `- Journal matches:	_SYSTEMD_UNIT=ssh.service + _COMM=sshd
`- Actions
   |- Currently banned:	1
   |- Total banned:	1
   `- Banned IP list:	192.168.139.108
```

---

## 常用參數詳解

以下是 Fail2ban 最常用的參數說明，幫助你進行更精細的調整：

| 參數 | 說明 | 範例值 | 備註與建議 |
| :--- | :--- | :--- | :--- |
| **`ignoreip`** | **IP 白名單**。Fail2ban 絕對不會封鎖這些 IP。請務必將管理用 IP、內部網路 IP 加入，避免誤鎖自己。 | `127.0.0.1/8 192.168.1.5` | 支援 CIDR 格式（如 `/24`），多個 IP 用**空白**分隔 |
| **`bantime`** | **封鎖時長**。被偵測到的 IP 將被封鎖多久。 | `1h`（1小時）<br>`1d`（1天）<br>`-1`（永久） | 預設為 10 分鐘，建議至少設定為 `1h` 或更長 |
| **`findtime`** | **觀察時間窗口**。在多久的時間內累積失敗次數。與 `maxretry` 配合使用。 | `10m`（10分鐘）<br>`1d`（24小時） | 設為 10m 表示攻擊者須在 10 分鐘內連續失敗才會被封鎖，超過時間則計數歸零 |
| **`maxretry`** | **最大容忍失敗次數**。在 `findtime` 期間內允許失敗幾次。 | `3`（嚴格）<br>`5`（預設） | SSH 建議設為 `3`；網頁應用可能誤觸，建議設 `5` 或更多 |
| **`enabled`** | **啟用開關**。是否啟用該 Jail。 | `true` 或 `false` | 除了 `[DEFAULT]` 外，所有 Jail 預設為 `false`，需手動啟用 |
| **`port`** | **監控端口**。指定要封鎖哪個端口的連線。 | `ssh`<br>`http,https`<br>`8080` | 可使用服務名稱（由 `/etc/services` 解析）或直接使用端口號 |
| **`logpath`** | **日誌檔案路徑**。Fail2ban 讀取哪個日誌檔案來偵測攻擊。 | `/var/log/auth.log`<br>`/var/log/nginx/error.log` | **最常設錯的地方**。必須指向服務實際寫入的日誌位置 |
| **`backend`** | **日誌讀取模式**。指定如何讀取日誌。 | `systemd`<br>`auto` | 現代 Linux（Ubuntu 20+, CentOS 7+）建議 SSH 使用 `systemd`，傳統日誌檔使用 `auto` 或 `polling` |
| **`banaction`** | **封鎖動作**。指定使用哪個防火牆工具執行封鎖。 | `iptables-multiport`<br>`ufw`<br>`nftables-multiport` | 必須配合系統安裝的防火牆工具 |

---

## 一些花式用法
:::info
之後補上
:::
