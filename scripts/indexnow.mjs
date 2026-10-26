// 建置後把「最近變動的文章」主動通知 IndexNow（Bing、Yandex 等共用）。
// 由 package.json 的 postbuild 在 `pnpm build` 之後觸發。
//
// 設計重點：
// - 只送最近 N 天內有 lastmod 的 /posts/、/notes/ 單篇網址，不是整站重送（避免被當成洗頻）。
// - 預設只在 Cloudflare Pages 的 production（main 分支）才真的送出，本機與 preview 建置只會乾跑，
//   不想等部署時也可以用 INDEXNOW_SUBMIT=1 手動觸發。
// - 任何錯誤都只告警、不讓建置失敗。

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const HOST = 'blog.chien.dev'
const KEY = 'e3a67dd1a7c5a4e911bbac487e3eddd1'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/IndexNow'
const SITEMAP = fileURLToPath(new URL('../dist/sitemap-0.xml', import.meta.url))
const WINDOW_DAYS = Number(process.env.INDEXNOW_WINDOW_DAYS ?? 14)

const log = (...args) => console.log('[indexnow]', ...args)

async function main() {
  const isProd = process.env.CF_PAGES_BRANCH === 'main'
  const forced = process.env.INDEXNOW_SUBMIT === '1'
  if (!isProd && !forced) {
    log('skip：非 production 建置（設 INDEXNOW_SUBMIT=1 可手動送出）')
    return
  }

  let xml
  try {
    xml = await readFile(SITEMAP, 'utf8')
  } catch {
    log('skip：找不到 dist/sitemap-0.xml')
    return
  }

  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000
  const urlList = []
  for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
    if (!loc) continue
    // 只要文章 / 短文的「單篇」頁，排除 /posts/ 這類列表頁
    if (!/\/(posts|notes)\/[^/]+\/?$/.test(new URL(loc).pathname)) continue
    if (lastmod && Date.parse(lastmod) < cutoff) continue
    urlList.push(loc)
  }

  if (urlList.length === 0) {
    log(`沒有 ${WINDOW_DAYS} 天內變動的網址，不送出`)
    return
  }

  log(`送出 ${urlList.length} 筆：`, urlList)
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  })
  // 200 已接受、202 已接收待驗證，都算成功
  log(res.ok ? `OK (${res.status})` : `失敗 (${res.status}) ${await res.text()}`)
}

main().catch((err) => log('error（已忽略，不影響建置）:', err?.message ?? err))
