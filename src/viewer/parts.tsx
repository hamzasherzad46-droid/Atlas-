import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as THREE from 'three'

/** Soft studio lighting: a procedural room environment (no HDR download) plus a key and a rim light. */
export function Lights() {
  const gl = useThree((s) => s.gl)
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    return texture
  }, [gl])
  useEffect(() => () => env.dispose(), [env])
  return (
    <>
      {/* Attaches to the scene's `environment`; intensity is set on the Canvas scene. */}
      <primitive object={env} attach="environment" />
      <hemisphereLight args={['#fbf7ef', '#2a2723', 0.45]} />
      <directionalLight position={[1.5, 3, 2.5]} intensity={1.3} color="#fff9ef" />
      <directionalLight position={[-2.5, 1.5, -2]} intensity={0.75} color="#e9eef5" />
    </>
  )
}

/**
 * Label pinned to a point on the model with a leader line. As on an atlas plate the label sits
 * outward from the body (left of centre → label on the left), unless that would leave the screen.
 */
export function PinLabel({ point, label }: { point: [number, number, number]; label: string }) {
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  const invalidate = useThree((s) => s.invalidate)
  const [left, setLeft] = useState(false)
  const projected = useMemo(() => new THREE.Vector3(), [])
  // Html positions itself on rendered frames; a new point needs one.
  useEffect(() => invalidate(), [point, invalidate])
  useFrame(() => {
    const x = ((projected.set(...point).project(camera).x + 1) / 2) * width
    const room = 48 + label.length * 8 // dot, leader and an estimate of the name's width
    const wantLeft = x < width / 2
    const next = wantLeft ? x > room : x + room > width
    if (next !== left) setLeft(next)
  })
  return (
    <Html position={point} pointerEvents="none" zIndexRange={[3, 0]} wrapperClass="pin-wrap">
      <div className={`pin${left ? ' flip' : ''}`} key={label}>
        <span className="pin-dot" />
        <span className="pin-line" />
        <span className="pin-name">{label}</span>
      </div>
    </Html>
  )
}

