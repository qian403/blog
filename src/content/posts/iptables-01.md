---
title: 使用 iptables 限制特定 IP 範圍訪問80Port
published: 2024-10-27
description: '這是一篇紀錄使用 iptables 限制特定 IP 範圍訪問80Port的文章'
image: ''
tags: [Network, Linux, iptables]
category: 'Network'
draft: false 
lang: ''
---
# 起因
最近有一個需求，需要使用Cloudflare Zero Trust來限制一些東西，但是若是Source IP洩漏就可以輕易的繞過這個限制，所以需要使用iptables來限制特定IP範圍訪問80Port，所以我就紀錄一下 ~~水一篇~~，如果有  
  
這邊有Cloudflare的IP範圍可以參考[Cloudflare IP範圍](https://www.cloudflare.com/zh-tw/ips/)  
或是文字清單版[Cloudflare IP範圍](https://www.cloudflare.com/ips-v4/#)
# 使用iptables限制特定IP範圍訪問80Port
首先我們需要先確認一下iptables是否有安裝，如果沒有安裝的話可以使用以下指令安裝
```bash
apt-get install iptables -y
```
接著我們需要先確認一下目前的iptables規則
```bash
iptables -L
```
也可以清除目前的規則
```bash
iptables -F
```
接著我們需要新增
```bash
# 允許所有已建立的連接
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 允許指定的 IP 範圍訪問 80 端口
iptables -A INPUT -p tcp --dport 80 -s 173.245.48.0/20 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 103.21.244.0/22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 103.22.200.0/22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 103.31.4.0/22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 141.101.64.0/18 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 108.162.192.0/18 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 190.93.240.0/20 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 188.114.96.0/20 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 197.234.240.0/22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 198.41.128.0/17 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 162.158.0.0/15 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 104.16.0.0/13 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 104.24.0.0/14 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 172.64.0.0/13 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 131.0.72.0/22 -j ACCEPT

# 拒絕其他所有訪問 80 端口的請求
iptables -A INPUT -p tcp --dport 80 -j DROP

# 允許所有其他入站流量
iptables -P INPUT ACCEPT
```
這樣就完成了，可以使用`iptables -L`來確認一下目前的規則
大概會長這樣
```bash
Chain INPUT (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     all  --  anywhere             anywhere             state RELATED,ESTABLISHED
ACCEPT     tcp  --  173.245.48.0/20      anywhere             tcp dpt:http
ACCEPT     tcp  --  103.21.244.0/22      anywhere             tcp dpt:http
ACCEPT     tcp  --  103.22.200.0/22      anywhere             tcp dpt:http
ACCEPT     tcp  --  103.31.4.0/22        anywhere             tcp dpt:http
ACCEPT     tcp  --  141.101.64.0/18      anywhere             tcp dpt:http
ACCEPT     tcp  --  108.162.192.0/18     anywhere             tcp dpt:http
ACCEPT     tcp  --  190.93.240.0/20      anywhere             tcp dpt:http
ACCEPT     tcp  --  188.114.96.0/20      anywhere             tcp dpt:http
ACCEPT     tcp  --  197.234.240.0/22     anywhere             tcp dpt:http
ACCEPT     tcp  --  198.41.128.0/17      anywhere             tcp dpt:http
ACCEPT     tcp  --  162.158.0.0/15       anywhere             tcp dpt:http
ACCEPT     tcp  --  104.16.0.0/13        anywhere             tcp dpt:http
ACCEPT     tcp  --  104.24.0.0/14        anywhere             tcp dpt:http
ACCEPT     tcp  --  172.64.0.0/13        anywhere             tcp dpt:http
ACCEPT     tcp  --  131.0.72.0/22        anywhere             tcp dpt:http
DROP       tcp  --  anywhere             anywhere             tcp dpt:http

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination 
```
# 結論
這樣就完成了，這樣就可以限制特定IP範圍訪問80Port了，另外在下規則之前記得先看一下，不然會把自己擋在外面，~~親身經歷~~。
# 參考
- [Cloudflare IP範圍](https://www.cloudflare.com/zh-tw/ips/)
- [Cloudflare IP範圍](https://www.cloudflare.com/ips-v4/#)