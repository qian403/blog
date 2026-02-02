---
title: 'PicoCTF Web Exploitation Medium分級解題紀錄'
published: 2025-12-24
lastUpdated: '2025-12-24 14:00'
description: '紀錄 PicoCTF Web Exploitation Medium分級的解題過程與心得'
image: ''
tags: [PicoCTF, Web Exploitation, CTF, 網路安全]
category: '資安'
draft: false
lang: ''
---
# Introduction
這是拿來放一些解題紀錄。
如果這邊沒有出現就只有兩種可能，一種是我已經解過了，另一種是我還沒解到


## SSTI2
### Description
SSTI (Server-Side Template Injection) 是一種安全漏洞，發生在應用程式將使用者輸入直接嵌入到伺服器端模板引擎（如 Jinja2, Twig, Smarty）中解析時。攻擊者可以利用模板語法注入惡意指令，進而達成讀取敏感檔案、洩漏伺服器資訊，甚至執行遠端程式碼 (RCE)。
### 解法
1.觀察網頁
在網站上觀察一下會發現有一個輸入匡，我們試試看輸入 ```{{7*7}}```  會得到什麼
輸入之後會得到一個大大的 49，這就是一個 SSTI 的漏洞，那確定有漏洞了，接下來我們可以試著輸入一些命令
```bash
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}
```
但我們發現他顯示了 Stop trying to break me >:(
似乎有什麼限制，我們可以試試看輸入 