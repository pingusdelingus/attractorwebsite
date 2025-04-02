
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
      <lineBasicMaterial color="blue" linewidth={1} />
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
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 z-0">
        <Canvas>
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </div>
      <div className="relative z-10">
        <header className="p-8 bg-black/50 backdrop-blur-md">
          <h1 className="text-4xl font-bold mb-4">Your Name</h1>
          <p className="text-xl">Web Developer & Creative Coder</p>
        </header>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl bg-black/50 backdrop-blur-md p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">About Me</h2>
            <p className="mb-4">
              I'm a passionate web developer with a love for creative coding and data visualization. My work combines
              cutting-edge web technologies with mathematical concepts to create unique and engaging user experiences.
            </p>
            <p>
              Scroll down to see how the Aizawa attractor in the background evolves, symbolizing the complexity and
              beauty of the digital world we create.
            </p>
          </div>
        </section>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">My Projects</h2>
            <ul className="list-disc list-inside">
              <li>Interactive Data Visualizations</li>
              <li>Generative Art Installations</li>
              <li>Web-based 3D Experiences</li>
              <li>Custom React Components</li>
            </ul>
          </div>
        </section>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Contact Me</h2>
            <p className="mb-4">Interested in working together? Feel free to reach out!</p>
            <a href="mailto:your.email@example.com" className="text-blue-400 hover:underline">
              your.email@example.com
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}

