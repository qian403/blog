---
title: test
published: 2022-08-23
description: ''
image: ''
tags: [test]
category: 'Life'
draft: false
lang: ''
---

這篇是這個 blog 支援的 Markdown 語法範例，每個語法先列出寫法，下面接著是實際顯示的效果

## 提示框（Admonitions）

支援 `note`、`tip`、`important`、`warning`、`caution` 五種，冒號至少三個

```md
:::note
這是資訊
:::
```

:::note
這是資訊（note）
:::

:::tip
這是小技巧（tip）
:::

:::important
這是重要事項（important）
:::

:::warning
這是警告（warning）
:::

:::caution
這是危險提醒（caution）
:::

### 自訂標題

```md
:::tip[自訂標題]
標題寫在中括號裡
:::
```

:::tip[自訂標題]
標題寫在中括號裡
:::

### 巢狀提示框

外層的冒號要比內層多

```md
::::note
外層
:::warning
內層
:::
::::
```

::::note
外層
:::warning
內層
:::
::::

## 角色對話

角色定義在 `src/site.config.ts` 的 `characters`，目前只有 `rabbit` 有圖片。`align` 可以設 `left` 或 `right`

```md
:::rabbit
預設對齊
:::

:::rabbit{align="right"}
靠右對齊
:::
```

:::rabbit
預設對齊
:::

:::rabbit{align="right"}
靠右對齊
:::

## 圖片

### 一般圖片

```md
![替代文字](圖片網址或相對路徑)
```

![我的 Arc 身份卡](https://api-cp.c-h.tw/v1/chunkproxy/files/01a16a8a-4509-7c8b-b4e3-bb1f926f27d9)

放在文章資料夾裡的圖片用相對路徑，例如 `![說明](images/xxx.png)`。遠端圖片的網域要先加進 `astro.config.mjs` 的 `image.domains`，才會被壓縮成 webp

### 調整圖片大小

在替代文字最後加上 `#w=寬度`（單位 px），高度會依比例自動計算，也會產生 2 倍解析度的版本

```md
![我的 Arc 身份卡#w=400](圖片網址)
![我的 Arc 身份卡#w=200](圖片網址)
```

![我的 Arc 身份卡#w=400](https://api-cp.c-h.tw/v1/chunkproxy/files/01a16a8a-4509-7c8b-b4e3-bb1f926f27d9)

![我的 Arc 身份卡#w=200](https://api-cp.c-h.tw/v1/chunkproxy/files/01a16a8a-4509-7c8b-b4e3-bb1f926f27d9)

### 圖片說明文字

網址後面加上引號包起來的標題，會變成圖片下方的說明文字

```md
![我的 Arc 身份卡#w=300](圖片網址 "這是圖片說明")
```

![我的 Arc 身份卡#w=300](https://api-cp.c-h.tw/v1/chunkproxy/files/01a16a8a-4509-7c8b-b4e3-bb1f926f27d9 "這是圖片說明")

### 像素風格圖片

替代文字最後加上 `#pixelated`，放大時不會模糊，適合像素圖。可以跟 `#w=` 一起用，`#pixelated` 要放最後面

```md
![像素圖#w=200#pixelated](圖片網址)
```

![像素圖#w=200#pixelated](https://api-cp.c-h.tw/v1/chunkproxy/files/01a16a8a-4509-7c8b-b4e3-bb1f926f27d9)

## 隱藏文字（Spoiler）

用兩個直線包起來，滑鼠移上去或點擊才會顯示

```md
答案是 ||42||
```

答案是 ||42||

## GitHub 卡片

可以放 repo 或使用者，build 時會去 GitHub API 抓資料

```md
::github{repo="qian403/blog"}
::github{user="qian403"}
```

::github{repo="qian403/blog"}

::github{user="qian403"}

## Emoji

可以用短代碼，也可以直接貼 emoji

```md
:smile: :rocket: :+1: 🎉
```

:smile: :rocket: :+1: 🎉

## 數學公式

行內用一個 `$`，區塊用兩個 `$$`

```md
行內公式 $E = mc^2$

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
```

行內公式 $E = mc^2$

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$

## 程式碼區塊

### 標題、行號與標記

````md
```js title="hello.js" showLineNumbers {2}
function hello() {
  console.log('這行會被標記')
}
```
````

```js title="hello.js" showLineNumbers {2}
function hello() {
  console.log('這行會被標記')
}
```

### 新增與刪除

````md
```js ins={2} del={3}
const a = 1
const b = 2
const c = 3
```
````

```js ins={2} del={3}
const a = 1
const b = 2
const c = 3
```

### 終端機

````md
```bash
pnpm dev
```
````

```bash
pnpm dev
```

## 基本語法

### 文字樣式

```md
**粗體**、*斜體*、~~刪除線~~、`行內程式碼`、[連結](https://chien.dev)
```

**粗體**、*斜體*、~~刪除線~~、`行內程式碼`、[連結](https://chien.dev)

### 引用

```md
> 這是一段引用
```

> 這是一段引用

### 清單

```md
- 項目一
  - 子項目
1. 第一步
2. 第二步
- [x] 已完成
- [ ] 未完成
```

- 項目一
  - 子項目

1. 第一步
2. 第二步

- [x] 已完成
- [ ] 未完成

### 表格

```md
| 靠左 | 置中 | 靠右 |
| :--- | :---: | ---: |
| A | B | C |
```

| 靠左 | 置中 | 靠右 |
| :--- | :---: | ---: |
| A | B | C |

### 註腳

```md
這裡有註腳[^1]

[^1]: 註腳內容
```

這裡有註腳[^1]

[^1]: 註腳內容

### 分隔線

```md
---
```

---
