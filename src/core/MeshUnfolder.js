export class MeshUnfolder {
  constructor(geometryData) {
    this.vertices = geometryData.vertices
    this.faces = geometryData.faces
    this.keypoints = geometryData.keypoints
    this.kpNames = Object.keys(this.keypoints)
  }

  unfold() {
    const adjacency = this.buildAdjacencyGraph()
    const spanningTree = this.buildSpanningTree(adjacency)
    const unfolded = this.unfoldAlongTree(spanningTree)
    const layout = this.layoutPages(unfolded)
    return { faces: layout, tree: spanningTree, adjacency }
  }

  buildAdjacencyGraph() {
    const adj = {}
    this.faces.forEach((faceA, i) => {
      adj[i] = []
      this.faces.forEach((faceB, j) => {
        if (i === j) return
        const shared = this.getSharedEdge(faceA, faceB)
        if (shared) {
          adj[i].push({ neighbor: j, edge: shared })
        }
      })
    })
    return adj
  }

  getSharedEdge(faceA, faceB) {
    const edgesA = this.getFaceEdges(faceA)
    const edgesB = this.getFaceEdges(faceB)
    for (const ea of edgesA) {
      for (const eb of edgesB) {
        if (
          (ea[0] === eb[0] && ea[1] === eb[1]) ||
          (ea[0] === eb[1] && ea[1] === eb[0])
        ) {
          return ea
        }
      }
    }
    return null
  }

  getFaceEdges([a, b, c]) {
    return [
      [a, b],
      [b, c],
      [c, a],
    ]
  }

  buildSpanningTree(adjacency) {
    const visited = new Set()
    const tree = {}
    const queue = [0]
    visited.add(0)
    tree[0] = null

    while (queue.length > 0) {
      const current = queue.shift()
      for (const { neighbor, edge } of adjacency[current]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          tree[neighbor] = { parent: current, edge }
          queue.push(neighbor)
        }
      }
    }
    return tree
  }

  unfoldAlongTree(tree) {
    const placed = {}
    const face0 = this.faces[0]
    placed[0] = {
      verts2D: this.placeFaceFlat(face0),
      kpNames: face0,
    }

    // Traverse in BFS order using the tree structure
    const order = [0]
    const visited = new Set([0])

    while (order.length > 0) {
      const parentIdx = order.shift()

      Object.entries(tree).forEach(([childIdxStr, info]) => {
        const childIdx = parseInt(childIdxStr, 10)
        if (!info || info.parent !== parentIdx) return
        if (visited.has(childIdx)) return

        visited.add(childIdx)
        const childFace = this.faces[childIdx]
        const parentPlaced = placed[parentIdx]

        placed[childIdx] = this.unfoldFace(childFace, info.edge, parentPlaced)
        order.push(childIdx)
      })
    }

    return placed
  }

  placeFaceFlat([a, b, c]) {
    const va = this.getKP(a)
    const vb = this.getKP(b)
    const vc = this.getKP(c)

    const ab = this.sub3(vb, va)
    const len = this.len3(ab)
    const xAxis = this.normalize3(ab)

    const normal = this.normalize3(this.cross3(ab, this.sub3(vc, va)))
    const yAxis = this.normalize3(this.cross3(normal, xAxis))

    const p0 = [0, 0]
    const p1 = [len, 0]
    const ac = this.sub3(vc, va)
    const p2 = [this.dot3(ac, xAxis), this.dot3(ac, yAxis)]

    return [p0, p1, p2]
  }

  unfoldFace(childFace, sharedEdge, parentPlaced) {
    const [eA, eB] = sharedEdge
    const childKPs = childFace
    const freeKP = childKPs.find((kp) => kp !== eA && kp !== eB)

    const parentKPs = parentPlaced.kpNames
    const eA_2D = parentPlaced.verts2D[parentKPs.indexOf(eA)]
    const eB_2D = parentPlaced.verts2D[parentKPs.indexOf(eB)]

    // Parent's free vertex 2D position (to know which side to reflect away from)
    const parentFreeKP = parentKPs.find((kp) => kp !== eA && kp !== eB)
    const parentFree_2D = parentPlaced.verts2D[parentKPs.indexOf(parentFreeKP)]

    // 3D distances from child's free vertex to each edge endpoint
    const free3D = this.getKP(freeKP)
    const eA3D = this.getKP(eA)
    const eB3D = this.getKP(eB)
    const distToA = this.len3(this.sub3(free3D, eA3D))
    const distToB = this.len3(this.sub3(free3D, eB3D))

    // Determine which side parent's free vertex is on, then place child on opposite side
    const edgeDx = eB_2D[0] - eA_2D[0]
    const edgeDy = eB_2D[1] - eA_2D[1]
    const parentCross =
      edgeDx * (parentFree_2D[1] - eA_2D[1]) -
      edgeDy * (parentFree_2D[0] - eA_2D[0])
    const parentOnUpper = parentCross > 0

    const free2D = this.triangulate2D(
      eA_2D,
      eB_2D,
      distToA,
      distToB,
      !parentOnUpper, // child goes on opposite side
    )

    const verts2D = childKPs.map((kp) => {
      if (kp === eA) return eA_2D
      if (kp === eB) return eB_2D
      return free2D
    })

    return { verts2D, kpNames: childKPs }
  }

  triangulate2D(pA, pB, rA, rB, upper = true) {
    const dx = pB[0] - pA[0]
    const dy = pB[1] - pA[1]
    const d = Math.sqrt(dx * dx + dy * dy)

    if (d === 0 || d > rA + rB || d < Math.abs(rA - rB)) {
      return [(pA[0] + pB[0]) / 2, (pA[1] + pB[1]) / 2]
    }

    const a = (rA * rA - rB * rB + d * d) / (2 * d)
    const h = Math.sqrt(Math.max(0, rA * rA - a * a))

    const mx = pA[0] + (a * dx) / d
    const my = pA[1] + (a * dy) / d

    const sign = upper ? 1 : -1
    return [mx + sign * h * (-dy / d), my + sign * h * (dx / d)]
  }

  layoutPages(placed) {
    const A4_W = 744
    const A4_H = 1052
    const MARGIN = 60

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    Object.values(placed).forEach(({ verts2D }) => {
      verts2D.forEach(([x, y]) => {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      })
    })

    const netW = maxX - minX
    const netH = maxY - minY
    if (netW === 0 || netH === 0) return placed

    const scale = Math.min(
      (A4_W - MARGIN * 2) / netW,
      (A4_H - MARGIN * 2) / netH,
    )

    // Center within page
    const drawW = netW * scale
    const drawH = netH * scale
    const offsetX = (A4_W - drawW) / 2
    const offsetY = (A4_H - drawH) / 2 + 40 // nudge down to leave room for title

    const normalized = {}
    Object.entries(placed).forEach(([idx, { verts2D, kpNames }]) => {
      normalized[idx] = {
        kpNames,
        verts2D: verts2D.map(([x, y]) => [
          (x - minX) * scale + offsetX,
          (y - minY) * scale + offsetY,
        ]),
      }
    })

    return normalized
  }

  getKP(name) {
    return this.keypoints[name]
  }
  sub3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  }
  add3(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
  }
  dot3(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  }
  len3(a) {
    return Math.sqrt(this.dot3(a, a))
  }
  normalize3(a) {
    const l = this.len3(a)
    return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0]
  }
  cross3(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ]
  }
}
