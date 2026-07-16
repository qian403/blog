---
layout: ../layouts/MarkdownLayout.astro
title: Markdown 元件展示
description: 用來驗證長文、程式碼、表格、公式、圖片與提示框在各種螢幕尺寸下的排版效果。
pageType: page
noindex: true
---

這是一個實際由 Markdown 渲染的測試頁面。正文寬度、段落節奏與各種技術內容都會在這裡一起驗證。

## 文字與連結

一般段落適合中文與 English 混排，也包含 **粗體內容**、_斜體內容_、~~刪除線~~、`inline code` 與[一般連結](https://astro.build)。超長內容也不應撐破版面，例如 `this-is-a-very-long-configuration-key-that-needs-to-wrap-on-a-small-mobile-screen`。

> 好的技術文章排版，不只需要看起來乾淨，也必須讓讀者快速辨認資訊層級。

### 三級標題

#### 四級標題

標題會保留可分享的錨點，但不再顯示終端機風格的井字前綴。

## 列表與任務

- 網路技術
  - BGP routing
  - Network automation
- 資訊安全
  - Web security
  - Incident response

1. 先確認需求
2. 建立可驗證的實作
3. 在桌面與手機完成測試

- [x] 支援任務列表
- [x] 支援巢狀內容
- [ ] 完成正式上線前的內容校對

## 程式碼

行內指令例如 `pnpm build` 應該清楚但不搶走正文焦點。

```ts title="src/example.ts" showLineNumbers
interface Article {
  title: string
  published: Date
  tags: string[]
}

export function getArticleLabel(article: Article) {
  return `${article.title} · ${article.tags.join(', ')}`
}
```

```bash
pnpm install
pnpm dev
pnpm build
```

## 表格

手機版的寬表格可以水平捲動，不會壓縮成無法閱讀的欄寬。

| 功能     | 桌面版         | 手機版         | 說明             |
| -------- | -------------- | -------------- | ---------------- |
| 文章目錄 | 固定右側       | 折疊選單       | 追蹤目前閱讀段落 |
| 程式碼   | 顯示完整工具列 | 保持水平捲動   | 支援複製與行號   |
| 數學公式 | 置中顯示       | 水平捲動       | 避免公式被裁切   |
| 圖片     | 可超出正文寬度 | 寬度不超過畫面 | 保留完整比例     |

## 圖片與說明

![CHIEN 的個人頭像](/avatar.jpg '圖片會保持比例並提供清楚的圖說')

## 數學公式

行內公式 $E = mc^2$ 會跟著段落基線排列。

$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

## 提示框

:::note[補充資訊]
Note 適合放置不影響主要閱讀流程的補充內容。
:::

:::tip[實作建議]
正文與程式碼使用不同字體，可以同時提升中文閱讀性與程式碼辨識度。
:::

:::warning[注意]
長網址、寬表格和大型公式都必須在手機版逐一驗證。
:::

## 自訂內容

防雷內容預設會被模糊：||這段內容點擊後才會顯示||。

:::rabbit
這是現有部落格支援的角色對話元件，也會沿用新的視覺規格。
:::

<details>
  <summary>可展開的補充資料</summary>
  <p>原生 HTML 元件在 Markdown 文章中也能維持一致排版。</p>
</details>

## 註腳

文章可以使用註腳補充來源與延伸閱讀。[^source]

[^source]: Astro Markdown 文件與本網站既有內容管線。
