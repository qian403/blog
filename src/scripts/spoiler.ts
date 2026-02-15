// Script to handle spoiler click interactions
document.addEventListener('DOMContentLoaded', () => {
  // Handle spoiler clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('spoiler')) {
      const isRevealed = target.getAttribute('data-spoiler') === 'revealed'
      target.setAttribute('data-spoiler', isRevealed ? 'hidden' : 'revealed')
    }
  })
})

// Re-run after view transitions
document.addEventListener('astro:after-swap', () => {
  // Spoiler listeners are already on document, so they work automatically
})
