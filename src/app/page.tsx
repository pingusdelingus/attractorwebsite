"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { Slider } from "@/components/ui/slider"

interface AizawaParams {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

function AizawaAttractor({ scrollProgress, params }: { scrollProgress: number, params: AizawaParams }) {
  const meshRef = useRef<THREE.Line>(null)
  const [positions, setPositions] = useState<THREE.Vector3[]>([])
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)

  useEffect(() => {
    const generateAttractor = () => {
      const points = []
      let x = 0.1
      let y = 0
      let z = 0

      for (let i = 0; i < 20000; i++) {
        const dx = (z - params.b) * x - params.d * y
        const dy = params.d * x + (z - params.b) * y
        const dz = params.c + params.a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + params.e * z) + params.f * z * x * x * x

        x += dx * 0.01
        y += dy * 0.01
        z += dz * 0.01

        points.push(new THREE.Vector3(x, y, z))
      }
      setPositions(points)
    }

    generateAttractor()
  }, [params])

  useFrame((state, delta) => {
    if (meshRef.current && positions.length > 0) {
      const time = state.clock.getElapsedTime()
      const convergenceRate = 0.1 + scrollProgress * 0.9

      const scrollOffset = Math.floor(positions.length * scrollProgress) * 2
      const visiblePoints = positions.length * (0.1 + scrollProgress * 0.9)

      const displayedPoints = [
        ...positions.slice(scrollOffset % positions.length, (scrollOffset % positions.length) + visiblePoints),
        ...positions.slice(0, Math.max(0, visiblePoints - (positions.length - (scrollOffset % positions.length)))),
      ]

      // Dispose of the old geometry if it exists
      if (geometry) {
        geometry.dispose()
      }

      // Create a new geometry with the current points
      const newGeometry = new THREE.BufferGeometry()
      newGeometry.setFromPoints(displayedPoints)
      newGeometry.computeBoundingSphere()
      newGeometry.computeVertexNormals()
      setGeometry(newGeometry)
      meshRef.current.geometry = newGeometry

      meshRef.current.rotation.y = time * 0.1
      meshRef.current.scale.setScalar(20 + scrollProgress * 10)
    }
  })

  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      if (geometry) {
        geometry.dispose()
      }
    }
  }, [geometry])

  return (
    <line ref={meshRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#00A5E0" linewidth={1} />
    </line>
  )
}

function Scene({ scrollProgress, params }: { scrollProgress: number, params: AizawaParams }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.z = 50
  }, [camera])

  return (
    <>
      <AizawaAttractor scrollProgress={scrollProgress} params={params} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  )
}

