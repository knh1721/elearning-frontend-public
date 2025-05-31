"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
// import { Heart } from "lucide-react"

interface Instructor {
  id: string
  instructorId: string
  name: string
  profileUrl: string | null
  expertise: string
  bio: string | null
  coursesCount: number
  totalStudents: number
  averageRating: number
}

interface RecommendedInstructorsProps {
  instructors: Instructor[]
}

export default function RecommendedInstructors({ instructors = [] }: RecommendedInstructorsProps) {
  const [visible, setVisible] = useState(false)
  const [followed, setFollowed] = useState<Record<string, boolean>>({})

  useEffect(() => setVisible(true), [])
  const toggleFollow = (id: string) => setFollowed(prev => ({ ...prev, [id]: !prev[id] }))
  if (!instructors.length) return null

  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5),transparent_50%)]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold mb-2 text-white">추천 강사</h2>
        <p className="text-gray-400 mb-12">업계 최고의 전문가들에게 배우세요</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {instructors.map((i, idx) => {
            const isF = !!followed[i.id]
            return (
              <div
                key={`${i.id}-${idx}`}
                className={`relative transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${idx*100}ms` }}
              >
                {/* 카드: 본체 + 프로필 포함 */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-4 h-96 overflow-hidden">  
                  {/* 네모 윗부분: 이미지는 이 안에 중앙 상단 */}
                  <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden flex items-center justify-center z-20 bg-gray-800">
                    <Image
                      src={i.profileUrl||'/placeholder.svg'}
                      alt={i.name}
                      width={100} height={100}
                      className="rounded-full object-cover"
                    />
                    {/* <button
                      onClick={()=>toggleFollow(i.id)}
                      className="absolute bottom-1 right-1 p-1 bg-red-600 rounded-full"
                    > */}
                      {/* <Heart className="w-4 h-4 text-white" fill={isF?'currentColor':'none'} stroke="currentColor" /> */}
                    {/* </button> */}
                  </div>
                  {/* 정보: 하단 텍스트 */}
                  <div className="mt-32 text-center text-white flex-1 space-y-4">
                    <div>
                        <Link href={`/instructor/${i.instructorId}/home`}>
                            <h3 className="text-2xl font-bold mb-1 hover:text-red-400 transition-colors">{i.name}</h3>
                        </Link>
                      {i.expertise && <p className="text-sm text-red-400 mb-2">{i.expertise}</p>}
                      <p className="text-base text-gray-400 mb-4 line-clamp-2">{i.bio || '-'}</p>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 text-xs text-white">
                        <div className="text-center">
                            <div className="font-bold text-lg">{i.coursesCount}</div>
                            강의
                        </div>
                        <div className="text-center border-x border-gray-700 px-4">
                            <div className="font-bold text-lg">{i.totalStudents}</div>
                            수강생
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">{i.averageRating.toFixed(1)}</div>
                            평점
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
