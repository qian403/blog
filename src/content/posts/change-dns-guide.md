---
title: '如何更改電腦與手機的 DNS 設定？完整教學指南'
published: 2025-12-04
description: '詳細教學如何在 Windows、macOS、Linux、iOS 和 Android 等各平台上更改 DNS 設定，提升網路速度與安全性。繞過小紅書封鎖、突破網路長城限制。'
image: ''
tags: [DNS, Network, Windows, macOS, Linux, iOS, Android, Tutorial, 小紅書, 封鎖, RPZ, 網路長城, GFW, DNS封鎖, 翻牆, 網路審查, 小紅書被封, DNS污染]
category: 'Network'
draft: false
lang: 'zh-TW'
---

## 什麼是 DNS？為什麼要更改它？

**DNS（Domain Name System）** 是網際網路的「電話簿」，負責將網址（如 `google.com`）轉換成 IP 位址。

DNS 也常被用作**網路審查**工具。透過 **DNS 污染**、**RPZ (Response Policy Zone)** 等技術，政府或 ISP 可以封鎖特定網站。最近的例子就是台灣政府封鎖**小紅書**。這種手法也是中國**網路長城（GFW）**的手段之一，不過 GFW 還結合了 IP 封鎖、深度封包檢測（DPI）等更複雜的技術。

### 更改 DNS 的好處

- **提升網路速度**：某些 DNS 伺服器回應更快
- **增強安全性**：防止釣魚網站和惡意軟體
- **改善隱私**：避免 ISP 追蹤瀏覽記錄
- **繞過網路限制**：訪問被封鎖的網站（如小紅書）

:::important
更改為國際公共 DNS(如 Google 8.8.8.8 或 Cloudflare 1.1.1.1)可繞過 DNS 封鎖,但請注意可能涉及法律問題,使用前請自行評估風險。
:::

### 推薦的公共 DNS

| DNS 提供商 | 主要 DNS | 備用 DNS | 特色 |
|-----------|---------|---------|------|
| **Google** | `8.8.8.8` | `8.8.4.4` | 速度快、穩定性高、全球覆蓋 |
| **Cloudflare** | `1.1.1.1` | `1.0.0.1` | 注重隱私、速度最快 |
| **Quad9** | `9.9.9.9` | `149.112.112.112` | 主打安全性 |

---

## 電腦端設定

:::tip
**最快方法**：想快速繞過 DNS 封鎖（如小紅書），建議先試「方法一：瀏覽器設定」，幾秒鐘就能完成！
:::

### 方法一：瀏覽器設定（最簡單）

現代瀏覽器內建安全 DNS（DoH）功能，**最快速且不影響系統**。

#### Chrome / Edge / Brave

1. 點選右上角 `⋮` > 「設定」> 「隱私權和安全性」> 「安全性」
2. 啟用「使用安全 DNS」，選擇 **Google Public DNS** 或 **Cloudflare**
3. 立即生效，無需重啟

#### Firefox

1. 點選 `☰` > 「設定」> 「隱私權與安全性」
2. 勾選「啟用 DNS over HTTPS」
3. 選擇 **Cloudflare** 或 **Google**

:::note
**優點**：只影響瀏覽器，適合快速測試  
**限制**：其他應用程式仍使用系統 DNS
:::

---

### 方法二：Windows 系統設定

#### 圖形介面

1. 按 `Win + I` > 「網路和網際網路」> 「進階網路設定」> 「變更介面卡選項」
2. 在網路連線上按右鍵 > 「內容」
3. 雙擊「網際網路通訊協定第 4 版 (TCP/IPv4)」
4. 選擇「使用下列的 DNS 伺服器位址」
   - 慣用：`8.8.8.8`
   - 其他：`8.8.4.4`
5. 點選「確定」

#### PowerShell（進階）

```powershell
# 以系統管理員身分執行
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("8.8.8.8","8.8.4.4")
```

---

