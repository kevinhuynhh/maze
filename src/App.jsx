import { useEffect, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import Viewer3D from './components/Viewer3D'
import NetViewer from './components/NetViewer'
import ColorPicker from './components/ColorPicker'
import usePapercraftStore from './store/usePapercraftStore'
import { FoxHead } from './generators/FoxHead'
import { DeerHead } from './generators/DeerHead'
import { OwlHead } from './generators/OwlHead'
import { MeshUnfolder } from './core/MeshUnfolder'

const GENERATORS = {
  fox: FoxHead,
  deer: DeerHead,
  owl: OwlHead,
}

const TABS = [
  { id: 'preview', label: '3D Preview', icon: '🧊' },
  { id: 'net', label: '2D Net', icon: '📄' },
  { id: 'colors', label: 'Colors', icon: '🎨' },
]

export default function App() {
  const {
    selectedAnimal,
    params,
    setMesh,
    setNetFaces,
    activeTab,
    setActiveTab,
  } = usePapercraftStore()

  useEffect(() => {
    const GeneratorClass = GENERATORS[selectedAnimal] || FoxHead
    const gen = new GeneratorClass(params)
    const geoData = gen.generate()
    setMesh(geoData)

    const unfolder = new MeshUnfolder(geoData)
    const netResult = unfolder.unfold()
    setNetFaces(netResult)
  }, [selectedAnimal, params, setMesh, setNetFaces])

  return (
    <div className="flex h-screen bg-amber-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'preview' && <Viewer3D />}
          {activeTab === 'net' && <NetViewer />}
          {activeTab === 'colors' && <ColorPicker />}
        </div>
      </main>
    </div>
  )
}

function TopBar({ activeTab, setActiveTab }) {
  const animal = usePapercraftStore((s) => s.selectedAnimal)
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b-2 border-gray-800">
      <div className="text-sm font-semibold text-gray-600">
        <span className="text-gray-400 uppercase text-xs tracking-wider">Editing </span>
        <span className="capitalize">{animal} Head</span>
      </div>
      <div className="flex gap-1 bg-amber-100 p-1 rounded-xl border border-amber-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-400 font-mono">
        PaperFold v0.1
      </div>
    </div>
  )
}
