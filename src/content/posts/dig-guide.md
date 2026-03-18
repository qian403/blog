---
title: 'dig 指令完整教學：DNS 查詢、範例與故障排除'
published: 2026-03-18
description: '從 dig 基本語法到 A、AAAA、MX、TXT、NS、SOA、PTR 查詢，學會用 dig 排查 DNS 設定錯誤、快取與授權問題。'
image: ''
tags: [DNS, dig, Network, Linux, DevOps, 故障排除, 網路診斷, 命令列]
category: 'Network'
draft: false
lang: 'zh-TW'
---

## 什麼是 dig？

`dig` 是 **Domain Information Groper** 的縮寫，是非常經典的 DNS 查詢工具。當你想知道某個網域目前解析到哪個 IP、MX 記錄有沒有設對、TXT 驗證字串是否生效，或是某台 DNS 伺服器回了什麼內容時，`dig` 幾乎都是第一個該拿出來的工具。

跟 `nslookup` 比起來，`dig` 的輸出更完整、結構更清楚，也更適合除錯與自動化腳本使用。

如果你平常會碰到以下情境，建議一定要熟：

- 網站剛切換 DNS，想確認解析是否正確
- 信箱收不到信，想檢查 MX 記錄
- 網域驗證失敗，想檢查 TXT 記錄
- 想比對不同 DNS 伺服器的查詢結果
- 想知道問題出在遞迴 DNS、授權 DNS 還是快取

---

## dig 可以用來做什麼？

`dig` 最常見的用途包括：

- 查詢 A / AAAA / MX / TXT / NS / SOA / CNAME 等 DNS 記錄
- 指定特定 DNS 伺服器查詢，例如 `1.1.1.1` 或 `8.8.8.8`
- 觀察 TTL、Authority、Additional Section 等細節
- 追查 DNS 委派路徑
- 進行反向 DNS 查詢（PTR）
- 檢查 DNSSEC、TCP 查詢與 trace 結果

---

## dig 安裝方式

### Debian / Ubuntu

```bash
sudo apt update
sudo apt install dnsutils -y
```

### RHEL / Rocky / AlmaLinux / CentOS

```bash
sudo dnf install bind-utils -y
```

### macOS

macOS 通常已內建 `dig`，可直接確認：

```bash
dig -v
```

如果沒有，通常可透過安裝 BIND 工具或其他套件管理方式補齊，但大多數情況下系統本身就能使用。

---

## dig 基本語法

```bash
dig [@DNS伺服器] 網域 [查詢類型] [選項]
```

最常見的幾種形式：

```bash
# 查詢網域的預設記錄（通常是 A）
dig google.com

# 指定查詢類型
dig google.com AAAA

# 指定 DNS 伺服器
dig @1.1.1.1 google.com

# 指定 DNS 伺服器與查詢類型
dig @8.8.8.8 google.com MX
```

---

## 先看懂 dig 輸出

先執行一個最基本的例子：

```bash
dig cloudflare.com
```

你通常會看到類似這樣的輸出：

```text
; <<>> DiG 9.10.6 <<>> cloudflare.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 32617
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;cloudflare.com.                        IN      A

;; ANSWER SECTION:
cloudflare.com.         192     IN      A       104.16.132.229
cloudflare.com.         192     IN      A       104.16.133.229

;; Query time: 86 msec
;; SERVER: fe80::a4c3:37ff:fe5b:8364%11#53(fe80::a4c3:37ff:fe5b:8364%11)
;; WHEN: Wed Mar 18 14:10:37 CST 2026
;; MSG SIZE  rcvd: 75
```

重點看這幾個欄位：

- `status: NOERROR`：查詢成功
- `ANSWER SECTION`：真正查到的答案
- `300`：TTL，代表快取存活秒數
- `SERVER`：這次是問哪台 DNS 伺服器
- `Query time`：查詢耗時

### 常見狀態碼

- `NOERROR`：成功查到資料
- `NXDOMAIN`：這個網域不存在
- `SERVFAIL`：DNS 伺服器查詢失敗
- `REFUSED`：伺服器拒絕回應