function ParameterSlider({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step,
  description
}: { 
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  description: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-jetbrains-mono text-white">{label}</label>
        <p className="text-xs font-jetbrains-mono text-white/70">{description}</p>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={min}
        max={max}
        step={step}
        className="w-[200px]"
      />
    </div>
  )
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [params, setParams] = useState<AizawaParams>({
    a: 0.95,
    b: 0.7,
    c: 0.6,
    d: 3.5,
    e: 0.25,
    f: 0.1
  })

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = window.scrollY / totalHeight
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="min-h-screen" style={{ background: "#424874" }}>
      <div className="fixed inset-0 z-0">
        <Canvas>
          <Scene scrollProgress={scrollProgress} params={params} />
        </Canvas>
      </div>
      <div className="fixed top-4 right-4 z-20 bg-black/50 p-2 rounded-lg backdrop-blur-sm transition-all duration-300 hover:p-4 group">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-jetbrains-mono text-white/70 group-hover:text-white transition-colors duration-300">Parameters</h3>
          </div>
          <div className="space-y-4 transition-all duration-300 group-hover:w-[200px] w-[100px]">
            <p className="text-xs font-jetbrains-mono text-white/70 group-hover:opacity-0 opacity-100 transition-opacity duration-300 text-center">hover over me :)</p>
            <div className="transition-all duration-300 group-hover:opacity-100 opacity-0 group-hover:h-auto h-0 overflow-hidden">
              <ParameterSlider
                label="a"
                value={params.a}
                onChange={(value) => setParams({ ...params, a: value })}
                min={0}
                max={2}
                step={0.01}
                description="Controls the z-axis scaling and overall shape"
              />
            </div>
            <div className="transition-all duration-300 group-hover:opacity-100 opacity-0 group-hover:h-auto h-0 overflow-hidden">
              <ParameterSlider
                label="b"
                value={params.b}
                onChange={(value) => setParams({ ...params, b: value })}
                min={0}
                max={2}
                step={0.01}
                description="Affects rotation speed and pattern density"
              />
            </div>
            <div className="transition-all duration-300 group-hover:opacity-100 opacity-0 group-hover:h-auto h-0 overflow-hidden">
              <ParameterSlider
                label="c"
                value={params.c}
                onChange={(value) => setParams({ ...params, c: value })}
                min={0}
                max={2}
                step={0.01}
                description="Determines vertical offset and pattern height"
              />
            </div>
            <div className="transition-all duration-300 group-hover:opacity-100 opacity-0 group-hover:h-auto h-0 overflow-hidden">
              <ParameterSlider
                label="d"
                value={params.d}
                onChange={(value) => setParams({ ...params, d: value })}
                min={0}
                max={5}
                step={0.1}
                description="Controls overall size and pattern spread"
              />
            </div>
            <div className="transition-all duration-300 group-hover:opacity-100 opacity-0 group-hover:h-auto h-0 overflow-hidden">
              <ParameterSlider
                label="e"
                value={params.e}
                onChange={(value) => setParams({ ...params, e: value })}
                min={0}
                max={1}
                step={0.01}
                description="Influences pattern complexity and detail"
              />
            </div>
            <div className="transition-all duration-300 group-hover:opacity-100 opacity-0 group-hover:h-auto h-0 overflow-hidden">
              <ParameterSlider
                label="f"
                value={params.f}
                onChange={(value) => setParams({ ...params, f: value })}
                min={0}
                max={1}
                step={0.01}
                description="Creates asymmetry in the pattern"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <header className="p-8">
          <h1 className="text-4xl font-bold mb-4 translucent-text font-jetbrains-mono">esteban morales</h1>
          <p className="text-xl translucent-text font-jetbrains-mono">Data Scientist & Creative Coder</p>
        </header>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl p-8 rounded-lg translucent-container">
            <h2 className="text-3xl font-bold mb-4 translucent-text font-jetbrains-mono">About Me</h2>
            <p className="mb-4 translucent-text font-jetbrains-mono">
             Esteban is a Junior at the University of Miami, currently studying Mathematics, Data Science & AI. 
            He has devoted his time to working as an educator with K-12 students and as a researcher for the TPTP World Project. 
            His enthusiasm for teaching stems from his conviction that aiding students in understanding mathematics conceptually
            promotes the development of analytical and critical thinking, invaluable resources in the modern world. 
            In his free time, he enjoys filmmaking, playing chess, and exploring the outdoors. 
            </p>
            <p className="translucent-text font-jetbrains-mono">
              Scroll down to see how the Aizawa attractor in the background evolves.
            </p>
          </div>
        </section>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl p-8 rounded-lg translucent-container">
            <h2 className="text-3xl font-bold mb-4 translucent-text font-jetbrains-mono">My Projects</h2>
            <ul className="list-disc list-inside">
              <li> <a href="https://github.com/pingusdelingus/IDVDir_dev" className="translucent-text font-jetbrains-mono">interactive data visualization for TPTP </a></li>
              <li> <a href="https://tuitionary.onrender.com" className="translucent-text font-jetbrains-mono"> ai powered scholarship application automation </a> </li>
              <li> <a href="https://github.com/pingusdelingus/qed" className="translucent-text font-jetbrains-mono">created staticly typed, compiled, qbit oriented programming language for quantum computing</a></li>
            </ul>
          </div>
        </section>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl p-8 rounded-lg translucent-container">
            <h2 className="text-3xl font-bold mb-4 translucent-text font-jetbrains-mono">Contact Me</h2>
            <p className="mb-4 translucent-text font-jetbrains-mono">interested in working together? feel free to reach out on github</p>
            <a href="https://github.com/pingusdelingus" className="translucent-link hover:underline font-jetbrains-mono">
              click me :)
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}

