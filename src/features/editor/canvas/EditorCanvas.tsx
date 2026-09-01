import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import type Konva from 'konva'
import { Grid } from './Grid'
import { ObjectNode } from './ObjectNode'
import { GuideLines, type SnapGuides } from './GuideLines'
import { SelectionTransformer } from './SelectionTransformer'
import { useEditorStore } from '../state/useEditorStore'
import { getBoundingBox } from '../../../shared/lib/geometry'
import { pxToCm } from '../../../shared/lib/units'
import type { ObjectTypeKey } from '../../../types/layout'

const MIN_ZOOM = 0.2
const MAX_ZOOM = 4
const MARQUEE_MIN_PX = 4

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
}

interface EditorCanvasProps {
  registerHandle: (handle: EditorCanvasHandle) => void
}

export function EditorCanvas({ registerHandle }: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [guides, setGuides] = useState<SnapGuides | null>(null)
  const [isDraggingObject, setIsDraggingObject] = useState(false)
  const [cursor, setCursor] = useState<'default' | 'grab' | 'grabbing'>('default')

  const lastPinchDistance = useRef<number | null>(null)
  const lastPinchCenter = useRef<{ x: number; y: number } | null>(null)
  const singleTouchPan = useRef<{ x: number; y: number } | null>(null)
  const spaceDownRef = useRef(false)
  const mouseModeRef = useRef<'none' | 'pan' | 'marquee'>('none')
  const panLastScreenRef = useRef<{ x: number; y: number } | null>(null)
  const marqueeStartWorldRef = useRef<{ x: number; y: number } | null>(null)
  const marqueeShiftRef = useRef(false)
  const nodesById = useRef<Map<string, Konva.Group>>(new Map())

  const objects = useEditorStore((s) => s.objects)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const selectObject = useEditorStore((s) => s.selectObject)
  const selectMany = useEditorStore((s) => s.selectMany)
  const camera = useEditorStore((s) => s.camera)
  const setCamera = useEditorStore((s) => s.setCamera)
  const scalePxPerMeter = useEditorStore((s) => s.scalePxPerMeter)
  const gridVisible = useEditorStore((s) => s.gridVisible)
  const addObject = useEditorStore((s) => s.addObject)

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

  // Always call the current render's handleMouseUp (not a stale one) from the window-level
  // listener below, since it closes over per-render state like marqueeRect.
  const latestHandleMouseUp = useRef(() => {})
  useEffect(() => {
    latestHandleMouseUp.current = handleMouseUp
  })

  // A drag (pan or marquee) should always end cleanly on mouseup, even if the pointer left the
  // canvas element first — e.g. a spurious native 'mouseleave' from an unrelated layout reflow,
  // or the user releasing past the canvas edge. Konva's own onMouseUp only fires while the
  // pointer is still over the Stage, so this window-level listener is the reliable fallback.
  useEffect(() => {
    function onWindowMouseUp() {
      if (mouseModeRef.current !== 'none') {
        latestHandleMouseUp.current()
      }
    }
    window.addEventListener('mouseup', onWindowMouseUp)
    return () => window.removeEventListener('mouseup', onWindowMouseUp)
  }, [])

  // Tracks the spacebar for desktop "hold to pan" — ignored while typing in a form field.
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

  useEffect(() => {
    function clampZoom(z: number) {
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
    }

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
      fitToView: () => setCamera({ x: size.width / 2, y: size.height / 2, zoom: 1 }),
    })
  }, [registerHandle, size, camera, scalePxPerMeter, addObject, setCamera])

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

  // --- Mouse: space/middle-drag pans; plain drag from empty canvas draws a marquee selection. ---

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

  // --- Touch: single-finger drag from empty canvas pans; two-finger pinch zooms. ---

  function handleTouchStart(e: Konva.KonvaEventObject<TouchEvent>) {
    const stage = e.target.getStage()
    const touches = e.evt.touches
    if (touches.length === 1 && stage && e.target === stage) {
      singleTouchPan.current = { x: touches[0].clientX, y: touches[0].clientY }
    } else {
      singleTouchPan.current = null
    }
    if (touches.length >= 2) {
      // A second finger landing while an object drag is active (e.g. a pinch that starts near
      // a small object) hands the gesture to pinch-zoom instead of letting them fight.
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

    // A pinch starting with a finger on/near a small object can leave that object's own
    // draggable Group mid-drag; let the pinch own the gesture exclusively from here on.
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
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTap={handleTap}
        >
          {gridVisible && (
            <Layer listening={false}>
              <Grid pxPerMeter={scalePxPerMeter} camera={camera} stageWidth={size.width} stageHeight={size.height} />
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
                  registerRef={(id, node) => {
                    if (node) nodesById.current.set(id, node)
                    else nodesById.current.delete(id)
                  }}
                  onSnapGuideChange={setGuides}
                  onDraggingChange={setIsDraggingObject}
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
                fill="#2563EB"
                opacity={0.1}
                stroke="#2563EB"
                strokeWidth={1 / camera.zoom}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
