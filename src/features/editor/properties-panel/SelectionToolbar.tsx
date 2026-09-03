import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceBetween,
  ChevronsDown,
  ChevronsUp,
  ChevronDown,
  ChevronUp,
  Copy,
  RotateCcw,
  RotateCw,
  Trash2,
} from 'lucide-react'
import { useEditorStore } from '../state/useEditorStore'
import { IconButton } from '../../../shared/ui/IconButton'

export function SelectionToolbar() {
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const alignSelected = useEditorStore((s) => s.alignSelected)
  const distributeSelected = useEditorStore((s) => s.distributeSelected)
  const rotateSelected = useEditorStore((s) => s.rotateSelected)
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected)
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const bringSelectedToFront = useEditorStore((s) => s.bringSelectedToFront)
  const sendSelectedToBack = useEditorStore((s) => s.sendSelectedToBack)
  const bringSelectedForward = useEditorStore((s) => s.bringSelectedForward)
  const sendSelectedBackward = useEditorStore((s) => s.sendSelectedBackward)

  const count = selectedIds.length
  const canDistribute = count >= 3

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-text-primary">{count} selecionados</h2>
        <div className="flex gap-1">
          <IconButton label="Girar -90°" onClick={() => rotateSelected(-90)}>
            <RotateCcw size={18} />
          </IconButton>
          <IconButton label="Girar +90°" onClick={() => rotateSelected(90)}>
            <RotateCw size={18} />
          </IconButton>
          <IconButton label="Duplicar seleção" onClick={duplicateSelected}>
            <Copy size={18} />
          </IconButton>
          <IconButton label="Excluir seleção" onClick={deleteSelected}>
            <Trash2 size={18} className="text-danger" />
          </IconButton>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-2">Alinhar</p>
        <div className="grid grid-cols-3 gap-1">
          <IconButton label="Alinhar à esquerda" onClick={() => alignSelected('left')}>
            <AlignStartVertical size={18} />
          </IconButton>
          <IconButton label="Centralizar horizontalmente" onClick={() => alignSelected('centerX')}>
            <AlignCenterVertical size={18} />
          </IconButton>
          <IconButton label="Alinhar à direita" onClick={() => alignSelected('right')}>
            <AlignEndVertical size={18} />
          </IconButton>
          <IconButton label="Alinhar ao topo" onClick={() => alignSelected('top')}>
            <AlignStartHorizontal size={18} />
          </IconButton>
          <IconButton label="Centralizar verticalmente" onClick={() => alignSelected('centerY')}>
            <AlignCenterHorizontal size={18} />
          </IconButton>
          <IconButton label="Alinhar à base" onClick={() => alignSelected('bottom')}>
            <AlignEndHorizontal size={18} />
          </IconButton>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-2">Camadas</p>
        <div className="grid grid-cols-4 gap-1">
          <IconButton label="Trazer para frente" onClick={bringSelectedToFront}>
            <ChevronsUp size={18} />
          </IconButton>
          <IconButton label="Avançar uma camada" onClick={bringSelectedForward}>
            <ChevronUp size={18} />
          </IconButton>
          <IconButton label="Recuar uma camada" onClick={sendSelectedBackward}>
            <ChevronDown size={18} />
          </IconButton>
          <IconButton label="Enviar para trás" onClick={sendSelectedToBack}>
            <ChevronsDown size={18} />
          </IconButton>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-2">
          Distribuir {!canDistribute && <span className="text-text-disabled">(mínimo 3 objetos)</span>}
        </p>
        <div className="grid grid-cols-2 gap-1">
          <IconButton
            label="Distribuir horizontalmente"
            disabled={!canDistribute}
            onClick={() => distributeSelected('x')}
          >
            <AlignHorizontalSpaceBetween size={18} />
          </IconButton>
          <IconButton
            label="Distribuir verticalmente"
            disabled={!canDistribute}
            onClick={() => distributeSelected('y')}
          >
            <AlignVerticalSpaceBetween size={18} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
