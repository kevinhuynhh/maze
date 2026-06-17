import { jsPDF } from 'jspdf'
import usePapercraftStore from '../store/usePapercraftStore'
import { SVGRenderer } from '../core/SVGRenderer'

export default function ExportButton() {
  const { netFaces, faceColors, defaultColor, selectedAnimal } = usePapercraftStore()

  function buildSVG() {
    if (!netFaces) return null
    return new SVGRenderer(netFaces, faceColors, defaultColor, {
      title: `${selectedAnimal.toUpperCase()} HEAD — PAPERCRAFT TEMPLATE`,
    }).render()
  }

  async function exportPDF() {
    const svgString = buildSVG()
    if (!svgString) return

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.decoding = 'sync'

    const done = new Promise((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
    })
    img.src = url

    try {
      await done
      const canvas = document.createElement('canvas')
      // 3x oversample for crisp print
      const scale = 3
      canvas.width = 744 * scale
      canvas.height = 1052 * scale
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
      pdf.save(`papercraft-${selectedAnimal}.pdf`)
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  function exportSVG() {
    const svgString = buildSVG()
    if (!svgString) return
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `papercraft-${selectedAnimal}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const disabled = !netFaces

  return (
    <div className="flex flex-col gap-2 mt-auto">
      <button
        onClick={exportPDF}
        disabled={disabled}
        className="w-full py-3 bg-red-400 text-white font-bold rounded-xl border-2 border-gray-800 shadow-[4px_4px_0_#1f2937] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1f2937] active:translate-y-0 active:shadow-[2px_2px_0_#1f2937] transition-all disabled:opacity-50 disabled:translate-y-0"
      >
        🖨️ Export PDF (A4)
      </button>
      <button
        onClick={exportSVG}
        disabled={disabled}
        className="w-full py-2 bg-teal-400 text-gray-900 font-bold rounded-xl border-2 border-gray-800 shadow-[4px_4px_0_#1f2937] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1f2937] active:translate-y-0 active:shadow-[2px_2px_0_#1f2937] transition-all disabled:opacity-50 disabled:translate-y-0"
      >
        📄 Export SVG
      </button>
    </div>
  )
}
