---
title: 'curl 完整教學：HTTP 請求、API 測試與網站故障排除'
published: 2026-07-27
description: '從 curl 基本語法到 HTTP 方法、Header、JSON、Cookie、驗證、檔案傳輸、TLS 與連線耗時，學會測試 API 並排查網站問題。'
image: ''
tags: [curl, HTTP, API, Linux, Network, DevOps, 故障排除, 命令列]
category: 'Network'
draft: false
lang: 'zh-TW'
---

:::important
本文所有 curl 指令都在 **2026-07-27** 使用 macOS 與 curl 8.7.1 實際執行過，不是只依照語法拼出的範例。

為了避免洩漏資訊，實測輸出已移除或替換以下內容：

- 本機對外 IP 與實際連線的遠端 IP
- 動態 Request ID、追蹤 ID 與精確時間
- Cookie、Token、密碼與本機檔案路徑
- 與教學無關的 Header 和過長的 Response Body

IP 欄位統一用文件範例專用的 `192.0.2.1`（IPv4）或 `2001:db8::1`（IPv6）取代；其他敏感欄位則會直接標示類型，例如 `[Token 已移除]`。公開測試站的回應可能隨時間改變，HTTP 狀態與輸出格式也可能和本文略有不同。
:::

## curl 是什麼？

`curl` 是一款透過 URL 傳輸資料的命令列工具。它支援 HTTP、HTTPS、FTP、SMTP 等多種協定，不過日常最常見的用途，還是發送 HTTP 請求、測試 API、下載檔案，以及排查網站連線問題。

瀏覽器會自動處理重新導向、Cookie、快取和部分連線細節。curl 則可以讓我們直接控制 Request，並清楚觀察伺服器回傳的 Header、狀態碼與連線過程。

常見使用情境包括：

- 確認網站或 API 是否正常回應
- 測試 GET、POST、PUT、PATCH、DELETE
- 傳送 JSON、表單或檔案
- 檢查 HTTP 狀態碼、Header、Cookie 與重新導向
- 排查 DNS、TCP、TLS 或伺服器回應過慢
- 在 Shell Script 或 CI/CD 中呼叫 API

## 安裝與確認 curl

macOS、目前版本的 Windows 10／11，以及許多 Linux 發行版通常已經附帶 curl。如果系統沒有，可以從作業系統的套件管理器安裝：Debian／Ubuntu 的套件名稱是 `curl`，Fedora／Rocky Linux／AlmaLinux 也是 `curl`，macOS 則可以使用 Homebrew。

由於各平台的安裝命令會修改系統，而且這次只在 macOS 環境實測，本文不把其他作業系統的安裝命令偽裝成已驗證指令。安裝完成後，可以先確認實際使用的版本與功能：

```bash
curl --version
```

實測輸出：

```text
curl 8.7.1 (...) libcurl/8.7.1 (...) LibreSSL/3.3.6 ... nghttp2/1.68.1
Release-Date: 2024-03-27
Protocols: ... http https ...
Features: ... HTTP2 ... IPv6 ... SSL ...
```

除了版本之外，輸出還會列出支援的 Protocol 與 Feature。某個選項無法使用時，第一步就是先檢查這裡。例如本次環境支援 HTTP/2，但沒有 HTTP/3。

部分 JSON 範例會使用 `jq` 篩選與排版輸出。它不是 curl 的一部分，macOS 也不保證預設安裝；可以先確認目前環境是否有這個工具：

```bash
jq --version
```

本次實測輸出：

```text
jq-1.7.1-apple
```

如果沒有安裝 `jq`，可以先移除指令結尾的 `| jq ...`，curl 仍會輸出完整的原始 JSON，再依照自己的平台安裝 jq。

## curl 基本語法

curl 的基本結構是：

```text
curl [選項] URL
```

最簡單的用法是直接指定網址：

```bash
curl -sS https://example.com
```

實測輸出節錄：

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Example Domain</title>
    ...
  </head>
