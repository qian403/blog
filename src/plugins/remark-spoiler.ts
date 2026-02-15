import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'

/**
 * Remark plugin to handle spoiler syntax ||content||
 * Converts ||text|| to a spoiler element with blur effect
 */
export const remarkSpoiler: Plugin = () => {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: any, parent: any) => {
      if (!parent || index === undefined) return

      const text = node.value
      const spoilerRegex = /\|\|(.+?)\|\|/g
      
      if (!spoilerRegex.test(text)) return

      const newNodes: any[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      // Reset regex
      spoilerRegex.lastIndex = 0

      while ((match = spoilerRegex.exec(text)) !== null) {
        // Add text before the spoiler
        if (match.index > lastIndex) {
          newNodes.push({
            type: 'text',
            value: text.slice(lastIndex, match.index),
          })
        }

        // Add the spoiler as HTML
        newNodes.push({
          type: 'html',
          value: `<span class="spoiler" data-spoiler="hidden">${match[1]}</span>`,
        })

        lastIndex = match.index + match[0].length
      }

      // Add remaining text
      if (lastIndex < text.length) {
        newNodes.push({
          type: 'text',
          value: text.slice(lastIndex),
        })
      }

      // Replace the text node with new nodes
      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes)
      }
    })
  }
}

export default remarkSpoiler
