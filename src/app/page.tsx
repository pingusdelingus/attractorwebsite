"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function AizawaAttractor({ scrollProgress }) {
  const meshRef = useRef()
  const [positions, setPositions] = useState([])

  useEffect(() => {
    const generateAttractor = () => {
      const points = []
      let x = 0.1
      let y = 0
      let z = 0
      const a = 0.95
      const b = 0.7
      const c = 0.6
      const d = 3.5
      const e = 0.25
      const f = 0.1

      for (let i = 0; i < 20000; i++) {
        const dx = (z - b) * x - d * y
        const dy = d * x + (z - b) * y
        const dz = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x

        x += dx * 0.01
        y += dy * 0.01
        z += dz * 0.01

        points.push(new THREE.Vector3(x, y, z))
      }
      setPositions(points)
    }

    generateAttractor()
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current && positions.length > 0) {
      const time = state.clock.getElapsedTime()
      const convergenceRate = 0.1 + scrollProgress * 0.9

      // Create double scroll effect
      const scrollOffset = Math.floor(positions.length * scrollProgress) * 2
      const visiblePoints = positions.length * (0.1 + scrollProgress * 0.9)

      const displayedPoints = [
        ...positions.slice(scrollOffset % positions.length, (scrollOffset % positions.length) + visiblePoints),
        ...positions.slice(0, Math.max(0, visiblePoints - (positions.length - (scrollOffset % positions.length)))),
      ]

      meshRef.current.geometry.setFromPoints(displayedPoints)

      meshRef.current.rotation.y = time * 0.1
      meshRef.current.scale.setScalar(20 + scrollProgress * 10) // Increased scale
    }
  })

  return (
    <line ref={meshRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#00A5E0" linewidth={1} /> {/* Picton Blue */}
    </line>
  )
}

function Scene({ scrollProgress }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.z = 50 // Decreased from 150 to 50 for a closer view
  }, [camera])

  return (
    <>
      <AizawaAttractor scrollProgress={scrollProgress} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  )
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

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
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
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