</html>
```

curl 預設會把 Response Body 輸出到終端機。這裡加入了：

- `-s`：關閉進度顯示
- `-S`：即使使用 Silent Mode，失敗時仍顯示錯誤

網址包含 `&`、`?` 或 Shell 可能解讀的特殊字元時，應該使用引號包住整個 URL。

## 先看懂 HTTP Request 與 Response

一次 HTTP 通訊可以先分成兩部分。

### Request：用戶端送出的請求

- Method：例如 GET、POST、PUT、PATCH、DELETE
- URL：請求目標
- Header：格式、驗證資訊、Cookie 等附加資料
- Body：送給伺服器的 JSON、表單或檔案

### Response：伺服器傳回的回應

- Status Code：例如 `200`、`301`、`404`、`500`
- Header：內容類型、快取、Cookie 等資訊
- Body：HTML、JSON、圖片或錯誤訊息

curl 預設只顯示 Response Body，但可以用選項查看其他部分。

## 查看 HTTP Header 與狀態碼

### 同時顯示 Header 與 Body

`-i` 或 `--include` 會把 Response Header 一起輸出：

```bash
curl -sS -i https://httpbin.org/get
```

實測輸出節錄（日期與追蹤資訊已移除）：

```http
HTTP/2 200
content-type: application/json
content-length: 253
access-control-allow-origin: *

{
  "args": {},
  "headers": { ... },
  "origin": "192.0.2.1",
  "url": "https://httpbin.org/get"
}
```

### 使用 HEAD 請求

`-I` 會發送 HTTP `HEAD`，只取得 Header，不下載一般的 Response Body：

```bash
curl -sS -I https://example.com
```

實測輸出節錄：

```http
HTTP/2 200
content-type: text/html
server: cloudflare
last-modified: [日期已移除]
```

少數網站沒有正確處理 `HEAD`。若要用一般 GET 取得 Header，同時丟棄 Body，可以改用：

```bash
curl -sS -D - -o /dev/null https://example.com
```

實測同樣取得 `HTTP/2 200`。其中 `-D -` 把 Header 輸出到終端機，`-o /dev/null` 則丟棄 Body。Windows 可以把 `/dev/null` 改成 `NUL`，但該寫法未在本次 macOS 環境實測。

### 只輸出狀態碼

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' https://example.com
```

實測輸出：

```text
HTTP 200
```

`-w` 或 `--write-out` 可以在傳輸結束後輸出 curl 收集到的資訊，特別適合 Shell Script 或監控程式。

## 跟隨重新導向

curl 預設不會自動跟隨 `301`、`302`、`307` 或 `308`。加入 `-L` 或 `--location` 才會繼續前往 `Location` 指定的網址：

```bash
curl -sS -L -o /dev/null \
  -w 'HTTP %{http_code}\nURL %{url_effective}\n' \
  https://httpbin.org/redirect/2
```

實測輸出：

```text
HTTP 200
URL https://httpbin.org/get
```

`url_effective` 是完成重新導向後的最終 URL。如果要避免錯誤設定造成無限重新導向，也可以搭配 `--max-redirs` 限制次數。

:::note
curl 在重新導向到其他主機時，會限制轉送敏感驗證資訊。不要為了方便隨意使用 `--location-trusted`，否則帳密或 Token 可能被帶到不該收到它的主機。
:::

## 傳送 URL 查詢參數

如果參數包含空格、中文或特殊符號，可以使用 `--get` 和 `--data-urlencode`：

```bash
curl -sS --get https://httpbin.org/get \
  --data-urlencode 'q=curl 完整教學' \
  --data-urlencode 'page=2' \
  | jq '{args, url}'
```

實測輸出：

```json
{
  "args": {
    "page": "2",
    "q": "curl 完整教學"
  },
  "url": "https://httpbin.org/get?q=curl+完整教學&page=2"
}
```

`--get` 會把後面的資料編碼後放進 URL，而不是放進 Request Body。這個範例使用 `jq` 縮減公開測試站的回應，避免把來源 IP 與無關欄位放進文章。

## 自訂 Request Header

使用 `-H` 或 `--header` 加入 Header，也可以重複使用多次：

```bash
curl -sS https://httpbingo.org/headers \
  -H 'Accept: application/json' \
  -H 'X-Request-ID: test-123' \
  | jq '{Accept: .headers.Accept, RequestID: .headers["X-Request-Id"]}'
```

實測輸出：

```json
{
  "Accept": ["application/json"],
  "RequestID": ["test-123"]
}
```

### 修改 User-Agent

`-A` 是設定 `User-Agent` 的簡寫：

