import usePapercraftStore from '../store/usePapercraftStore'
import ExportButton from './ExportButton'

const ANIMALS = [
  { id: 'fox', label: 'Fox', emoji: '🦊' },
  { id: 'deer', label: 'Deer', emoji: '🦌' },
  { id: 'owl', label: 'Owl', emoji: '🦉' },
]

const PARAM_LABELS = {
  snoutLength: 'Snout Length',
  earHeight: 'Ear Height',
  faceWidth: 'Face Width',
  cheekPuff: 'Cheek Puff',
  foreheadSlope: 'Forehead',
  chinDepth: 'Chin Depth',
}

export default function Sidebar() {
  const { selectedAnimal, setAnimal, params, setParam, defaultColor, setDefaultColor, resetColors } =
    usePapercraftStore()

  return (
    <aside className="w-72 bg-white border-r-2 border-gray-800 p-5 flex flex-col gap-5 overflow-y-auto">
      <div className="font-black text-2xl tracking-tight">
        <span aria-hidden>✂️</span> Paper<span className="text-red-500">Fold</span>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          Animal
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ANIMALS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAnimal(a.id)}
              className={`p-2 rounded-lg border-2 text-center transition-all ${
                selectedAnimal === a.id
                  ? 'border-red-400 bg-red-50 shadow-inner'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl leading-none" aria-hidden>
                {a.emoji}
              </div>
              <div className="text-xs font-bold mt-1">{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          Shape Parameters
        </div>
        <div className="flex flex-col gap-3">
          {Object.entries(params).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{PARAM_LABELS[key] || key}</span>
                <span className="text-gray-400 tabular-nums">{Math.round(val * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={val}
                onChange={(e) => setParam(key, parseFloat(e.target.value))}
                className="w-full accent-red-400"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          Base color
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={defaultColor}
            onChange={(e) => setDefaultColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            aria-label="Base color"
          />
          <span className="text-xs font-mono text-gray-500">{defaultColor}</span>
          <button
            onClick={resetColors}
            className="ml-auto text-xs text-gray-400 hover:text-red-500 font-semibold"
          >
            Reset faces
          </button>
        </div>
      </div>

      <ExportButton />
    </aside>
  )
}
