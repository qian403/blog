// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
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
        const url = new URL(item.url)
        const pathname = url.pathname.replace(/\/$/, '') || '/'
        // Ensure trailing slash for all URLs (fixes Bing/GSC canonical mismatch)
        // Special case: root path should be just '/' not '//'
        item.url = pathname === '/' ? `${url.origin}/` : `${url.origin}${pathname}/`

        if (pathname === '/') {
          item.lastmod = new Date().toISOString().split('T')[0]
          item.priority = 1.0
          item.changefreq = 'daily'
        } else if (pathname.startsWith('/posts/')) {
          item.priority = 0.8
          item.changefreq = 'daily'
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