```bash
curl -sS -A 'ChienBlog-Test/1.0' \
  https://httpbingo.org/user-agent
```

實測輸出：

```json
{
  "user-agent": "ChienBlog-Test/1.0"
}
```

:::warning
不要把真實 Token、密碼或私鑰貼進截圖、Issue、聊天記錄或公開腳本。使用 Verbose 或 Trace 除錯時，也要先檢查輸出是否包含 `Authorization`、Cookie 或其他敏感資料。
:::

## GET、POST、PUT、PATCH 與 DELETE

直接指定 URL 時，curl 預設使用 GET。傳送不同 Method 時，應優先使用能表達資料格式的選項。

### POST 表單

使用 `-d` 傳送資料時，curl 會自動使用 POST，並預設採用 `application/x-www-form-urlencoded`：

```bash
curl -sS https://httpbingo.org/post \
  -d 'username=chien' \
  -d 'password=example-password' \
  | jq '{form}'
```

實測輸出（密碼為公開測試字串，不是真實憑證）：

```json
{
  "form": {
    "password": ["example-password"],
    "username": ["chien"]
  }
}
```

### POST JSON

新版 curl 可以使用 `--json`：

```bash
curl -sS https://httpbingo.org/anything/users \
  --json '{"name":"Chien","role":"admin"}' \
  | jq '{method, json, headers: {"Content-Type": .headers["Content-Type"], Accept: .headers.Accept}}'
```

實測輸出：

```json
{
  "method": "POST",
  "json": {
    "name": "Chien",
    "role": "admin"
  },
  "headers": {
    "Content-Type": ["application/json"],
    "Accept": ["application/json"]
  }
}
```

`--json` 會傳送 JSON，並自動設定 `Content-Type: application/json` 與 `Accept: application/json`。舊版 curl 可以改用 `-H` 設定 Content-Type，再搭配 `-d` 傳送資料。

### PUT

```bash
curl -sS -X PUT https://httpbin.org/anything/users/42 \
  --json '{"enabled":true}' \
  | jq '{method, json}'
```

```json
{
  "method": "PUT",
  "json": { "enabled": true }
}
```

### PATCH

```bash
curl -sS -X PATCH https://httpbin.org/anything/users/42 \
  --json '{"enabled":false}' \
  | jq '{method, json}'
```

```json
{
  "method": "PATCH",
  "json": { "enabled": false }
}
```

### DELETE

```bash
curl -sS -X DELETE https://httpbin.org/anything/users/42 \
  | jq '{method, url}'
```

```json
{
  "method": "DELETE",
  "url": "https://httpbin.org/anything/users/42"
}
```

:::important
`-X` 只會修改送出的 Method 字串，不會自動改變 curl 傳送資料的方式。例如 `-X HEAD` 不等於 `-I`。GET 與 POST 優先使用 curl 原本的行為，API 明確要求 PUT、PATCH、DELETE 時再使用 `-X`。
:::

## HTTP 驗證

### Basic Authentication

`-u` 或 `--user` 可以傳送 Basic Auth：

```bash
curl -sS -u demo:passwd \
  https://httpbin.org/basic-auth/demo/passwd \
  | jq
```

實測輸出：

```json
{
  "authenticated": true,
  "user": "demo"
}
```

範例使用公開測試帳密。實際操作時只提供帳號、不在命令列寫密碼，curl 就會互動式詢問，降低密碼留在 Shell History 的風險。

### Bearer Token

```bash
curl -sS --oauth2-bearer 'example-token' \
  https://httpbin.org/bearer \
  | jq
```

實測輸出：

```json
{
  "authenticated": true,
  "token": "[Token 已移除]"
}
```

這裡傳送的是無效於其他服務的公開測試字串，文章仍將回顯 Token 遮蔽。正式環境應從秘密管理服務或環境變數讀取 Token，不要把它寫進版本控制。

:::warning
Basic Auth 只是將帳號密碼編碼，不是加密。正式環境一定要使用 HTTPS，否則憑證可能在傳輸途中被攔截。
:::

## Cookie 與登入狀態

`-c` 可以把伺服器設定的 Cookie 寫入 Cookie Jar，`-b` 則可以再次讀取並傳送：

