---
title: '如何更改 DNS？Windows、macOS、Linux 與手機設定教學'
published: 2025-12-04
lastUpdated: 2026-09-14
description: '整理 Windows、macOS、Linux、iOS 與 Android 的 DNS 設定、驗證及還原方式，說明系統 DNS、瀏覽器 DoH 與私人 DNS 的差異，以及更換 DNS 的限制。'
tags: [DNS, Network, Windows, macOS, Linux, iOS, Android, DoH, DoT, 網路診斷]
draft: false
---

## 先確認要改哪一層 DNS

DNS（Domain Name System）負責把網域名稱轉換成 IP 位址。更換 DNS 解析器可能改善查詢延遲，或排除特定解析器回傳錯誤答案的問題，但不會直接增加網路頻寬，也不保證網站下載更快。

設定之前，先分清楚你要處理的範圍：

| 設定位置                | 影響範圍                 | 驗證方式                                     |
| ----------------------- | ------------------------ | -------------------------------------------- |
| 作業系統／網路連線      | 使用系統解析器的應用程式 | 檢查連線設定，搭配 `nslookup` 或系統解析工具 |
| 瀏覽器安全 DNS（DoH）   | 使用該設定的瀏覽器請求   | 查看瀏覽器設定，搭配提供者的診斷頁           |
| Android 私人 DNS（DoT） | 使用系統解析機制的請求   | 查看私人 DNS 連線狀態，再測試解析            |

應用程式可能使用自己的解析器，VPN 或公司管理政策也可能接管 DNS。瀏覽器設定成功，不代表其他程式也會使用同一個 DNS。

本文整理設定操作與判讀方式；選單名稱可能隨作業系統版本、手機品牌或管理政策不同。修改前先記下原本的設定，方便還原。

## 選擇公共 DNS

| 提供者             | IPv4 位址                    | 適合留意的特性                                   |
| ------------------ | ---------------------------- | ------------------------------------------------ |
| Google Public DNS  | `8.8.8.8`、`8.8.4.4`         | 一般公共解析服務                                 |
| Cloudflare 1.1.1.1 | `1.1.1.1`、`1.0.0.1`         | 一般公共解析服務；惡意網站過濾使用另外的服務位址 |
| Quad9              | `9.9.9.9`、`149.112.112.112` | 預設服務包含惡意網域封鎖                         |

沒有一個提供者在所有網路環境都最快。若要比較，可用 [dig 查詢教學](/posts/dig-guide/) 的方法，對同一組網域重複測量查詢時間，區分有、無快取的結果。

:::note
只更換 DNS IP 不代表啟用加密。傳統 DNS 通常使用 UDP／TCP 53；DoH 使用 HTTPS，DoT 使用 TLS。加密 DNS 可以保護用戶端到解析器之間的查詢傳輸，但解析器仍能看到查詢，ISP 也仍可能看到目的 IP 等連線資訊。
:::

## 瀏覽器：設定安全 DNS（DoH）

### Chrome、Edge 與 Brave

1. 開啟設定，搜尋「安全 DNS」。
2. 找到「使用安全 DNS」並啟用。
3. 選擇指定提供者，或依提供者官方文件填入 DoH 網址。

這些瀏覽器的選單位置不完全相同，使用設定頁的搜尋功能較容易找到。受管理的裝置可能無法修改。

### Firefox

1. 開啟「設定」→「隱私權與安全性」。
2. 找到「DNS over HTTPS」，選擇適合的保護層級及提供者。
3. 檢查頁面顯示的連線狀態。

自動模式可能依網路環境停用 DoH，或在連線失敗時回退。若指定自訂提供者，請使用其公布的 DoH 端點。

### 如何驗證瀏覽器 DoH

