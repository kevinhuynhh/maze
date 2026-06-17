import { useMemo, useState } from 'react'
import usePapercraftStore from '../store/usePapercraftStore'

const SWATCHES = [
  '#e8a87c', '#c38d6c', '#9e6a4a', '#f4cfa0',
  '#ffffff', '#d9d5ce', '#2d2416', '#5a4433',
  '#e74c3c', '#f39c12', '#f1c40f', '#27ae60',
  '#16a085', '#2980b9', '#8e44ad', '#34495e',
]

export default function ColorPicker() {
  const { netFaces, faceColors, defaultColor, setFaceColor, resetColors } = usePapercraftStore()
  const [selectedFace, setSelectedFace] = useState(null)
  const [pickerColor, setPickerColor] = useState('#e8a87c')

  const faces = netFaces?.faces || null

  const viewBox = useMemo(() => {
    if (!faces) return '0 0 744 1052'
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    Object.values(faces).forEach(({ verts2D }) =>
      verts2D.forEach(([x, y]) => {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }),
    )
    const pad = 40
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
  }, [faces])

  if (!faces) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Generate a model first.
      </div>
    )
  }

  function onFaceClick(idx) {
    setSelectedFace(idx)
    const existing = faceColors[idx] || defaultColor
    setPickerColor(existing)
  }

  function applyColor(color) {
    setPickerColor(color)
    if (selectedFace !== null) {
      setFaceColor(selectedFace, color)
    }
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 overflow-auto p-6 bg-amber-100/40">
        <div className="mx-auto bg-white shadow rounded border border-gray-200 p-2">
          <svg viewBox={viewBox} className="w-full h-auto">
            {Object.entries(faces).map(([idx, { verts2D }]) => {
              const fill = faceColors[idx] || defaultColor
              const isSelected = String(selectedFace) === String(idx)
              const pts = verts2D.map(([x, y]) => `${x},${y}`).join(' ')
              return (
                <polygon
                  key={idx}
                  points={pts}
                  fill={fill}
                  stroke={isSelected ? '#e84b2a' : '#2d241622'}
                  strokeWidth={isSelected ? 2.5 : 0.6}
                  onClick={() => onFaceClick(idx)}
                  style={{ cursor: 'pointer', transition: 'stroke 120ms' }}
                />
              )
            })}
            {Object.entries(faces).map(([idx, { verts2D }]) => {
              const cx = verts2D.reduce((s, [x]) => s + x, 0) / verts2D.length
              const cy = verts2D.reduce((s, [, y]) => s + y, 0) / verts2D.length
              return (
                <text
                  key={`l-${idx}`}
                  x={cx}
                  y={cy}
                  fontSize="7"
                  fontFamily="Arial"
                  fill="#00000055"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {idx}
                </text>
              )
            })}
          </svg>
        </div>
      </div>

      <aside className="w-72 bg-white border-l-2 border-gray-800 p-5 flex flex-col gap-4 overflow-y-auto">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Face
          </div>
          <div className="text-sm">
            {selectedFace === null ? (
              <span className="text-gray-400">Click any face to colorize it.</span>
            ) : (
              <span className="font-semibold">
                Face #{selectedFace}
                <span className="ml-2 text-xs font-mono text-gray-400">
                  ({faceColors[selectedFace] || defaultColor})
                </span>
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Custom
          </div>
          <input
            type="color"
            value={pickerColor}
            onChange={(e) => applyColor(e.target.value)}
            disabled={selectedFace === null}
            className="w-full h-12 rounded cursor-pointer border border-gray-200 disabled:opacity-50"
          />
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Palette
          </div>
          <div className="grid grid-cols-4 gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => applyColor(c)}
                disabled={selectedFace === null}
                style={{ backgroundColor: c }}
                className="aspect-square rounded border-2 border-gray-200 hover:border-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`color ${c}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={resetColors}
          className="mt-auto w-full py-2 bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-600 transition-colors"
        >
          Reset all faces
        </button>
      </aside>
    </div>
  )
}