```bash
curl -sS -L -c /tmp/curl-guide-cookies.txt \
  -o /dev/null -w 'HTTP %{http_code}\n' \
  'https://httpbin.org/cookies/set/session/abc123'

curl -sS -b /tmp/curl-guide-cookies.txt \
  https://httpbin.org/cookies \
  | jq 'if .cookies.session then .cookies.session = "[Cookie 已移除]" else . end'
```

實測輸出：

```text
HTTP 200
{
  "cookies": {
    "session": "[Cookie 已移除]"
  }
}
```

Cookie 檔案可能等同登入憑證，不應提交到 Git、放進公開目錄或分享給其他人。本次實測只使用 `/tmp` 中的暫存檔與假的 Session 值。

## 上傳表單與檔案

`-F` 會使用 `multipart/form-data`。為了確保不把工作區檔案或個人資料送到第三方，本次先在 `/tmp` 建立一個只有 16 bytes、內容全為零的測試檔：

```bash
dd if=/dev/zero of=/tmp/curl-upload.bin bs=16 count=1

curl -sS -o /dev/null \
  -w 'HTTP %{http_code}\nUploaded %{size_upload} bytes\n' \
  -F 'file=@/tmp/curl-upload.bin;filename=sample.bin' \
  -F 'description=curl guide test' \
  https://httpbin.org/post
```

實測輸出：

```text
1+0 records in
1+0 records out
16 bytes transferred ...
HTTP 200
Uploaded 351 bytes
```

上傳量大於 16 bytes，是因為 `size_upload` 也包含 multipart 的欄位、Boundary 與 Header。

:::important
測試上傳功能時，不要隨便挑工作目錄裡的檔案傳到公共服務。先建立內容已知、沒有機敏資料的暫存檔，才能避免意外洩漏設定、原始碼或聯絡資訊。
:::

## 下載檔案與續傳

### 指定輸出檔名

`-o` 可以指定輸出檔案。這次從測試站下載 32 bytes：

```bash
curl -sS -o /tmp/curl-sample.bin \
  -w 'HTTP %{http_code}\nDownloaded %{size_download} bytes\n' \
  https://httpbin.org/bytes/32
```

實測輸出：

```text
HTTP 200
Downloaded 32 bytes
```

如果要保留 URL 最後一段的遠端檔名，可以使用 `-O`；若下載網址會重新導向到 CDN，通常還要搭配 `-L`。

### 中斷後繼續下載

先用 Range Request 下載前 512 bytes，再用 `-C -` 根據現有檔案大小續傳：

```bash
curl -sS -r 0-511 -o /tmp/curl-range.bin \
  -w 'Part %{size_download} bytes\n' \
  https://httpbin.org/range/1024

curl -sS -C - -o /tmp/curl-range.bin \
  -w 'HTTP %{http_code}\nTotal transfer %{size_download} bytes\n' \
  https://httpbin.org/range/1024
```

實測輸出：

```text
Part 512 bytes
HTTP 206
Total transfer 512 bytes
```

第二次只傳輸剩下的 512 bytes，所以 `size_download` 顯示 512，而本機檔案完成後是 1024 bytes。續傳的前提是伺服器支援 Range Request。

## Timeout、重試與錯誤處理

### 限制連線與請求總時間

`--connect-timeout` 限制建立連線的時間，`--max-time` 則限制整個請求：

```bash
curl -sS --connect-timeout 5 --max-time 15 \
  -o /dev/null -w 'HTTP %{http_code}\n' \
  https://example.com
```

實測輸出：

```text
HTTP 200
```

這兩個限制不同。伺服器可以在 5 秒內連線成功，卻花超過 15 秒才傳完內容。

### 實際觸發 Timeout

測試端點會分三秒慢慢傳回三個 bytes，但 curl 只允許一秒：

```bash
curl -sS --max-time 1 -o /dev/null \
  -w 'HTTP %{http_code}\n' \
  'https://httpbin.org/drip?duration=3&numbytes=3&delay=0&code=200'
printf 'Exit Code %s\n' "$?"
```

實測輸出：

```text
curl: (28) Operation timed out after 1009 milliseconds with 1 out of 3 bytes received
HTTP 200
Exit Code 28
```

這個例子很重要：伺服器已經回了 HTTP `200`，整體傳輸仍可能因逾時失敗。因此自動化腳本不能只看 HTTP Status，也要檢查 curl 的 Exit Code。

