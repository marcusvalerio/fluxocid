/**
 * Mobile-safe PNG export fallback.
 *
 * iOS browsers can ignore programmatic downloads from data: URLs. The editor's
 * export stage is already rendered as a hidden Konva canvas, so on the export
 * button we copy that canvas into a Blob and trigger a normal file download.
 */
export function installPngDownloadFallback() {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null
      const button = target?.closest<HTMLElement>('[aria-label="Exportar como imagem (PNG)"]')
      if (!button) return

      const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('canvas')).filter(
        (canvas) => canvas.width > 0 && canvas.height > 0,
      )

      const exportCanvas =
        [...canvases].reverse().find((canvas) => {
          let parent: HTMLElement | null = canvas.parentElement
          while (parent) {
            const style = parent.getAttribute('style') ?? ''
            if (style.includes('top: -99999px') || style.includes('top:-99999px')) return true
            parent = parent.parentElement
          }
          return false
        }) ?? canvases.at(-1)

      if (!exportCanvas) return

      // Prevent the old data: URL handler from running. This path is intentionally
      // handled here because iOS is the target platform where the old approach fails.
      event.preventDefault()
      event.stopPropagation()

      const heading = document.querySelector('h1')?.textContent?.trim() || 'layout'
      const safeName = heading.replace(/[^\p{L}\p{N}\- _]/gu, '').trim() || 'layout'
      const filename = `${safeName}.png`

      exportCanvas.toBlob((blob) => {
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.rel = 'noopener'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        link.remove()

        // Keep the object URL alive long enough for Safari/WebKit to consume it.
        window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
      }, 'image/png')
    },
    true,
  )
}
