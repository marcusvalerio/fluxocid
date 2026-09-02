import { cmToPx, pxToCm } from '../../../shared/lib/units'

interface RulersProps {
  camera: { x: number; y: number; zoom: number }
  scalePxPerMeter: number
  envWidthM: number
  envHeightM: number
  containerWidth: number
  containerHeight: number
}

export const RULER_SIZE = 20

function pickStepM(zoom: number): number {
  // Fewer, more spaced-out ticks at low zoom; finer ticks as the user zooms in.
  if (zoom < 0.35) return 5
  if (zoom < 0.8) return 2
  if (zoom < 2.5) return 1
  return 0.5
}

/** Ruler bars along the canvas's top and left edges, marking real meters — the editor's answer
 * to "how big is this space, really?" at a glance, independent of the current zoom level. */
export function Rulers({ camera, scalePxPerMeter, envWidthM, envHeightM, containerWidth, containerHeight }: RulersProps) {
  const stepM = pickStepM(camera.zoom)

  const worldLeftM = pxToCm(-camera.x / camera.zoom, scalePxPerMeter) / 100
  const worldRightM = pxToCm((containerWidth - camera.x) / camera.zoom, scalePxPerMeter) / 100
  const worldTopM = pxToCm(-camera.y / camera.zoom, scalePxPerMeter) / 100
  const worldBottomM = pxToCm((containerHeight - camera.y) / camera.zoom, scalePxPerMeter) / 100

  const startM = Math.max(0, Math.floor(worldLeftM / stepM) * stepM)
  const endM = Math.min(envWidthM, Math.ceil(worldRightM / stepM) * stepM)
  const startMY = Math.max(0, Math.floor(worldTopM / stepM) * stepM)
  const endMY = Math.min(envHeightM, Math.ceil(worldBottomM / stepM) * stepM)

  const hTicks: { m: number; screenX: number }[] = []
  for (let m = startM; m <= endM + 1e-6; m += stepM) {
    const screenX = camera.x + cmToPx(m * 100, scalePxPerMeter) * camera.zoom
    hTicks.push({ m: Math.round(m * 100) / 100, screenX })
  }

  const vTicks: { m: number; screenY: number }[] = []
  for (let m = startMY; m <= endMY + 1e-6; m += stepM) {
    const screenY = camera.y + cmToPx(m * 100, scalePxPerMeter) * camera.zoom
    vTicks.push({ m: Math.round(m * 100) / 100, screenY })
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
      <div
        className="absolute top-0 bg-surface/90 border-b border-border overflow-hidden"
        style={{ left: RULER_SIZE, right: 0, height: RULER_SIZE }}
      >
        {hTicks.map(({ m, screenX }) => (
          <div
            key={m}
            className="absolute top-0 h-full flex flex-col items-start"
            style={{ left: screenX - RULER_SIZE }}
          >
            <div className="w-px h-2 bg-text-disabled mt-auto mb-0" />
            <span className="text-[9px] leading-none text-text-secondary absolute bottom-0.5 left-0.5 whitespace-nowrap">
              {m}m
            </span>
          </div>
        ))}
      </div>

      <div
        className="absolute left-0 bg-surface/90 border-r border-border overflow-hidden"
        style={{ top: RULER_SIZE, bottom: 0, width: RULER_SIZE }}
      >
        {vTicks.map(({ m, screenY }) => (
          <div key={m} className="absolute left-0 w-full" style={{ top: screenY - RULER_SIZE }}>
            <div className="w-2 h-px bg-text-disabled" />
            <span
              className="text-[9px] leading-none text-text-secondary absolute whitespace-nowrap origin-top-left"
              style={{ transform: 'rotate(-90deg) translate(-100%, 2px)' }}
            >
              {m}m
            </span>
          </div>
        ))}
      </div>

      <div
        className="absolute top-0 left-0 bg-surface border-b border-r border-border"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      />
    </div>
  )
}