### 讓 HTTP 錯誤回傳非零 Exit Code

curl 預設收到 `404` 或 `500` 時，仍可能以 Exit Code `0` 結束，因為 HTTP 通訊本身已完成。`--fail-with-body` 會在 4xx／5xx 時回傳失敗，同時保留可能存在的錯誤 Body：

下面刻意請求 curl 官方 GitHub 儲存庫中不存在的檔案，讓伺服器同時回傳 `404` 和文字 Body：

```bash
curl -sS --fail-with-body \
  -w '\nHTTP %{http_code}\n' \
  https://raw.githubusercontent.com/curl/curl/master/this-file-does-not-exist
printf 'Exit Code %s\n' "$?"
```

實測輸出：

```text
404: Not Found
curl: (22) The requested URL returned error: 404
HTTP 404
Exit Code 22
```

### 暫時性錯誤時重試

```bash
curl -sS --retry 2 --retry-delay 0 --fail-with-body \
  -o /dev/null -w 'HTTP %{http_code}\n' \
  https://httpbin.org/status/503
printf 'Exit Code %s\n' "$?"
```

實測共收到三次 `503`：第一次請求，加上兩次重試。

```text
curl: (22) The requested URL returned error: 503
curl: (22) The requested URL returned error: 503
curl: (22) The requested URL returned error: 503
HTTP 503
Exit Code 22
```

這裡的 `--retry-delay 0` 代表採用 curl 預設的退避策略，不是每次都在零秒後立即重試。如果指定大於零的秒數，才會改成固定間隔。

:::warning
POST、付款、建立訂單等可能產生副作用的請求，不應直接套用廣泛重試。第一次操作可能已成功，只是回應途中斷線；若 API 沒有 Idempotency Key，重試可能造成重複操作。
:::

### 常見 curl Exit Code

| Exit Code | 意義             | 常見原因                                             |
| --------: | ---------------- | ---------------------------------------------------- |
|       `0` | 執行成功         | 請求完成；沒使用 Fail 選項時仍可能收到 HTTP 4xx／5xx |
|       `6` | 無法解析主機名稱 | DNS 錯誤或網域不存在                                 |
|       `7` | 無法連線到主機   | Port 未開、服務未啟動或防火牆阻擋                    |
|      `22` | HTTP 錯誤        | 使用 Fail 選項時收到 4xx／5xx                        |
|      `28` | 操作逾時         | 連線或回應超過 Timeout                               |
|      `35` | TLS 連線失敗     | TLS 版本、Cipher 或握手問題                          |
|      `60` | 無法驗證憑證     | CA 不受信任、憑證過期或主機名稱不符                  |

## 使用 Verbose 模式排查問題

`-v` 會顯示 DNS 結果、TCP 連線、TLS 握手，以及送出和收到的 Header：

```bash
curl -v -o /dev/null https://example.com
```

實測輸出節錄（IP、時間與動態 ID 已移除）：

```text
* Host example.com:443 was resolved.
* IPv6: 2001:db8::1
* IPv4: 192.0.2.1
*   Trying 192.0.2.1:443...
* Connected to example.com (192.0.2.1) port 443
* SSL connection using TLSv1.3 / ...
* ALPN: server accepted h2
* Server certificate:
*  subject: CN=example.com
*  subjectAltName: host "example.com" matched cert's "example.com"
*  SSL certificate verify ok.
* using HTTP/2
> GET / HTTP/2
> Host: example.com
> User-Agent: curl/8.7.1
< HTTP/2 200
< content-type: text/html
```

輸出符號代表：

- `>`：curl 傳給伺服器的內容
- `<`：伺服器回給 curl 的內容
- `*`：curl 本身的連線資訊

:::important
Verbose 與 Trace 記錄可能包含 Token、Cookie、帳號或表單內容。分享除錯記錄之前務必遮蔽敏感資料，也不要將記錄提交到公開 Git 儲存庫。
:::

## 測量 DNS、TCP、TLS 與網站回應時間

`--write-out` 可以將一次請求拆成不同階段：

```bash
curl -sS -o /dev/null \
  -w 'DNS %{time_namelookup}s\nTCP %{time_connect}s\nTLS %{time_appconnect}s\nTTFB %{time_starttransfer}s\nTotal %{time_total}s\nHTTP %{http_code}\nRemote IP %{remote_ip}\n' \
  https://example.com
```

