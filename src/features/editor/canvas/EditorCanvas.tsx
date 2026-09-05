import { useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import type Konva from 'konva'
import { Environment } from './Environment'
import { FlowOverlay } from './FlowOverlay'
import { Grid } from './Grid'
import { ObjectNode } from './ObjectNode'
import { ObjectRenderStatic } from './ObjectRenderStatic'
import { RULER_SIZE, Rulers } from './Rulers'
import { GuideLines, type SnapGuides } from './GuideLines'
import { SelectionTransformer } from './SelectionTransformer'
import { useEditorStore, type Camera } from '../state/useEditorStore'
import { getBoundingBox } from '../../../shared/lib/geometry'
import { computeSpatialViolations, findStorageOverlaps, getBoundsStatus } from '../../../shared/lib/spatialRules'
import { cmToPx, pxToCm } from '../../../shared/lib/units'
import { useIsDarkMode } from '../../../shared/lib/useIsDarkMode'
import type { ObjectTypeKey } from '../../../types/layout'

const MIN_ZOOM = 0.2
const MAX_ZOOM = 4
const MARQUEE_MIN_PX = 4
const EXPORT_PADDING_PX = 24
/** The exported layout uses an opaque, blank paper-like backdrop rather than transparency. */
const EXPORT_BG = '#F6F4F0'

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

function getCenter(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}

export interface EditorCanvasHandle {
  insertAtCenter: (objectType: ObjectTypeKey) => void
  zoomIn: () => void
  zoomOut: () => void
  fitToView: () => void
  exportPng: () => void
}

interface EditorCanvasProps {
  registerHandle: (handle: EditorCanvasHandle) => void
  /** Fires whenever any object starts/stops being dragged — lets the mobile properties sheet
   * collapse out of the way for the duration of the gesture. See docs/UX.md § 2.2. */
  onDraggingChange?: (dragging: boolean) => void
}

export function EditorCanvas({ registerHandle, onDraggingChange }: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [guides, setGuides] = useState<SnapGuides | null>(null)
  const [isDraggingObject, setIsDraggingObject] = useState(false)
  const [cursor, setCursor] = useState<'default' | 'grab' | 'grabbing'>('default')
  const [cursorWorldM, setCursorWorldM] = useState<{ x: number; y: number } | null>(null)

  const lastPinchDistance = useRef<number | null>(null)
  const lastPinchCenter = useRef<{ x: number; y: number } | null>(null)
  const singleTouchPan = useRef<{ x: number; y: number } | null>(null)
  const spaceDownRef = useRef(false)
  const mouseModeRef = useRef<'none' | 'pan' | 'marquee'>('none')
  const panLastScreenRef = useRef<{ x: number; y: number } | null>(null)
  const marqueeStartWorldRef = useRef<{ x: number; y: number } | null>(null)
  const marqueeShiftRef = useRef(false)
  const nodesById = useRef<Map<string, Konva.Group>>(new Map())
  const exportStageRef = useRef<Konva.Stage>(null)

  const layoutName = useEditorStore((s) => s.layoutName)
  const objects = useEditorStore((s) => s.objects)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const selectObject = useEditorStore((s) => s.selectObject)
  const selectMany = useEditorStore((s) => s.selectMany)
  const camera = useEditorStore((s) => s.camera)
  const setCamera = useEditorStore((s) => s.setCamera)
  const scalePxPerMeter = useEditorStore((s) => s.scalePxPerMeter)
  const gridVisible = useEditorStore((s) => s.gridVisible)
  const flowOverlayVisible = useEditorStore((s) => s.flowOverlayVisible)
  const flowNodes = useEditorStore((s) => s.flowNodes)
  const flowConnections = useEditorStore((s) => s.flowConnections)
  const addObject = useEditorStore((s) => s.addObject)
  const envWidthM = useEditorStore((s) => s.envWidthM)
  const envHeightM = useEditorStore((s) => s.envHeightM)
  const envWidthPx = cmToPx(envWidthM * 100, scalePxPerMeter)
  const envHeightPx = cmToPx(envHeightM * 100, scalePxPerMeter)
  const overlappingIds = useMemo(() => findStorageOverlaps(objects), [objects])
  const boundsStatusById = useMemo(() => {
    const envWidthCm = envWidthM * 100
    const envHeightCm = envHeightM * 100
    const map = new Map<string, ReturnType<typeof getBoundsStatus>>()
    for (const o of objects) map.set(o.id, getBoundsStatus(o, envWidthCm, envHeightCm))
    return map
  }, [objects, envWidthM, envHeightM])
  // Corredor bloqueado, conflito equipamento×estrutura, área operacional sobreposta, corredor
  // estreito, doca bloqueada (Fase 8 § Regras logísticas básicas) — layered onto the same
  // red/orange outlines as the existing overlap/bounds checks above (see ObjectNode).
  const { criticalViolationIds, warningViolationIds } = useMemo(() => {
    const violations = computeSpatialViolations(objects, envWidthM * 100, envHeightM * 100)
    const critical = new Set<string>()
    const warning = new Set<string>()
    for (const v of violations) {
      const target = v.severity === 'critical' ? critical : warning
      for (const id of v.objectIds) target.add(id)
    }
    return { criticalViolationIds: critical, warningViolationIds: warning }
  }, [objects, envWidthM, envHeightM])
  useIsDarkMode()

  // Keep the complete environment and any object that legitimately extends beyond it in the export.
  const exportBoundsPx = useMemo(() => {
    let minX = 0
    let minY = 0
    let maxX = envWidthPx
    let maxY = envHeightPx
    for (const obj of objects) {
      const box = getBoundingBox(obj)
      minX = Math.min(minX, cmToPx(box.minX, scalePxPerMeter))
      minY = Math.min(minY, cmToPx(box.minY, scalePxPerMeter))
      maxX = Math.max(maxX, cmToPx(box.maxX, scalePxPerMeter))
      maxY = Math.max(maxY, cmToPx(box.maxY, scalePxPerMeter))
    }
    return {
      offsetX: -minX + EXPORT_PADDING_PX,
      offsetY: -minY + EXPORT_PADDING_PX,
      width: maxX - minX + EXPORT_PADDING_PX * 2,
      height: maxY - minY + EXPORT_PADDING_PX * 2,
    }
  }, [objects, envWidthPx, envHeightPx, scalePxPerMeter])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const latestHandleMouseUp = useRef(() => {})
  useEffect(() => {
    latestHandleMouseUp.current = handleMouseUp
  })

  useEffect(() => {
    function onWindowMouseUp() {
      if (mouseModeRef.current !== 'none') {
        latestHandleMouseUp.current()
      }
    }
    window.addEventListener('mouseup', onWindowMouseUp)
    return () => window.removeEventListener('mouseup', onWindowMouseUp)
  }, [])

  useEffect(() => {
    function isEditableTarget(target: EventTarget | null) {
      const el = target as HTMLElement | null
      return el && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && !isEditableTarget(e.target)) {
        if (!spaceDownRef.current) setCursor('grab')
        spaceDownRef.current = true
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        spaceDownRef.current = false
        setCursor(mouseModeRef.current === 'pan' ? 'grabbing' : 'default')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  function clampZoom(z: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
  }

  function computeFitCamera(): Partial<Camera> | null {
    const padding = 32
    const availWidth = size.width - RULER_SIZE - padding * 2
    const availHeight = size.height - RULER_SIZE - padding * 2
    if (availWidth <= 0 || availHeight <= 0 || envWidthPx <= 0 || envHeightPx <= 0) return null
    const newZoom = clampZoom(Math.min(availWidth / envWidthPx, availHeight / envHeightPx))
    const contentWidth = envWidthPx * newZoom
    const contentHeight = envHeightPx * newZoom
    return {
      zoom: newZoom,
      x: RULER_SIZE + padding + (availWidth - contentWidth) / 2,
      y: RULER_SIZE + padding + (availHeight - contentHeight) / 2,
    }
  }

  useEffect(() => {
    registerHandle({
      insertAtCenter: (objectType) => {
        const worldXPx = (size.width / 2 - camera.x) / camera.zoom
        const worldYPx = (size.height / 2 - camera.y) / camera.zoom
        const worldXCm = (worldXPx / scalePxPerMeter) * 100
        const worldYCm = (worldYPx / scalePxPerMeter) * 100
        addObject(objectType, worldXCm, worldYCm)
      },
      zoomIn: () => setCamera({ zoom: clampZoom(camera.zoom * 1.25) }),
      zoomOut: () => setCamera({ zoom: clampZoom(camera.zoom / 1.25) }),
      fitToView: () => {
        const fit = computeFitCamera()
        if (fit) setCamera(fit)
      },
      exportPng: () => {
        const stage = exportStageRef.current
        if (!stage) return

        const canvas = stage.toCanvas({ pixelRatio: 2 })
        canvas.toBlob(async (blob) => {
          if (!blob) return
          const safeName = (layoutName || 'layout').trim().replace(/[^\p{L}\p{N}\- _]/gu, '') || 'layout'
          const fileName = `${safeName}.png`
          const file = new File([blob], fileName, { type: 'image/png' })

          // On mobile Safari, the download attribute on a data/blob URL is unreliable.
          // Prefer the native share sheet when file sharing is available so the user can
          // explicitly save the PNG to Photos/Files. Desktop and browsers without sharing
          // keep the normal direct-download behavior.
          const canShareFile = typeof navigator !== 'undefined'
            && typeof navigator.share === 'function'
            && typeof navigator.canShare === 'function'
            && navigator.canShare({ files: [file] })

          if (canShareFile) {
            try {
              await navigator.share({ files: [file], title: fileName })
              return
            } catch (error) {
              if (error instanceof DOMException && error.name === 'AbortError') return
            }
          }

          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          link.rel = 'noopener'
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        }, 'image/png')
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerHandle, size, camera, scalePxPerMeter, addObject, setCamera, envWidthPx, envHeightPx, layoutName])

  const lastFittedLayoutId = useRef<string | null>(null)
  const storeLayoutId = useEditorStore((s) => s.layoutId)
  useEffect(() => {
    if (!storeLayoutId || lastFittedLayoutId.current === storeLayoutId) return
    const fit = computeFitCamera()
    if (!fit) return
    lastFittedLayoutId.current = storeLayoutId
    setCamera(fit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeLayoutId, size.width, size.height, envWidthPx, envHeightPx])

  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const oldZoom = camera.zoom
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * (direction > 0 ? 1.1 : 1 / 1.1)))

    const worldX = (pointer.x - camera.x) / oldZoom
    const worldY = (pointer.y - camera.y) / oldZoom

    setCamera({
      zoom: newZoom,
      x: pointer.x - worldX * newZoom,
      y: pointer.y - worldY * newZoom,
    })
  }

  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = e.target.getStage()
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const isEmptyTarget = e.target === stage
    const isMiddleButton = e.evt.button === 1

    if (isMiddleButton || (isEmptyTarget && spaceDownRef.current)) {
      mouseModeRef.current = 'pan'
      panLastScreenRef.current = pointer
      setCursor('grabbing')
      e.evt.preventDefault()
      return
    }

    if (isEmptyTarget && e.evt.button === 0) {
      mouseModeRef.current = 'marquee'
      const worldX = (pointer.x - camera.x) / camera.zoom
      const worldY = (pointer.y - camera.y) / camera.zoom
      marqueeStartWorldRef.current = { x: worldX, y: worldY }
      marqueeShiftRef.current = e.evt.shiftKey
      setMarqueeRect({ x: worldX, y: worldY, width: 0, height: 0 })
      if (!e.evt.shiftKey) selectObject(null)
    }
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = e.target.getStage()
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const worldXCm = pxToCm((pointer.x - camera.x) / camera.zoom, scalePxPerMeter)
    const worldYCm = pxToCm((pointer.y - camera.y) / camera.zoom, scalePxPerMeter)
    setCursorWorldM({ x: worldXCm / 100, y: worldYCm / 100 })

    if (mouseModeRef.current === 'pan' && panLastScreenRef.current) {
      const dx = pointer.x - panLastScreenRef.current.x
      const dy = pointer.y - panLastScreenRef.current.y
      setCamera({ x: camera.x + dx, y: camera.y + dy })
      panLastScreenRef.current = pointer
    } else if (mouseModeRef.current === 'marquee' && marqueeStartWorldRef.current) {
      const worldX = (pointer.x - camera.x) / camera.zoom
      const worldY = (pointer.y - camera.y) / camera.zoom
      const start = marqueeStartWorldRef.current
      setMarqueeRect({
        x: Math.min(start.x, worldX),
        y: Math.min(start.y, worldY),
        width: Math.abs(worldX - start.x),
        height: Math.abs(worldY - start.y),
      })
    }
  }

  function finishMarquee() {
    if (marqueeRect && (marqueeRect.width > MARQUEE_MIN_PX || marqueeRect.height > MARQUEE_MIN_PX)) {
      const rectCm = {
        minX: pxToCm(marqueeRect.x, scalePxPerMeter),
        minY: pxToCm(marqueeRect.y, scalePxPerMeter),
        maxX: pxToCm(marqueeRect.x + marqueeRect.width, scalePxPerMeter),
        maxY: pxToCm(marqueeRect.y + marqueeRect.height, scalePxPerMeter),
      }
      const hits = objects
        .filter((o) => {
          const box = getBoundingBox(o)
          return box.minX < rectCm.maxX && box.maxX > rectCm.minX && box.minY < rectCm.maxY && box.maxY > rectCm.minY
        })
        .map((o) => o.id)
      if (hits.length > 0) selectMany(hits, marqueeShiftRef.current)
    }
    mouseModeRef.current = 'none'
    panLastScreenRef.current = null
    marqueeStartWorldRef.current = null
    setMarqueeRect(null)
  }

  function handleMouseUp() {
    if (mouseModeRef.current === 'marquee') finishMarquee()
    mouseModeRef.current = 'none'
    panLastScreenRef.current = null
    setCursor(spaceDownRef.current ? 'grab' : 'default')
  }

  function handleTouchStart(e: Konva.KonvaEventObject<TouchEvent>) {
    const stage = e.target.getStage()
    const touches = e.evt.touches
    if (touches.length === 1 && stage && e.target === stage) {
      singleTouchPan.current = { x: touches[0].clientX, y: touches[0].clientY }
    } else {
      singleTouchPan.current = null
    }
    if (touches.length >= 2) {
      nodesById.current.forEach((node) => {
        if (node.isDragging()) node.stopDrag()
      })
    }
  }

  function handleTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
    const touches = e.evt.touches

    if (touches.length === 1 && singleTouchPan.current) {
      const dx = touches[0].clientX - singleTouchPan.current.x
      const dy = touches[0].clientY - singleTouchPan.current.y
      setCamera({ x: camera.x + dx, y: camera.y + dy })
      singleTouchPan.current = { x: touches[0].clientX, y: touches[0].clientY }
      return
    }

    if (touches.length !== 2) return
    e.evt.preventDefault()

    nodesById.current.forEach((node) => {
      if (node.isDragging()) node.stopDrag()
    })

    const stage = e.target.getStage()
    if (!stage) return
    const rect = stage.container().getBoundingClientRect()
    const p1 = { x: touches[0].clientX - rect.left, y: touches[0].clientY - rect.top }
    const p2 = { x: touches[1].clientX - rect.left, y: touches[1].clientY - rect.top }
    const distance = getDistance(p1, p2)
    const center = getCenter(p1, p2)

    if (lastPinchDistance.current !== null && lastPinchCenter.current !== null) {
      const oldZoom = camera.zoom
      const scaleChange = distance / lastPinchDistance.current
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom * scaleChange))

      const worldX = (center.x - camera.x) / oldZoom
      const worldY = (center.y - camera.y) / oldZoom

      setCamera({
        zoom: newZoom,
        x: center.x - worldX * newZoom,
        y: center.y - worldY * newZoom,
      })
    }

    lastPinchDistance.current = distance
    lastPinchCenter.current = center
  }

  function handleTouchEnd(e: Konva.KonvaEventObject<TouchEvent>) {
    if (e.evt.touches.length === 0) singleTouchPan.current = null
    if (e.evt.touches.length < 2) {
      lastPinchDistance.current = null
      lastPinchCenter.current = null
    }
  }

  function handleTap(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if (e.target === e.target.getStage()) {
      selectObject(null)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-surface-alt overflow-hidden touch-none"
      style={{ cursor }}
    >
      {size.width > 0 && (
        <Stage
          width={size.width}
          height={size.height}
          x={camera.x}
          y={camera.y}
          scaleX={camera.zoom}
          scaleY={camera.zoom}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setCursorWorldM(null)}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTap={handleTap}
        >
          <Layer listening={false}>
            <Environment widthPx={envWidthPx} heightPx={envHeightPx} zoom={camera.zoom} />
            {gridVisible && (
              <Grid
                pxPerMeter={scalePxPerMeter}
                camera={camera}
                stageWidth={size.width}
                stageHeight={size.height}
                envWidthPx={envWidthPx}
                envHeightPx={envHeightPx}
              />
            )}
          </Layer>
          {flowOverlayVisible && (
            <Layer listening={false}>
              <FlowOverlay
                flowConnections={flowConnections}
                flowNodes={flowNodes}
                objects={objects}
                pxPerMeter={scalePxPerMeter}
              />
            </Layer>
          )}
          <Layer>
            {objects
              .slice()
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((obj) => (
                <ObjectNode
                  key={obj.id}
                  obj={obj}
                  pxPerMeter={scalePxPerMeter}
                  selected={selectedIds.includes(obj.id)}
                  hasOverlap={overlappingIds.has(obj.id)}
                  boundsStatus={boundsStatusById.get(obj.id) ?? 'inside'}
                  hasCriticalViolation={criticalViolationIds.has(obj.id)}
                  hasWarningViolation={warningViolationIds.has(obj.id)}
                  registerRef={(id, node) => {
                    if (node) nodesById.current.set(id, node)
                    else nodesById.current.delete(id)
                  }}
                  onSnapGuideChange={setGuides}
                  onDraggingChange={(dragging) => {
                    setIsDraggingObject(dragging)
                    onDraggingChange?.(dragging)
                  }}
                />
              ))}
            <SelectionTransformer nodesByIdRef={nodesById} pxPerMeter={scalePxPerMeter} />
            {isDraggingObject && (
              <GuideLines
                guides={guides}
                pxPerMeter={scalePxPerMeter}
                camera={camera}
                stageWidth={size.width}
                stageHeight={size.height}
              />
            )}
            {marqueeRect && (
              <Rect
                x={marqueeRect.x}
                y={marqueeRect.y}
                width={marqueeRect.width}
                height={marqueeRect.height}
                fill="#0796D7"
                opacity={0.1}
                stroke="#0796D7"
                strokeWidth={1 / camera.zoom}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      )}
      {size.width > 0 && (
        <Rulers
          camera={camera}
          scalePxPerMeter={scalePxPerMeter}
          envWidthM={envWidthM}
          envHeightM={envHeightM}
          containerWidth={size.width}
          containerHeight={size.height}
        />
      )}
      {cursorWorldM && (
        <div className="hidden md:block absolute bottom-3 left-1/2 -translate-x-1/2 bg-surface/95 border border-border rounded-md shadow-sm px-3 py-1.5 text-xs text-text-secondary font-medium pointer-events-none">
          X: {cursorWorldM.x.toFixed(2)} m &nbsp;·&nbsp; Y: {cursorWorldM.y.toFixed(2)} m
        </div>
      )}
      {envWidthPx > 0 && envHeightPx > 0 && (
        <div
          aria-hidden
          style={{ position: 'fixed', top: -99999, left: -99999, pointerEvents: 'none' }}
        >
          <Stage ref={exportStageRef} width={exportBoundsPx.width} height={exportBoundsPx.height}>
            <Layer listening={false}>
              {/* Opaque paper backdrop: the PNG always contains a blank prancheta, never transparency. */}
              <Rect
                x={0}
                y={0}
                width={exportBoundsPx.width}
                height={exportBoundsPx.height}
                fill={EXPORT_BG}
              />
            </Layer>
            <Layer listening={false} x={exportBoundsPx.offsetX} y={exportBoundsPx.offsetY}>
              <Environment widthPx={envWidthPx} heightPx={envHeightPx} zoom={1} />
              {gridVisible && (
                <Grid
                  pxPerMeter={scalePxPerMeter}
                  camera={{ x: 0, y: 0, zoom: 1 }}
                  stageWidth={envWidthPx}
                  stageHeight={envHeightPx}
                  envWidthPx={envWidthPx}
                  envHeightPx={envHeightPx}
                />
              )}
            </Layer>
            <Layer listening={false} x={exportBoundsPx.offsetX} y={exportBoundsPx.offsetY}>
              {objects
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((obj) => (
                  <ObjectRenderStatic key={obj.id} obj={obj} pxPerMeter={scalePxPerMeter} />
                ))}
            </Layer>
          </Stage>
        </div>
      )}
    </div>
  )
}