---

## 最常用的查詢範例

### 查 A 記錄

查 IPv4 位址：

```bash
dig example.com A
```

### 查 AAAA 記錄

查 IPv6 位址：

```bash
dig example.com AAAA
```

### 查 MX 記錄

查郵件交換伺服器：

```bash
dig example.com MX
```

如果你在排查寄信問題，這是必查項目。

### 查 TXT 記錄

查 SPF、DKIM、網域驗證資訊：

```bash
dig example.com TXT
```

也很常用在：

- Google Search Console 驗證
- SSL 憑證 DNS 驗證
- 郵件 SPF / DKIM / DMARC 檢查

### 查 NS 記錄

查詢這個網域使用哪些名稱伺服器：

```bash
dig example.com NS
```

### 查 SOA 記錄

看授權區域的重要資訊，例如序號與主要 DNS：

```bash
dig example.com SOA
```

如果你懷疑 zone 檔沒更新，`SOA serial` 常常是第一個觀察點。

### 查 CNAME 記錄

```bash
dig www.example.com CNAME
```

### 查任意常見記錄

```bash
dig example.com ANY
```

不過要注意，很多 DNS 伺服器已經限制或不再完整支援 `ANY` 查詢，因此這個結果不一定可靠。

---

## 指定 DNS 伺服器查詢

有時候問題不在網域本身，而是在你問的是哪台 DNS。

例如你想直接問 Cloudflare：

```bash
dig @1.1.1.1 example.com
```

直接問 Google Public DNS：

```bash
dig @8.8.8.8 example.com
```

也可以直接問權威 DNS：

```bash
dig @ns1.example.com example.com A
```

這在以下情境非常實用：

- 比對不同公共 DNS 的回應
- 確認權威 DNS 是否已更新
- 排查本機 DNS 快取或 ISP DNS 汙染

---

## 讓輸出更精簡

### 只看答案

```bash
dig example.com +short
```

這是平常最常用的寫法之一，特別適合 shell script。

例如：

```bash
dig example.com A +short
dig example.com AAAA +short
dig example.com MX +short
```

### 只顯示 Answer Section

```bash
dig example.com +noall +answer
```

這比完整輸出乾淨很多，又比 `+short` 保留更多資訊。

### 顯示統計資訊

```bash
dig example.com +stats
```

### 不做額外解釋

```bash
dig example.com +nocmd +noquestion +nocomments +nostats
```

如果你在寫腳本，這些選項很實用。

---

## 反向 DNS 查詢（PTR）

如果你想知道某個 IP 對應到哪個主機名稱，可以用 `-x`：

```bash
dig -x 8.8.8.8
```

精簡顯示：

```bash
dig -x 8.8.8.8 +short
```

這很適合拿來檢查：

- 郵件伺服器反解是否正確
- 某個 IP 是否有設定 PTR
- 記錄是否對得上主機名稱

---

## 追查 DNS 委派路徑

### 使用 `+trace`

```bash
dig example.com +trace
```

這個選項會從根 DNS 開始，一路追到最終權威 DNS，非常適合排查：

- 委派是否正確
- 某層 NS 是否有問題
- 為什麼某個公共 DNS 查得到，但某些地方查不到

如果你想理解網域解析是怎麼一路被找到的，`+trace` 非常值得多玩幾次。

---

## 強制使用 TCP 查詢

DNS 預設通常走 UDP，但有些情境會需要 TCP，例如：

- 回應太大
- DNSSEC 資料較多
- 某些防火牆或設備對 UDP 行為特殊

可用 `+tcp`：

```bash
dig example.com +tcp
```

---

## 查 DNSSEC 資訊

如果你想看 DNSSEC 相關資訊，可以加上 `+dnssec`：

```bash
dig example.com DNSKEY +dnssec
```

或：

```bash
dig example.com DS +dnssec
```

這通常比較偏進階排查，但如果你有做 DNSSEC、RPKI、網域安全相關主題，這會很有用。

---

## 實用排查情境