本次實測輸出：

```text
DNS 0.003559s
TCP 0.187480s
TLS 0.379833s
TTFB 0.569995s
Total 0.570165s
HTTP 200
Remote IP 192.0.2.1
```

| 欄位                 | 意義                                    |
| -------------------- | --------------------------------------- |
| `time_namelookup`    | DNS 解析完成的時間點                    |
| `time_connect`       | TCP 連線完成的時間點                    |
| `time_appconnect`    | TLS 握手完成的時間點                    |
| `time_starttransfer` | 收到第一個回應位元組的時間點，常稱 TTFB |
| `time_total`         | 整個請求完成的總時間                    |

這些數值是從請求開始累計的時間點，不是每個階段各自花費的時間。例如 TLS 階段大約是 `time_appconnect` 減去 `time_connect`。

判讀方向：

- DNS 時間高：DNS Resolver 或 DNS 路徑可能較慢
- TCP 時間明顯增加：網路延遲、防火牆或伺服器連線可能有問題
- TLS 時間明顯增加：TLS 握手或憑證鏈可能有問題
- TTFB 很高：應用程式、資料庫或上游服務可能較慢
- Total 很高但 TTFB 正常：Body 很大或下載速度較慢

## 強制使用 IPv4 或 IPv6

使用 `-4` 強制走 IPv4：

```bash
curl -sS -4 -o /dev/null \
  -w 'HTTP %{http_code}\nIP %{remote_ip}\n' \
  https://example.com
```

實測輸出：

```text
HTTP 200
IP 192.0.2.1
```

使用 `-6` 強制走 IPv6：

```bash
curl -sS -6 -o /dev/null \
  -w 'HTTP %{http_code}\n' \
  --connect-timeout 5 https://example.com
```

本次環境的真實實測結果是 IPv6 逾時：

```text
curl: (28) Failed to connect to example.com port 443 after 5005 ms: Timeout was reached
HTTP 000
```

這不代表 example.com 的 IPv6 一定故障，而是代表本次測試環境沒有可用的 IPv6 連線路徑。若一般請求失敗但 `-4` 成功，就可以優先檢查本機 IPv6、AAAA 記錄、路由與伺服器 IPv6 設定。

## 指定 IP 測試網站

網站切換主機、CDN 或 Load Balancer 時，常需要在 DNS 更新前測試新 IP。`--resolve` 可以覆寫指定 Host 與 Port 的解析結果：

```bash
curl -sS --resolve example.com:443:192.0.2.1 \
  -o /dev/null -w 'HTTP %{http_code}\n' \
  https://example.com
```

實測輸出：

```text
HTTP 200
```

`192.0.2.1` 是 RFC 5737 保留給文件使用的範例位址，實際操作時必須換成目標伺服器 IP。本次實測使用當時由 DNS 查到的 example.com 公開 CDN IP，成功取得上面的 `HTTP 200`，但沒有把實際位址寫入文章。這個指令仍然使用 `example.com` 作為 HTTP Host、TLS SNI 與憑證驗證名稱，只改變實際連線 IP，因此比直接開啟 IP 更適合測試 HTTPS 虛擬主機。

## HTTPS 與 TLS 排查

正常情況下，curl 會檢查：

- 憑證是否由受信任 CA 簽發
- 憑證是否仍在有效期限內
- 憑證主機名稱是否符合 URL
- 憑證鏈是否完整

可以限制測試只使用 TLS 1.2：

```bash
curl -sS --tlsv1.2 --tls-max 1.2 \
  -o /dev/null -w 'HTTP %{http_code}\n' \
  https://example.com
```

實測輸出：

```text
HTTP 200
```

若收到 Exit Code `35`，常見原因包括 TLS 版本、Cipher 或握手失敗；Exit Code `60` 則通常和憑證過期、主機名稱不符、CA 不受信任或憑證鏈不完整有關。

`-k`／`--insecure` 會直接跳過伺服器憑證驗證。它最多只能暫時用來判斷問題是否出在驗證階段，不能修復錯誤憑證。

:::warning
不要在正式腳本、登入、付款或傳送敏感資料時使用 `--insecure`。停用驗證後，即使連線有加密，也無法可靠確認對方真的是預期的伺服器，可能遭遇中間人攻擊。
:::

