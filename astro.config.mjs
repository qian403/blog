// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import fs from 'fs'
import path from 'path'
import mdx from '@astrojs/mdx'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import expressiveCode from 'astro-expressive-code'
import siteConfig from './src/site.config'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import remarkDescription from './src/plugins/remark-description' /* Add description to frontmatter */
import remarkReadingTime from './src/plugins/remark-reading-time' /* Add reading time to frontmatter */
import rehypeTitleFigure from './src/plugins/rehype-title-figure' /* Wraps titles in figures */
import { remarkGithubCard } from './src/plugins/remark-github-card'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import rehypeExternalLinks from 'rehype-external-links'
import remarkDirective from 'remark-directive' /* Handle ::: directives as nodes */
import rehypeUnwrapImages from 'rehype-unwrap-images'
import { remarkAdmonitions } from './src/plugins/remark-admonitions' /* Add admonitions */
import remarkCharacterDialogue from './src/plugins/remark-character-dialogue' /* Custom plugin to handle character admonitions */
import remarkUnknownDirectives from './src/plugins/remark-unknown-directives' /* Custom plugin to handle unknown admonitions */
import remarkMath from 'remark-math' /* for latex math support */
import rehypeKatex from 'rehype-katex' /* again, for latex math support */
import remarkGemoji from './src/plugins/remark-gemoji' /* for shortcode emoji support */
import rehypePixelated from './src/plugins/rehype-pixelated' /* Custom plugin to handle pixelated images */
import remarkSpoiler from './src/plugins/remark-spoiler' /* Custom plugin to handle spoiler syntax ||content|| */

// 從文章 frontmatter 讀取日期，用於 sitemap lastmod
/** @type {Map<string, string>} */
const postLastmodMap = new Map()

function buildPostLastmodMap() {
  const postsDir = path.resolve('./src/content/posts')
  if (!fs.existsSync(postsDir)) return
  const readDir = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        readDir(path.join(dir, entry.name))
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const filePath = path.join(dir, entry.name)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lastUpdatedMatch = content.match(/^lastUpdated:\s*(.+)$/m)
        const publishedMatch = content.match(/^published:\s*(.+)$/m)
        const dateStr = (lastUpdatedMatch?.[1]?.trim() || publishedMatch?.[1]?.trim())?.replace(/^['"]|['"]$/g, '')
        if (dateStr) {
          const slug = path.relative(postsDir, filePath)
            .replace(/\.(md|mdx)$/, '')
            .replace(/\/index$/, '')
            .toLowerCase()
            .replace(/ /g, '-')
          const date = new Date(dateStr)
          if (!isNaN(date.getTime())) {
            postLastmodMap.set(slug, date.toISOString().split('T')[0])
          }
        }
      }
    }
  }
  readDir(postsDir)
}

buildPostLastmodMap()

// https://astro.build/config
export default defineConfig({
  site: siteConfig.site,
  trailingSlash: siteConfig.trailingSlashes ? 'always' : 'never',
  prefetch: true,
  markdown: {
    remarkPlugins: [
      [remarkDescription, { maxChars: 200 }],
      remarkReadingTime,
      remarkDirective,
      remarkGithubCard,
      remarkAdmonitions,
      [remarkCharacterDialogue, { characters: siteConfig.characters }],
      remarkUnknownDirectives,
      remarkMath,
      remarkGemoji,
      remarkSpoiler,
    ],
    rehypePlugins: [
      [rehypeHeadingIds, { headingIdCompat: true }],
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      rehypeTitleFigure,
      [
        rehypeExternalLinks,
        {
          rel: ['noreferrer', 'noopener'],
          target: '_blank',
        },
      ],
      rehypeUnwrapImages,
      rehypePixelated,
      rehypeKatex,
    ],
  },
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/$/, '') || '/'

        if (pathname === '/friend') return false
        if (/^\/posts\/\d+$/.test(pathname)) return false
        if (/^\/tags\/.+\/\d+$/.test(pathname)) return false

        return true
      },
      serialize(item) {
        const pathname = new URL(item.url).pathname.replace(/\/$/, '') || '/'

        if (pathname === '/') {
          item.lastmod = new Date().toISOString().split('T')[0]
          item.priority = 1.0
          item.changefreq = 'daily'
        } else if (pathname.startsWith('/posts/')) {
          const slug = pathname.replace('/posts/', '')
          item.lastmod = postLastmodMap.get(slug) ?? undefined
          item.priority = 0.8
          item.changefreq = 'weekly'
        } else if (pathname.startsWith('/tags/')) {
          item.priority = 0.6
          item.changefreq = 'weekly'
        } else if (pathname.startsWith('/about') || pathname.startsWith('/cv') || pathname.startsWith('/links')) {
          item.priority = 0.7
          item.changefreq = 'monthly'
        }

        return item
      },
    }),
    expressiveCode({
      themes: siteConfig.themes.include,
      useDarkModeMediaQuery: false,
      defaultProps: {
        showLineNumbers: false,
        wrap: false,
      },
      plugins: [pluginLineNumbers()],
    }), // Must come after expressive-code integration
    mdx(),
  ],
  experimental: {
    contentIntellisense: true,
  },
})
