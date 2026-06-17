export class BaseAnimal {
  constructor(params) {
    this.params = params
    this.keypoints = {}
    this.faces = []
    this.faceGroups = {}
  }

  defineKeypoints() {
    throw new Error('Override defineKeypoints() in subclass')
  }

  defineFaces() {
    throw new Error('Override defineFaces() in subclass')
  }

  generate() {
    this.defineKeypoints()
    this.defineFaces()
    return this.buildGeometry()
  }

  buildGeometry() {
    const vertices = []
    const indices = []
    const kpNames = Object.keys(this.keypoints)

    kpNames.forEach((name) => {
      vertices.push(...this.keypoints[name])
    })

    this.faces.forEach(([a, b, c]) => {
      indices.push(kpNames.indexOf(a), kpNames.indexOf(b), kpNames.indexOf(c))
    })

    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
      faces: this.faces,
      keypoints: this.keypoints,
      faceGroups: this.faceGroups,
    }
  }

  lerp(a, b, t) {
    return a + (b - a) * t
  }
}