## 測試 HTTP/1.1 與 HTTP/2

強制使用 HTTP/1.1：

```bash
curl -sS --http1.1 -o /dev/null \
  -w 'HTTP/%{http_version} %{http_code}\n' \
  https://example.com
```

```text
HTTP/1.1 200
```

要求使用 HTTP/2：

```bash
curl -sS --http2 -o /dev/null \
  -w 'HTTP/%{http_version} %{http_code}\n' \
  https://example.com
```

```text
HTTP/2 200
```

本次使用的 curl 沒有 HTTP/3 Feature，因此本文不放入假裝驗證成功的 HTTP/3 指令。是否支援仍應以 `curl --version` 的 Features 為準。

## 網站打不開時的排查順序

遇到問題時，可以按照以下順序縮小範圍：

1. 用 Verbose 模式確認解析 IP、連線、TLS 與 HTTP 狀態。
2. Exit Code `6` 時先查 DNS。可以搭配 [dig 指令完整教學](/posts/dig-guide/) 比較不同 Resolver。
3. Exit Code `7` 時檢查服務是否啟動、Port、防火牆與 Security Group。
4. 分別強制 IPv4 與 IPv6，判斷是否只有其中一條路徑異常。
5. Exit Code `35` 或 `60` 時檢查 TLS 版本、憑證期限、網域與憑證鏈。
6. 收到 `301`／`302` 時查看最終 URL，確認是否有重新導向循環。
7. 收到 `403` 時檢查 Token、Cookie、權限、WAF、IP Allowlist 與 Rate Limit。
8. 收到 `404` 時檢查路徑、大小寫、API 版本與重新導向後的位置。
9. 收到 `500`／`502`／`503`／`504` 時，對照應用程式、Reverse Proxy、CDN 或 Load Balancer Log。
10. 網站只是很慢時，拆開 DNS、TCP、TLS、TTFB 與 Total，不要只看總時間。

### 常見 5xx 的方向

| 狀態碼 | 常見意義                   |
| -----: | -------------------------- |
|  `500` | 應用程式內部錯誤           |
|  `502` | Gateway 收到無效的上游回應 |
|  `503` | 服務暫時不可用或過載       |
|  `504` | Gateway 等待上游回應逾時   |

記錄發生時間、狀態碼、Request ID 與回應時間後，再去比對伺服器 Log，通常會比重複刷新網頁更快找到問題。

## 常用選項速查

| 選項                | 用途                             |
| ------------------- | -------------------------------- |
| `-sS`               | 隱藏進度，但保留錯誤訊息         |
| `-i`                | 同時顯示 Response Header 與 Body |
| `-I`                | 發送 HEAD Request                |
| `-L`                | 跟隨重新導向                     |
| `-H`                | 加入 Request Header              |
| `-d`                | 傳送表單或 Request Body          |
| `--json`            | 傳送 JSON 並設定對應 Header      |
| `-F`                | 傳送 multipart 表單或檔案        |
| `-u`                | HTTP 帳號驗證                    |
| `-b`／`-c`          | 讀取／儲存 Cookie                |
| `-o`／`-O`          | 指定輸出檔名／保留遠端檔名       |
| `-C -`              | 從現有檔案大小繼續下載           |
| `--connect-timeout` | 限制建立連線時間                 |
| `--max-time`        | 限制整個請求時間                 |
| `--retry`           | 暫時性錯誤時重試                 |
| `--fail-with-body`  | HTTP 錯誤時失敗並保留 Body       |
| `-v`                | 顯示詳細連線與 Header            |
| `-w`                | 輸出狀態碼、耗時等資訊           |
| `-4`／`-6`          | 強制使用 IPv4／IPv6              |
| `--resolve`         | 指定 Host 與 Port 使用的 IP      |

## 結論

curl 不只是一個下載工具。它能讓我們直接觀察並控制 HTTP Request，是測試 API、自動化與排查網站問題時非常重要的工具。

剛開始不用背下所有選項，先掌握 Header、重新導向、JSON、錯誤處理、Verbose 與 Timing，就足以處理大多數情境。遇到網站打不開時，再依序拆解 DNS、TCP、TLS 與 HTTP，而不是只看最後的錯誤畫面。

知道失敗發生在哪一層，通常就已經完成了一半的故障排除。
