"use client"

import { motion } from "framer-motion"
import HeroPuzzle from "./hero-puzzle"
import SideStatCard from "./side-stat-card"
import SideSlideCard from "./side-slide-card"
import SideMiniCarousel from "./side-mini-carousel"
import { SliderData } from "../slider"

// ① prop 타입 정의
export interface HeroProps {
    slides: SliderData[];      // <-- 이미 다른 파일에 있는 인터페이스 그대로 재사용
    existCourse: boolean;
}

export default function Hero({ slides, existCourse }: HeroProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    // <section className="hero mt-20 relative h-screen bg-black flex justify-between items-start px-6 lg:px-20 xl:px-32">
    // <section className="hero mt-20 relative h-screen bg-black px-40 flex items-start gap-10">
    // <section className="hero mt-20 relative h-screen bg-black px-40 flex items-start justify-center gap-10">
    <section className="hero mt-24 relative h-auto bg-black flex justify-center items-start gap-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
        viewport={{ once: true }}
      >
        <HeroPuzzle />
      </motion.div>

      <motion.div
        className="hero-side flex flex-col gap-6 w-[220px]"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <SideStatCard />
        <SideSlideCard />
        <SideMiniCarousel />
      </motion.div>
    </section>
  )
}
