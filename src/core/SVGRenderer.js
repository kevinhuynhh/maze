// Renders an unfolded mesh to SVG suitable for A4 printing.
//
// Expected input:
//   netResult = { faces, tree, adjacency } from MeshUnfolder
//   faceColors = { [faceIdx]: hex }
//   defaultColor = hex
//
// Fold vs cut classification uses the spanning tree: an edge shared in 3D between
// face F and face G is a fold line iff the tree links them via that edge. All
// other edges become cut lines (and get glue tabs on one side).

const CUT_COLOR = '#e84b2a'
const VALLEY_COLOR = '#3b82f6'
const MOUNTAIN_COLOR = '#f59e0b'
const GLUE_FILL = '#a8d5a2'
const GLUE_STROKE = '#2d7a2d'

const CUT_STYLE = `stroke="${CUT_COLOR}" stroke-width="1.8" fill="none" stroke-linecap="round"`
const VALLEY_STYLE = `stroke="${VALLEY_COLOR}" stroke-width="1.2" stroke-dasharray="6,4" fill="none" stroke-linecap="round"`
const MOUNTAIN_STYLE = `stroke="${MOUNTAIN_COLOR}" stroke-width="1.2" stroke-dasharray="2,3" fill="none" stroke-linecap="round"`
const GLUE_STYLE = `fill="${GLUE_FILL}" stroke="${GLUE_STROKE}" stroke-width="1" opacity="0.7"`

export class SVGRenderer {
  constructor(netResult, faceColors = {}, defaultColor = '#e8a87c', options = {}) {
    this.netFaces = netResult.faces
    this.tree = netResult.tree || {}
    this.adjacency = netResult.adjacency || {}
    this.faceColors = faceColors
    this.defaultColor = defaultColor
    this.options = {
      title: options.title || 'LOW-POLY PAPERCRAFT TEMPLATE',
      showLabels: options.showLabels !== false,
      showGlueTabs: options.showGlueTabs !== false,
      ...options,
    }

    this._classifyEdges()
  }

