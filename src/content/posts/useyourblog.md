---
title: '好好的使用你的Blog!'
published: 2025-04-19
description: '紀錄一下我怎麼在astro上胡搞瞎搞'
image: ''
tags: [astro, plugin, Blog]
category: 'Life'
draft: false
lang: ''
---



# 在 Astro 上各種胡搞瞎搞
紀錄一下我的一些胡搞瞎搞

## 在文章中加入防雷海苔功能
### 🔧 步驟 1：建立自訂 remark 插件

首先，我們需要讓 Markdown 能夠識別 `||防雷內容||` 的語法。我們會寫一個簡單的 `remark` 插件，將它轉換為 HTML 的 `<span class="spoiler">防雷內容</span>`。

在你的專案中建立一個檔案，例如：`remarkSpoiler.js`（建議放在專案根目錄或 `src/plugins/` 目錄中），內容如下：

```js
import { visit } from 'unist-util-visit';

export default function remarkSpoiler() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /\|\|(.+?)\|\|/g;
      const matches = [...node.value.matchAll(regex)];

      if (matches.length > 0) {
        const newNodes = [];
        let lastIndex = 0;

        for (const match of matches) {
          const [fullMatch, spoilerText] = match;
          const matchStart = match.index;
          const matchEnd = matchStart + fullMatch.length;

          if (matchStart > lastIndex) {
            newNodes.push({
              type: 'text',
              value: node.value.slice(lastIndex, matchStart),
            });
          }

          newNodes.push({
            type: 'html',
            value: `<span class="spoiler">${spoilerText}</span>`,
          });

          lastIndex = matchEnd;
        }

        if (lastIndex < node.value.length) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex),
          });
        }

        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
}
```

---

### ⚙️ 步驟 2：在 Astro 中註冊插件

打開你的 `astro.config.mjs`，並加上這段：

```js
import { defineConfig } from 'astro/config';
import remarkSpoiler from './src/plugins/remarkSpoiler.js'; // 路徑根據你的檔案位置調整

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkSpoiler],
  },
});
```
那邊應該會長這樣，直接在最後加上就好：

```js
remarkPlugins: [remarkMath, remarkReadingTime, remarkExcerpt, remarkGithubAdmonitionsToDirectives, remarkDirective, parseDirectiveNode,remarkSpoiler ],
```

> ✅ 記得重新啟動 Astro 開發伺服器：`pnpm dev`

---

### 🎨 步驟 3：加入防雷效果的 CSS

在 `src/styles/global.css` 中加入以下樣式（如果沒有這個檔案，可以自己創一個）：

```css
.spoiler {
  background-color: #000;
  color: transparent;
  border-radius: 4px;
  padding: 0 4px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.spoiler:hover {
  color: #fff;
}
```


### ✅ 使用範例

現在，你就可以在 Markdown 檔案中直接使用這樣的語法了：

```markdown
這是一段正常文字，其中包含 ||這是防雷內容||，滑過才能看到。
```

渲染後的效果會變成：

```html
這是一段正常文字，其中包含 <span class="spoiler">這是防雷內容</span>，滑過才能看到。
```
||這是效果||


## 在頁腳處新增網站存在時間
先看效果
![image](https://i.imgur.com/ZFUZZMh.png)

### 🔧1.先創建時間的組件
新增一個檔案```src/components/SiteRuntime.astro```
```astro
---

const startDate = new Date('2023-01-01') // 替換為您的網站實際上線日期
---

<div id="site-runtime" class="text-sm opacity-75 dark:text-white text-black">
  網站已運行：<span id="runtime-counter">計算中...</span>
</div>

<script>
  function updateRuntime() {
    const startDate = new Date('2023-01-01'); // 替換為您的網站實際上線日期
    const currentDate = new Date();
    

    const timeDiff = currentDate.getTime() - startDate.getTime();
    
    let seconds = Math.floor(timeDiff / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    days = days % 30;
    hours = hours % 24;
    minutes = minutes % 60;
    seconds = seconds % 60;
    
    let runtimeText = '';
    
    if (years > 0) {
      runtimeText += `${years} 年 `;
    }
    
    if (months > 0 || years > 0) {
      runtimeText += `${months} 個月 `;
    }
    
    runtimeText += `${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;
    
    document.getElementById('runtime-counter').textContent = runtimeText;
  }
  
  updateRuntime();
  setInterval(updateRuntime, 1000);
</script>
```
### ⚙️2. 在頁腳引入這個組件
可能是在 ```src\layouts\MainGridLayout.astro```中
```astro
---
import SiteRuntime from '../components/SiteRuntime.astro';
// 其他導入...
---

<!-- 您的頁腳部分 -->
<footer class="mt-8 py-6 border-t border-gray-200 dark:border-gray-700">
  <div class="container mx-auto px-4">
    <div class="flex flex-col items-center justify-center text-center">
      <div class="mb-2">
        <SiteRuntime />
      </div>
      <div class="text-sm opacity-75 dark:text-white text-black">
      
      </div>
    </div>
  </div>
</footer>
```