## 1. 網站剛改 A 記錄，想確認有沒有生效

```bash
dig example.com A +short
```

如果結果不是你預期的新 IP，可以再比對不同 DNS：

```bash
dig @1.1.1.1 example.com A +short
dig @8.8.8.8 example.com A +short
```

如果權威 DNS 正確、公共 DNS 還沒更新，多半是快取還沒過 TTL。

## 2. 子網域無法開站，懷疑 CNAME 設錯

```bash
dig blog.example.com CNAME +noall +answer
```

如果沒有答案，就代表可能根本沒設，或設成了別的記錄型態。

## 3. 信件收不到，檢查 MX 與 SPF

```bash
dig example.com MX +noall +answer
dig example.com TXT +noall +answer
```

你可以確認：

- MX 是否指向正確郵件主機
- SPF 記錄有沒有拼錯
- 驗證用 TXT 是否真的存在

## 4. 想確認目前問到哪台 DNS 伺服器

```bash
dig example.com
```

直接看輸出中的 `SERVER` 欄位即可。

## 5. 懷疑授權 DNS 沒更新

```bash
dig example.com SOA +noall +answer
```

檢查 `SOA serial` 有沒有增加，是非常常見的排查方式。

---

## RPZ 實例：小紅書被導向到異常 IP

在台灣網路環境裡，`dig` 也很適合拿來觀察 **RPZ（Response Policy Zone）** 類型的 DNS 封鎖。

例如查詢 `www.xiaohongshu.com`：

```bash
dig www.xiaohongshu.com
```

範例輸出：

```text
; <<>> DiG 9.10.6 <<>> www.xiaohongshu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 24336
;; flags: qr rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.xiaohongshu.com.           IN      A

;; ANSWER SECTION:
www.xiaohongshu.com.    277     IN      A       140.111.246.32

;; Query time: 23 msec
;; SERVER: fe80::a4c3:37ff:fe5b:8364%11#53(fe80::a4c3:37ff:fe5b:8364%11)
;; WHEN: Wed Mar 18 14:21:02 CST 2026
;; MSG SIZE  rcvd: 64
```

這時候如果你看到 `www.xiaohongshu.com` 被解析到 `140.111.246.32`，就很值得懷疑了。因為這個 IP 看起來不像小紅書正常會用的對外服務位址。

如果你直接指定某些 ISP 的遞迴 DNS，還可能會看到更明顯的 RPZ 痕跡。例如直接查中華電信：

```bash
dig @dns.hinet.net www.xiaohongshu.com
```

可能會出現像這樣的結果：

```text
; <<>> DiG 9.10.6 <<>> @dns.hinet.net www.xiaohongshu.com
; (4 servers found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 61890
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;www.xiaohongshu.com.           IN      A

;; ANSWER SECTION:
www.xiaohongshu.com.    300     IN      A       140.111.246.32

;; ADDITIONAL SECTION:
rpztw.                  60      IN      SOA     localhost. This.is.an.infringing.website.rpztw. 1773812402 60 60 86400 60

;; Query time: 47 msec
;; SERVER: 2001:b000:168::1#53(2001:b000:168::1)
;; WHEN: Wed Mar 18 14:26:11 CST 2026
;; MSG SIZE  rcvd: 149
```

這裡最值得注意的是 `ADDITIONAL SECTION` 裡面的：

```text
This.is.an.infringing.website.rpztw.
```

這種字樣幾乎就是在直接告訴你：

- 這不是單純的正常遞迴解析結果
- 解析器背後有一個名為 `rpztw` 的政策區
- 這筆回答是依據政策規則被改寫後送回來的

換句話說，如果你除了看到異常 IP，還看到像 `This.is.an.infringing.website.rpztw.` 這種字串，那就更能說明這是一筆 **明確帶有 RPZ 痕跡** 的 DNS 回覆。

接著可以再查這個 IP 是誰的：

```bash
whois 140.111.246.32
```

查詢結果可看到這段關鍵資訊：

```text
inetnum:        140.109.0.0 - 140.111.255.255
netname:        TANET-BNETS
descr:          imported inetnum object for MOEC
country:        TW
```