  _classifyEdges() {
    // For each face's 2D edge, decide: fold (interior) or cut (boundary).
    // Interior fold when a tree link connects this face pair via this kp-edge.
    this.foldEdges = [] // { p1, p2, type, faceA, faceB, kpEdge }
    this.cutEdges = [] // { p1, p2, faceIdx, kpEdge }

    const treeLinks = new Set()
    Object.entries(this.tree).forEach(([childStr, info]) => {
      if (!info) return
      const child = parseInt(childStr, 10)
      const parent = info.parent
      const key = this._pairKey(parent, child)
      treeLinks.add(key)
    })

    // Track which face draws each fold edge (draw once, from the face with smaller idx).
    const foldDrawn = new Set()

    Object.entries(this.netFaces).forEach(([idxStr, face]) => {
      const faceIdx = parseInt(idxStr, 10)
      const { verts2D, kpNames } = face
      for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3
        const p1 = verts2D[i]
        const p2 = verts2D[j]
        const kpA = kpNames[i]
        const kpB = kpNames[j]

        // Find neighbor in 3D sharing this edge
        const neighborInfo = (this.adjacency[faceIdx] || []).find(({ edge }) => {
          return (
            (edge[0] === kpA && edge[1] === kpB) ||
            (edge[0] === kpB && edge[1] === kpA)
          )
        })

        if (neighborInfo) {
          const other = neighborInfo.neighbor
          const pairKey = this._pairKey(faceIdx, other)
          if (treeLinks.has(pairKey)) {
            // Fold edge — draw only once
            if (!foldDrawn.has(pairKey)) {
              foldDrawn.add(pairKey)
              this.foldEdges.push({
                p1,
                p2,
                type: 'valley',
                faceA: faceIdx,
                faceB: other,
                kpEdge: [kpA, kpB],
              })
            }
            continue
          }
        }

        // Cut edge
        this.cutEdges.push({ p1, p2, faceIdx, kpEdge: [kpA, kpB] })
      }
    })
  }

  _pairKey(a, b) {
    return a < b ? `${a}-${b}` : `${b}-${a}`
  }

  render() {
    const faces = this._renderFaces()
    const glueTabs = this.options.showGlueTabs ? this._renderGlueTabs() : ''
    const foldLines = this._renderFoldLines()
    const cutLines = this._renderCutLines()
    const labels = this.options.showLabels ? this._renderLabels() : ''
    const legend = this._renderLegend()
    const title = this._renderTitle()

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 744 1052" width="744" height="1052">
  <rect width="744" height="1052" fill="white"/>
  ${title}
  <g id="faces">${faces}</g>
  <g id="glue-tabs">${glueTabs}</g>
  <g id="fold-lines">${foldLines}</g>
  <g id="cut-lines">${cutLines}</g>
  <g id="labels">${labels}</g>
  ${legend}
</svg>`
  }

  _renderFaces() {
    return Object.entries(this.netFaces)
      .map(([idx, { verts2D }]) => {
        const color = this.faceColors[idx] || this.defaultColor
        const dark = this._darken(color, 24)
        const pts = verts2D.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
        return `<polygon data-face="${idx}" points="${pts}" fill="${color}" stroke="${dark}" stroke-width="0.4" stroke-linejoin="round"/>`
      })
      .join('\n  ')
  }

  _renderFoldLines() {
    return this.foldEdges
      .map(({ p1, p2, type }) => {
        const style = type === 'mountain' ? MOUNTAIN_STYLE : VALLEY_STYLE
        return `<line x1="${p1[0].toFixed(2)}" y1="${p1[1].toFixed(2)}" x2="${p2[0].toFixed(2)}" y2="${p2[1].toFixed(2)}" ${style}/>`
      })
      .join('\n  ')
  }

  _renderCutLines() {
    return this.cutEdges
      .map(({ p1, p2 }) => {
        return `<line x1="${p1[0].toFixed(2)}" y1="${p1[1].toFixed(2)}" x2="${p2[0].toFixed(2)}" y2="${p2[1].toFixed(2)}" ${CUT_STYLE}/>`
      })
      .join('\n  ')
  }

  _renderGlueTabs() {
    // Group cut edges by their shared 3D edge (kpEdge unordered key).
    // Faces that share an edge in 3D but aren't linked in the tree each need
    // to know the counterpart; we give exactly one of the two a glue tab labeled
    // with a letter; the other gets the matching letter too so assembly pairs up.
    const pairs = new Map() // key → [{ faceIdx, edge2D, kpEdge }, ...]
    this.cutEdges.forEach((ce) => {
      const [a, b] = ce.kpEdge
      const key = a < b ? `${a}|${b}` : `${b}|${a}`
      if (!pairs.has(key)) pairs.set(key, [])
      pairs.get(key).push(ce)
    })

    const TAB_SIZE = 10
    const MIN_EDGE_LEN = 18
    let labelIdx = 0
    const out = []

    for (const [, group] of pairs) {
      if (group.length === 2) {
        // Matched pair — give tab to face with lower index
        const [first, second] = group.sort((a, b) => a.faceIdx - b.faceIdx)
        const label = this._labelFor(labelIdx++)
        out.push(this._buildGlueTab(first.p1, first.p2, TAB_SIZE, label, MIN_EDGE_LEN))
        out.push(this._buildEdgeLabel(second.p1, second.p2, label))
      }
      // group.length === 1: true boundary edge — no tab needed
    }

    return out.filter(Boolean).join('\n  ')
  }

  _labelFor(i) {
    // A, B, ..., Z, AA, AB, ...
    if (i < 26) return String.fromCharCode(65 + i)
    return String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26))
  }

  _buildGlueTab(p1, p2, tabSize, label, minLen) {
    const [x1, y1] = p1
    const [x2, y2] = p2
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len < minLen) return this._buildEdgeLabel(p1, p2, label)

    // Outward normal — need direction opposite to face interior.
    // Approximation: use right-hand normal; for a net with consistent winding
    // this usually faces outward. If it overlaps we still label it correctly.
    const nx = -dy / len
    const ny = dx / len

    const tabSkew = Math.min(len * 0.2, 6)
    const ux = dx / len
    const uy = dy / len

    // Trapezoidal tab so glue surface tapers inward
    const cornerA = [x1 + ux * tabSkew + nx * tabSize, y1 + uy * tabSkew + ny * tabSize]
    const cornerB = [x2 - ux * tabSkew + nx * tabSize, y2 - uy * tabSkew + ny * tabSize]
    const pts = `${x1.toFixed(2)},${y1.toFixed(2)} ${cornerA[0].toFixed(2)},${cornerA[1].toFixed(2)} ${cornerB[0].toFixed(2)},${cornerB[1].toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`

    const mx = (x1 + x2) / 2 + nx * (tabSize * 0.55)
    const my = (y1 + y2) / 2 + ny * (tabSize * 0.55)

    return `<polygon points="${pts}" ${GLUE_STYLE}/>
  <text x="${mx.toFixed(2)}" y="${my.toFixed(2)}" font-size="7" fill="${GLUE_STROKE}" text-anchor="middle" font-family="Arial" font-weight="700" dominant-baseline="middle">${label}</text>`
  }

  _buildEdgeLabel(p1, p2, label) {
    const mx = (p1[0] + p2[0]) / 2
    const my = (p1[1] + p2[1]) / 2
    const dx = p2[0] - p1[0]
    const dy = p2[1] - p1[1]
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const ox = mx - nx * 6
    const oy = my - ny * 6
    return `<text x="${ox.toFixed(2)}" y="${oy.toFixed(2)}" font-size="6.5" fill="${CUT_COLOR}" text-anchor="middle" font-family="Arial" font-weight="700" dominant-baseline="middle">${label}</text>`
  }

  _renderTitle() {
    return `<text x="372" y="30" font-size="16" font-family="Arial" font-weight="900" fill="#2d2416" text-anchor="middle">${this.options.title}</text>
  <text x="372" y="48" font-size="9" font-family="Arial" fill="#9b8ea0" text-anchor="middle">Print 100% scale on A4 cardstock · Red = Cut · Blue dashed = Fold · Green = Glue tab · Match letters</text>
  <line x1="40" y1="56" x2="704" y2="56" stroke="#e8ddd0" stroke-width="1"/>`
  }

  _renderLegend() {
    return `<g transform="translate(40, 1012)">
    <line x1="0" y1="6" x2="36" y2="6" stroke="${CUT_COLOR}" stroke-width="2.2"/>
    <text x="42" y="10" font-size="10" font-family="Arial" fill="#555">Cut</text>
    <line x1="90" y1="6" x2="126" y2="6" stroke="${VALLEY_COLOR}" stroke-width="1.8" stroke-dasharray="6,4"/>
    <text x="132" y="10" font-size="10" font-family="Arial" fill="#555">Fold</text>
    <rect x="190" y="0" width="36" height="12" rx="2" fill="${GLUE_FILL}" stroke="${GLUE_STROKE}" stroke-width="1"/>
    <text x="232" y="10" font-size="10" font-family="Arial" fill="#555">Glue tab (match letters)</text>
  </g>`
  }

  _renderLabels() {
    return Object.entries(this.netFaces)
      .map(([idx, { verts2D }]) => {
        const cx = verts2D.reduce((s, [x]) => s + x, 0) / verts2D.length
        const cy = verts2D.reduce((s, [, y]) => s + y, 0) / verts2D.length
        return `<text x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" font-size="7" font-family="Arial" fill="#b8a898" text-anchor="middle" dominant-baseline="middle" pointer-events="none">${idx}</text>`
      })
      .join('\n  ')
  }

  _darken(hex, amt) {
    if (!hex || hex[0] !== '#' || hex.length < 7) return '#666'
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt)
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt)
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt)
    return `rgb(${r},${g},${b})`
  }
}
