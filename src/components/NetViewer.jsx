import { useMemo } from 'react'
import usePapercraftStore from '../store/usePapercraftStore'
import { SVGRenderer } from '../core/SVGRenderer'

export default function NetViewer() {
  const { netFaces, faceColors, defaultColor, selectedAnimal } = usePapercraftStore()

  const svgString = useMemo(() => {
    if (!netFaces) return null
    const renderer = new SVGRenderer(netFaces, faceColors, defaultColor, {
      title: `${selectedAnimal.toUpperCase()} HEAD — PAPERCRAFT TEMPLATE`,
    })
    return renderer.render()
  }, [netFaces, faceColors, defaultColor, selectedAnimal])

  if (!svgString) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Generate a model first.
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto p-6 bg-amber-100/40">
      <div className="mx-auto bg-white shadow-xl rounded border border-gray-200" style={{ width: 744, maxWidth: '100%' }}>
        <div
          dangerouslySetInnerHTML={{ __html: svgString }}
          className="w-full h-auto [&_svg]:w-full [&_svg]:h-auto [&_svg]:block"
        />
      </div>
    </div>
  )
}
