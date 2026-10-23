import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'hast'

// ![alt#w=400](image.png) -> <img alt="alt" width="400">, with a 2x srcset for retina screens
const WIDTH_SUFFIX = /\s*#w=(\d+)$/

const plugin: Plugin<[], Root> = () => {
  return function transformer(tree) {
    visit(tree, 'element', (el) => {
      if (el.tagName === 'img') {
        const alt = el.properties?.alt
        if (typeof alt !== 'string') return
        const match = alt.match(WIDTH_SUFFIX)
        if (match) {
          el.properties.width = Number(match[1])
          el.properties.densities = [1, 2]
          el.properties.alt = alt.slice(0, match.index).trim()
        }
      }
    })
  }
}

export default plugin
