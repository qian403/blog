# qian's Blog

基於 [MultiTerm](https://github.com/stelcodes/multiterm-astro) 主題建立的個人部落格,使用 [Astro](https://astro.build) 框架開發。

## ✨ 特色

- 🎨 59 種顏色主題可選擇
- 📱 響應式設計
- 🔍 全文搜索功能 (Pagefind)
- 📡 RSS 訂閱
- 🎨 程式碼語法高亮
- 🔢 數學公式支援 (KaTeX)
- 😀 Emoji 支援
- 📅 GitHub Calendar 整合
- ⏱️ 文章閱讀時間顯示
- 📚 系列文章支援
- 🏷️ 標籤系統

## 🚀 使用方式

1. 安裝依賴:

   ```bash
   pnpm install
   ```
2. 啟動開發伺服器:

   ```bash
   pnpm dev
   ```
3. 建置網站:

   ```bash
   pnpm build
   ```
4. 預覽建置結果:

   ```bash
   pnpm preview
   ```

## 📝 文章

所有文章位於 `src/content/posts/` 目錄下。

## 📧 聯絡方式

- GitHub: [@qian403](https://github.com/qian403)
- Email: qian@qian30.net
- Telegram: [@qian50](https://t.me/qian50)
  - Install [pnpm](https://pnpm.io) `npm install -g pnpm` if you haven't.

3. Edit the config file `src/config.ts` to customize your blog.
4. Run `pnpm new-post <filename>` to create a new post and edit it in `src/content/posts/`.
5. Deploy your blog to Vercel, Netlify, GitHub Pages, etc. following [the guides](https://docs.astro.build/en/guides/deploy/). You need to edit the site configuration in `astro.config.mjs` before deployment.

## ⚙️ Frontmatter of Posts

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp      # Set only if the post's language differs from the site's language in `config.ts`
---
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                                 | Action                                               |
| :-------------------------------------- | :--------------------------------------------------- |
| `pnpm install` AND `pnpm add sharp` | Installs dependencies                                |
| `pnpm dev`                            | Starts local dev server at `localhost:4321`        |
| `pnpm build`                          | Build your production site to `./dist/`            |
| `pnpm preview`                        | Preview your build locally, before deploying         |
| `pnpm new-post <filename>`            | Create a new post                                    |
| `pnpm astro ...`                      | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro --help`                   | Get help using the Astro CLI                         |

## 小備注
11月過了記得把生日帽移掉