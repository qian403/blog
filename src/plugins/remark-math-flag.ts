import type { RemarkPlugin } from '@astrojs/markdown-remark'
import { visit } from 'unist-util-visit'

const remarkMathFlag: RemarkPlugin = () => {
  return function (tree, { data }) {
    let hasMath = false

    visit(tree, (node) => {
      if (node.type === 'math' || node.type === 'inlineMath') hasMath = true
    })

    if (data.astro?.frontmatter) {
      data.astro.frontmatter.hasMath = hasMath
    }
  }
}

export default remarkMathFlag
