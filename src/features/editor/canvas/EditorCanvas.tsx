import { useEffect, useRef, useState } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { Grid } from './Grid'
import { ObjectNode } from './ObjectNode'
import { useEditorStore } from '../state/useEditorStore'
import type { ObjectTypeKey } from '../../../types/layout'

const MIN_ZOOM = 0.2
const MAX_ZOOM = 4

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
  const lastPinchDistance = useRef<number | null>(null)
  const lastPinchCenter = useRef<{ x: number; y: number } | null>(null)

  const objects = useEditorStore((s) => s.objects)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const selectObject = useEditorStore((s) => s.selectObject)
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

  function handleTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
    const touches = e.evt.touches
    if (touches.length !== 2) return
    e.evt.preventDefault()

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
    if (e.evt.touches.length < 2) {
      lastPinchDistance.current = null
      lastPinchCenter.current = null
    }
  }

  function handleStageDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    if (e.target !== e.target.getStage()) return
    setCamera({ x: e.target.x(), y: e.target.y() })
  }

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if (e.target === e.target.getStage()) {
      selectObject(null)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-surface-alt overflow-hidden touch-none">
      {size.width > 0 && (
        <Stage
          width={size.width}
          height={size.height}
          x={camera.x}
          y={camera.y}
          scaleX={camera.zoom}
          scaleY={camera.zoom}
          draggable
          onDragEnd={handleStageDragEnd}
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleStageClick}
          onTap={handleStageClick}
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
                  onSelect={selectObject}
                />
              ))}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
