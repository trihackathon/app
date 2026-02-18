"use client"

import { useRef, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface RopeVisualProps {
  hp: number
  size?: number
  animated?: boolean
}

// 3本の撚り糸の色
const STRAND_COLORS = [0xef4444, 0x22c55e, 0x3b82f6] as const

/** 1本の撚り糸のTubeGeometryを生成 */
function buildStrandGeo(
  idx: number,
  health: number,
  t: number,
  animated: boolean
): THREE.TubeGeometry {
  const frayed = 1 - health
  const SEGS = 34
  const strandOffset = (idx * Math.PI * 2) / 3
  // HP高いほどきつく撚られる
  const twistFreq = 3.5 + health * 4.0
  const points: THREE.Vector3[] = []

  for (let i = 0; i <= SEGS; i++) {
    const s = i / SEGS
    const angle = strandOffset + s * Math.PI * twistFreq

    // ほつれ: 下端に向かうほど糸が広がる
    const spread = frayed * Math.pow(s, 1.6) * 0.5

    // HP低いほど激しく揺れる
    const wobbleX = animated
      ? frayed * 0.15 * Math.sin(t * 2.8 + s * 14 + idx * 2.3)
      : 0
    const wobbleZ = animated
      ? frayed * 0.11 * Math.cos(t * 2.2 + s * 10 + idx * 1.8)
      : 0

    // 縄全体のゆらぎ
    const sway = animated ? 0.045 * Math.sin(t * 0.65 + idx * 0.7) : 0

    const r = 0.075 + spread
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * r + wobbleX + sway,
        0.62 - s * 1.24,            // 上端 +0.62、下端 -0.62
        Math.sin(angle) * r + wobbleZ
      )
    )
  }

  const curve = new THREE.CatmullRomCurve3(points)
  const tubeRadius = Math.max(0.007, 0.021 - frayed * 0.01)
  return new THREE.TubeGeometry(curve, SEGS, tubeRadius, 8, false)
}

function RopeScene({ hp, animated }: { hp: number; animated: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const strandMeshes = useRef<THREE.Mesh[]>([])
  const knotMesh = useRef<THREE.Mesh | null>(null)
  const timeRef = useRef(0)
  const healthRef = useRef(hp / 100)

  // レンダリングごとに最新HPを参照
  healthRef.current = hp / 100

  // シーン初期化（マウント時のみ）
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    group.clear()
    strandMeshes.current = []
    knotMesh.current = null

    // 3本の撚り糸メッシュ
    STRAND_COLORS.forEach((color, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.38,
        metalness: 0.12,
        emissive: color,
        emissiveIntensity: 0.18,
      })
      const mesh = new THREE.Mesh(
        buildStrandGeo(i, healthRef.current, 0, animated),
        mat
      )
      group.add(mesh)
      strandMeshes.current.push(mesh)
    })

    // 上端の固定リング（金属）
    const ringGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.1, 14)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.15,
      metalness: 0.95,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.y = 0.68
    group.add(ring)

    // 中央の結び目（トーラス）
    const knotGeo = new THREE.TorusGeometry(0.09, 0.026, 10, 26)
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.4,
      metalness: 0.18,
      emissive: 0xdc2626,
      emissiveIntensity: 0.28,
    })
    const knot = new THREE.Mesh(knotGeo, knotMat)
    knot.position.y = 0.05
    group.add(knot)
    knotMesh.current = knot

    return () => {
      strandMeshes.current.forEach((m) => {
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })
      ringGeo.dispose()
      ringMat.dispose()
      knotGeo.dispose()
      knotMat.dispose()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state, delta) => {
    if (animated) timeRef.current += delta

    const health = healthRef.current
    const frayed = 1 - health
    const t = timeRef.current

    // 各撚り糸をフレームごとに再生成
    strandMeshes.current.forEach((mesh, i) => {
      const old = mesh.geometry
      mesh.geometry = buildStrandGeo(i, health, t, animated)
      old.dispose()

      const mat = mesh.material as THREE.MeshStandardMaterial

      // HP低下で半透明・グロー消失
      mat.opacity = Math.max(0.32, 1 - frayed * 0.58)
      mat.transparent = health < 0.7

      // HP高いときに時間変化でシマー（きらめき）
      if (health > 0.6) {
        const shimmer = ((health - 0.6) / 0.4) * 0.25
        mat.emissiveIntensity = shimmer * (0.7 + 0.3 * Math.sin(t * 2.5 + i * 1.2))
      } else {
        mat.emissiveIntensity = 0.04
      }
    })

    // 結び目: HPに比例して縮小・低HPで消滅
    if (knotMesh.current) {
      const knotScale = Math.max(0, (health - 0.12) * 1.25)
      knotMesh.current.scale.setScalar(knotScale)
      if (animated) {
        knotMesh.current.rotation.y += delta * 0.9
        knotMesh.current.rotation.x += delta * 0.35
      }
      // 結び目グロー
      const knotMat = knotMesh.current.material as THREE.MeshStandardMaterial
      if (health > 0.5) {
        knotMat.emissiveIntensity = 0.28 + 0.15 * Math.sin(t * 1.8)
      } else {
        knotMat.emissiveIntensity = 0.05
      }
    }

    // hp=0: グループ全体がゆっくり崩れ落ちる演出
    if (groupRef.current && health === 0) {
      const fallProgress = Math.min(1, t * 0.2)
      groupRef.current.position.y = -fallProgress * 0.3
      groupRef.current.rotation.z = fallProgress * 0.3
    }
  })

  return <group ref={groupRef} />
}

export function RopeVisual({ hp, size = 200, animated = true }: RopeVisualProps) {
  return (
    <div style={{ width: size, height: size }} className="mx-auto">
      <Canvas
        camera={{ position: [0.4, 0, 2.6], fov: 46 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        {/* メイン照明 */}
        <ambientLight intensity={0.45} />
        {/* 主光源: 右上から */}
        <pointLight position={[1.5, 2.5, 2]} intensity={1.6} />
        {/* アクセント: 左下から紫色 */}
        <pointLight position={[-1.2, -1.5, 1]} intensity={0.45} color="#818cf8" />
        {/* 奥から暖色 */}
        <pointLight position={[0, 1.2, -1.2]} intensity={0.3} color="#fb923c" />

        <Suspense fallback={null}>
          <RopeScene hp={hp} animated={animated} />
        </Suspense>
      </Canvas>
    </div>
  )
}