使用 Cloudflare 時，可在同一個瀏覽器開啟 [1.1.1.1 診斷頁](https://1.1.1.1/help)，查看連線與 DoH 狀態。其他提供者請依其診斷文件檢查；DNS 洩漏測試通常只能協助辨識解析器，不能單獨證明傳輸已加密。

**不要用 `nslookup` 的結果判定瀏覽器 DoH 是否成功。** 它的查詢路徑可能與瀏覽器不同。DNS 快取、VPN 及擴充功能也可能影響測試結果。

## Windows：修改網路介面的 DNS

### 圖形介面

以下使用傳統網路連線視窗，方便在不同 Windows 版本操作：

1. 按 `Win + R`，輸入 `ncpa.cpl`。
2. 找到正在使用的 Wi-Fi 或乙太網路介面，右鍵開啟「內容」。
3. 選取「網際網路通訊協定第 4 版 (TCP/IPv4)」→「內容」。
4. 選擇「使用下列的 DNS 伺服器位址」，填入 `8.8.8.8` 與 `8.8.4.4`。
5. 儲存設定，再測試網站是否能解析。

這些步驟只設定 IPv4。若連線也取得 IPv6 DNS，請一併檢查；不要為了更換 DNS 而任意停用 IPv6。

### PowerShell

以系統管理員身分開啟 PowerShell，先確認介面名稱與原本設定：

```powershell
Get-DnsClientServerAddress
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("8.8.8.8","8.8.4.4")
Get-DnsClientServerAddress -InterfaceAlias "Wi-Fi"
```

把 `Wi-Fi` 替換成實際介面名稱。若原本由 DHCP 自動取得 DNS，可用以下指令恢復；若原本是手動設定，請填回先前記錄的位址：

```powershell
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ResetServerAddresses
```

## macOS：修改網路服務的 DNS

1. 開啟「系統設定」→「網路」。
2. 選取正在使用的網路服務，開啟「詳細資訊」→「DNS」。
3. 記錄原本的手動項目，新增 `8.8.8.8` 與 `8.8.4.4` 並儲存。

也可以在終端機先列出網路服務，再修改指定服務：

```bash
networksetup -listallnetworkservices
networksetup -getdnsservers "Wi-Fi"
sudo networksetup -setdnsservers "Wi-Fi" 8.8.8.8 8.8.4.4
scutil --dns
```

`scutil --dns` 可查看包含 VPN、作用範圍等資訊的解析器設定。若原本是自動取得，可清除這個服務的手動 DNS：

```bash
sudo networksetup -setdnsservers "Wi-Fi" Empty
```

## Linux：依網路管理工具設定

### NetworkManager（桌面環境常見）

先確認作用中的連線名稱：

```bash
nmcli connection show --active
```

以下的 `你的連線名稱` 是佔位文字，請替換成查到的名稱。先記錄設定，再指定 IPv4 DNS，並忽略 DHCP 提供的 IPv4 DNS：

```bash
nmcli connection show "你的連線名稱"
sudo nmcli connection modify "你的連線名稱" ipv4.dns "1.1.1.1 1.0.0.1" ipv4.ignore-auto-dns yes
sudo nmcli connection up "你的連線名稱"
nmcli device show
```

重新啟用連線可能短暫斷線，透過 SSH 管理主機時應先準備可用的復原管道。IPv6 使用獨立設定，若要一併修改，請依提供者文件設定 `ipv6.dns` 與 `ipv6.ignore-auto-dns`。

若原本使用自動 DNS，可還原：

```bash
sudo nmcli connection modify "你的連線名稱" ipv4.dns "" ipv4.ignore-auto-dns no
sudo nmcli connection up "你的連線名稱"
```

### systemd-resolved：臨時指定解析器

先以 `resolvectl status` 確認介面名稱。以下使用 `eth0` 作為範例：

```bash
resolvectl status
sudo resolvectl dns eth0 1.1.1.1 1.0.0.1
resolvectl query example.com
```

這是執行期間設定，重開機或網路管理服務重設介面後可能消失；要永久保存，應修改實際管理該介面的 NetworkManager、systemd-networkd 或 Netplan 設定。多介面或 VPN 環境還會受 DNS 路由影響。

移除臨時介面設定可用 `sudo resolvectl revert eth0`。不要直接把 `/etc/resolv.conf` 改成固定檔案，因為它可能由網路管理工具維護。

## iOS：Wi-Fi 的手動 DNS

1. 開啟「設定」→「Wi-Fi」，點選目前網路旁的 `ⓘ`。
2. 在「設定 DNS」選擇「手動」。
3. 記錄原本設定，替換成 `8.8.8.8` 與 `8.8.4.4`，再儲存。

這只影響該 Wi-Fi 網路，不會同時修改行動數據的 DNS，也不代表啟用加密 DNS。要恢復自動設定，回到同一頁選擇「自動」。

若使用提供者的 App，請確認啟用的是 DNS 功能還是 VPN／隧道模式，兩者影響的流量範圍不同。

## Android：私人 DNS（Android 9 以上）

1. 在設定中搜尋「私人 DNS」。
2. 選擇「私人 DNS 提供者主機名稱」。
3. 輸入 `dns.google` 或 `one.one.one.one`，再儲存。

這裡需要的是提供者主機名稱，不是 `8.8.8.8` 之類的 IP 位址。私人 DNS 使用 DoT；指定提供者後，如果網路阻擋其連線，系統 DNS 解析可能失敗，可先改回「自動」確認問題。

不建議只為更換 DNS 就把 Wi-Fi 的 IP 設定改成「靜態」。若未正確填入 IP、閘道與網路前綴，可能造成斷線或位址衝突。

## 驗證系統 DNS：查詢成功不等於設定已全面生效

可以先執行以下查詢：

```bash
nslookup example.com
```

觀察回應的伺服器與解析結果。若看到 `127.0.0.53` 或路由器位址，可能只是本機 stub resolver 或 DNS 轉送器，不能直接判定設定失敗；Linux 可再查 `resolvectl status`，macOS 可查 `scutil --dns`。

若要單獨測試指定解析器是否可用：

```bash
nslookup example.com 1.1.1.1
```

**指定伺服器的查詢成功，只證明這次查詢可用，不代表系統或瀏覽器已改用它。** 網站仍打不開時，可繼續用 [curl 排查 HTTP、TLS 與連線問題](/posts/curl-guide/)，不要把所有連線故障都歸因於 DNS。

## 更換 DNS 能繞過哪些限制？

若問題來自特定解析器的過濾政策，例如 RPZ，改用其他可連線的解析器可能取得不同答案。但途中若存在 DNS 攔截、IP 封鎖、TLS／SNI 過濾，或服務本身的存取限制，單純更換 DNS 不一定有效。

因此，不能把「更換公共 DNS」當作所有網站封鎖的通用解法，也不能只憑一次成功查詢，就判定整個網路沒有其他限制。

## 延伸閱讀與官方文件

- [dig 指令教學：比較解析器與排查 DNS 問題](/posts/dig-guide/)
- [MTR 網路診斷：檢查路徑與封包遺失](/posts/mtr-basic/)
- [Google Public DNS 設定文件](https://developers.google.com/speed/public-dns/docs/using)
- [Cloudflare 1.1.1.1 設定文件](https://developers.cloudflare.com/1.1.1.1/setup/)
- [DNS over HTTPS（DoH）說明](https://www.cloudflare.com/learning/dns/dns-over-https/)
- [DNS over TLS（DoT）說明](https://www.cloudflare.com/learning/dns/dns-over-tls/)
- [Quad9 服務位址與功能](https://docs.quad9.net/services/)