### 方法三：macOS 系統設定

1. Apple 選單 > 「系統設定」> 「網路」
2. 選擇連線 > 「詳細資料」> 「DNS」
3. 點選 `+` 新增 DNS：`8.8.8.8` 和 `8.8.4.4`
4. 點選「好」> 「套用」

**終端機方式**：
```bash
sudo networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4
```

---


## 手機端設定

### iOS

1. 「設定」> 「Wi-Fi」> 點選網路旁的 `ⓘ`
2. 「設定 DNS」> 選擇「手動」
3. 刪除現有 DNS，新增 `8.8.8.8` 和 `8.8.4.4`
4. 點選「儲存」

:::tip
推薦安裝 Google 或 Cloudflare 的 App (如 1.1.1.1) 啟用加密 DNS
:::

### Android

#### 私人 DNS（推薦，Android 9+）

1. 「設定」> 「網路和網際網路」> 「私人 DNS」
2. 選擇「私人 DNS 提供者主機名稱」
3. 輸入：
   - Cloudflare：`1dot1dot1dot1.cloudflare-dns.com`
   - Google：`dns.google`
4. 點選「儲存」

:::important
私人 DNS 使用 DoT 協定，提供更好的隱私保護
:::

#### Wi-Fi 設定

1. 長按 Wi-Fi 網路 > 「修改網路」> 「進階選項」
2. IP 設定改為「靜態」
3. DNS 1：`8.8.8.8`，DNS 2：`8.8.4.4`

---

## 如何測試 DNS 是否生效？

### 線上檢測
- [Cloudflare 檢測](https://1.1.1.1/help)
- [DNS Leak Test](https://dnsleaktest.com/)

### 命令列
```bash
# Windows/macOS/Linux
nslookup google.com
```
查看輸出中的「Server」欄位，應顯示你設定的 DNS。

---

## 常見問題 FAQ

### Q1: 更改 DNS 會影響網路速度嗎？

可以稍微提升速度，但差異不明顯。最大好處是穩定性和安全性。

### Q2: 我該選擇哪個 DNS？

- **一般使用者**：Google (8.8.8.8) 或 Cloudflare (1.1.1.1)
- **注重隱私**：Cloudflare (1.1.1.1)
- **注重安全**：Quad9 (9.9.9.9)

### Q3: 如何恢復預設設定？

將 DNS 改回「自動取得」或「DHCP」即可。

### Q4: 什麼是 RPZ？台灣有封鎖網站嗎？

**RPZ (Response Policy Zone)** 是 DNS 層級的內容過濾技術。台灣自 2020 年起要求電信業者實施 RPZ，原意是防詐騙，但出現爭議：

- 🚫 某些網站僅憑公文就被封鎖
- ⚠️ 誤封事件：Instagram、小紅書等
- 📋 缺乏申訴管道

:::warning
更改 DNS 訪問被誤封的合法網站（如小紅書）是合理自保，但訪問明顯違法內容仍可能觸法。
:::

### Q5: 更改 DNS 就能完全翻牆了嗎？

**不完全是**。DNS 封鎖只是網路審查的一種：

- ✅ **DNS 封鎖**：更改 DNS 可繞過（台灣 RPZ、中國 DNS 污染）
- ❌ **IP 封鎖**：需要 VPN
- ❌ **深度封包檢測（DPI）**：需要 VPN

中國的 GFW 同時使用三種技術，單純更改 DNS 無法突破。但台灣目前僅 DNS 層級封鎖，更改 DNS 就足夠。

---

## 結語

更改 DNS 是簡單有效的網路優化方式，幾分鐘就能完成。無論是提升速度、安全性或隱私保護，都值得一試！

:::note
**延伸閱讀**：
- [Cloudflare 1.1.1.1 官方網站](https://1.1.1.1/)
- [什麼是 DNS over HTTPS?](https://www.cloudflare.com/learning/dns/dns-over-tls/)
:::