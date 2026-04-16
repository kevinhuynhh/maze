import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import usePapercraftStore from '../store/usePapercraftStore'

export default function Viewer3D() {
  const { mesh, faceColors, defaultColor } = usePapercraftStore()

  return (
    <div className="w-full h-full bg-gradient-to-b from-amber-50 to-amber-100 relative">
      <Canvas camera={{ position: [0, 0.45, 2.4], fov: 42 }} shadows={false}>
        <color attach="background" args={['#fdf6ec']} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[2.5, 4, 3]} intensity={1.15} />
        <directionalLight position={[-2, 1.5, -2]} intensity={0.35} />
        <hemisphereLight args={['#fff5e8', '#b9a27a', 0.4]} />
        {mesh && (
          <AnimalMesh mesh={mesh} faceColors={faceColors} defaultColor={defaultColor} />
        )}
        <OrbitControls
          enablePan={false}
          minDistance={1.2}
          maxDistance={5}
          target={[0, 0.35, 0]}
        />
        <GroundShadow />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 pointer-events-none select-none">
        🖱️ Drag to rotate · Scroll to zoom
      </div>
    </div>
  )
}

function GroundShadow() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.55, 0]}>
      <circleGeometry args={[1.2, 48]} />
      <meshBasicMaterial color="#e9d9bf" transparent opacity={0.35} />
    </mesh>
  )
}

function AnimalMesh({ mesh, faceColors, defaultColor }) {
  const geometry = useMemo(() => {
    if (!mesh) return null
    const geo = new THREE.BufferGeometry()

    // Unindexed so we can color each face independently.
    const kpNames = Object.keys(mesh.keypoints)
    const positions = new Float32Array(mesh.faces.length * 9)
    const colors = new Float32Array(mesh.faces.length * 9)

    const tmpColor = new THREE.Color()

    mesh.faces.forEach((face, fIdx) => {
      const hex = faceColors[fIdx] || defaultColor
      tmpColor.set(hex)
      for (let i = 0; i < 3; i++) {
        const kp = face[i]
        const v = mesh.keypoints[kp]
        const base = fIdx * 9 + i * 3
        positions[base] = v[0]
        positions[base + 1] = v[1]
        positions[base + 2] = v[2]
        colors[base] = tmpColor.r
        colors[base + 1] = tmpColor.g
        colors[base + 2] = tmpColor.b
      }
    })

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [mesh, faceColors, defaultColor])

  if (!geometry) return null

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          flatShading
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#2d2416"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  )
}
