import { visit } from 'unist-util-visit'
import { inferRemoteSize } from 'astro/assets/utils'
import type { Plugin } from 'unified'
import type { Element, Root } from 'hast'

// ![alt#w=400](image.png) -> <img alt="alt" width="400">, with a 2x srcset for retina screens
const WIDTH_SUFFIX = /\s*#w=(\d+)$/

const plugin: Plugin<[], Root> = () => {
  return async function transformer(tree) {
    const remoteImages: Element[] = []

    visit(tree, 'element', (el) => {
      if (el.tagName === 'img') {
        const alt = el.properties?.alt
        if (typeof alt !== 'string') return
        const match = alt.match(WIDTH_SUFFIX)
        if (match) {
          el.properties.width = Number(match[1])
          el.properties.densities = [1, 2]
          el.properties.alt = alt.slice(0, match.index).trim()
          if (/^https?:\/\//.test(String(el.properties.src))) remoteImages.push(el)
        }
      }
    })

    // Astro fills in the original height for remote images, so set a matching one here
    await Promise.all(
      remoteImages.map(async (el) => {
        const { width, height } = await inferRemoteSize(String(el.properties.src))
        el.properties.height = Math.round((Number(el.properties.width) * height) / width)
      }),
    )
  }
}

export default plugin