從這個結果可以知道，`140.111.246.32` 落在台灣教育網路 / 教育體系相關的位址範圍，而不是小紅書原本應該出現的服務網段。這種情況通常就是很典型的訊號：

- 查詢本身成功，`status` 是 `NOERROR`
- 但答案不是該網站正常的服務 IP
- 回答被導向到特定政策或封鎖用途的位址

這就是判斷 **疑似被 RPZ 或 DNS 政策導向** 很實用的方法之一。

### 怎麼做交叉驗證？

你可以再指定其他公共 DNS 伺服器比對：

```bash
dig @1.1.1.1 www.xiaohongshu.com A +short
dig @8.8.8.8 www.xiaohongshu.com A +short
```

如果：

- 本機 / ISP DNS 查到的是 `140.111.246.32`
- 但其他公共 DNS 查到的是不同結果

那幾乎就能合理懷疑是本地 DNS 政策、RPZ 或攔截機制造成，而不是網站本身的正式解析結果。

:::important
只看單一次 `dig` 結果不能百分之百斷定所有封鎖機制，但若結合 **異常 IP、whois 所屬資訊、不同 DNS 比對結果**，通常已經足以判斷這不是正常網站解析。
:::

## dig 與 nslookup 差在哪？

兩者都能查 DNS，但在實務上我會更推薦 `dig`：

- `dig` 輸出更完整
- `dig` 更適合做除錯
- `dig` 更容易搭配 `+short`、`+trace`、`+tcp` 等選項
- `dig` 在 Linux / DevOps / 維運場景更常見

如果只是偶爾查一下 DNS，`nslookup` 也能用；但如果要真的看懂 DNS 問題，`dig` 明顯更好用。

---

## 常見錯誤與排查方向

### 查不到資料，但網域明明存在

先確認查詢類型是不是對的：

```bash
dig example.com A
dig example.com AAAA
dig example.com MX
```

有時候不是查不到，而是你查錯型態。

### 不同地點查到不同結果

通常可能是：

- DNS 快取還沒過期
- 問到不同遞迴 DNS
- 權威 DNS 還沒同步
- 有地理位置導向或 DNS 汙染

建議直接指定 DNS 比對：

```bash
dig @1.1.1.1 example.com
dig @8.8.8.8 example.com
dig @9.9.9.9 example.com
```

### `SERVFAIL`

常見原因：

- 權威 DNS 有問題
- DNSSEC 設定錯誤
- 上游伺服器異常
- 區域資料不完整

這時候很適合搭配：

```bash
dig example.com +trace
dig example.com SOA
dig example.com DNSKEY +dnssec
```

### `NXDOMAIN`

這代表這個名稱不存在。常見原因：

- 網域打錯
- 子網域尚未建立
- zone 檔尚未套用

---

## 我最常用的 dig 指令清單

### 看目前 A 記錄

```bash
dig example.com A +short
```

### 查 TXT 驗證記錄

```bash
dig example.com TXT +noall +answer
```

### 查 MX

```bash
dig example.com MX +noall +answer
```

### 問指定 DNS

```bash
dig @1.1.1.1 example.com +short
```

### 反解 IP

```bash
dig -x 1.1.1.1 +short
```

### 追查整條委派

```bash
dig example.com +trace
```

---

## 結語

`dig` 是 DNS 排查幾乎必學的基本功。你不需要一開始就把所有選項背起來，只要先熟這幾個就很夠用：

- `A` / `AAAA`
- `MX` / `TXT` / `NS` / `SOA`
- `@DNS伺服器`
- `+short`
- `+noall +answer`
- `-x`
- `+trace`

把這些用熟之後，遇到大多數 DNS 問題，你都能比以前更快定位到底是哪一層出錯。

:::note
**延伸閱讀**：
- [如何更改電腦與手機的 DNS 設定？完整教學指南](/posts/change-dns-guide)
- [MTR 網路診斷工具完整教學：Linux 網路追蹤與監控指南](/posts/mtr-basic)
:::
