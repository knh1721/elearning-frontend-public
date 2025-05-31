"use client"

import { useParams } from "next/navigation"
import { Star, Check, ChevronRight, BookOpen, Clock, Award, Zap, Users, Lightbulb, MessageSquare } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export default function CourseIntroduction() {
  const params = useParams()
  const slug = params?.slug

  const [activeStep, setActiveStep] = useState(0)
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Only render this component when the slug is "40"
  if (slug !== "40") {
    return null
  }

  const reviews = [
    {
      name: "편성주",
      role: "수강생 1",
      rating: 5.0,
      content:
        "ChatGPT 글쓰기에 대한 기본적인 지식을 습득할 수 있었습니다. 많은 도움이 되었습니다. 좋은 선 저자의 책과 함께 학습하면 더 좋을 것 같습니다.",
      progress: "14% 수강 후 작성",
    },
    {
      name: "이민규",
      role: "한국언론진흥재단",
      rating: 5.0,
      content: "최고의 강의 감사합니다 많은 도움이 되었습니다",
      progress: "100% 수강 후 작성",
    },
    {
      name: "이승엽",
      role: "수강생 2",
      rating: 5.0,
      content:
        "chatgpt 활용에 대해서 다양한 방법을 알 수 있을 좋았습니다. 업무간 많은 비중을 차지하는 글쓰기를 더 효율적으로...",
      progress: "100% 수강 후 작성",
    },
    {
      name: "gisoopa",
      role: "수강생 1",
      rating: 5.0,
      content: "탁월하며, 쉬우며, 독창적 강의",
      progress: "62% 수강 후 작성",
    },
  ]

  const learningPoints = [
    "챗GPT로 비즈니스 글을 어떻게 작성하는지 기본 전략",
    "글쓰기 작업을 위한 프롬프트 설정과 활용법",
    "자신만의 글쓰기 스타일을 구축하는 맞춤형 지침",
    "실제 비즈니스 상황에서 챗GPT를 활용한 글쓰기 예시",
  ]

  const writingProcess = [
    {
      title: "기본 프롬프트 작성",
      description: "글의 주제, 목적, 대상을 명확히 하여 초기 프롬프트를 작성합니다.",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      title: "생성된 내용 수정",
      description: "챗GPT가 생성한 내용을 검토하고 필요한 부분을 수정합니다.",
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      title: "원고 피드백 및 교정",
      description: "최종 원고를 검토하고 필요한 피드백을 반영하여 완성합니다.",
      icon: <Check className="h-6 w-6" />,
    },
  ]

  const writingEfficiency = [
    { category: "보고서 작성", percentage: 30 },
    { category: "이메일 작성", percentage: 20 },
    { category: "회의록 작성", percentage: 10 },
    { category: "제안서 작성", percentage: 10 },
    { category: "계약서 작성", percentage: 10 },
  ]

  const targetAudience = [
    {
      type: "직장인",
      description: "보고서, 이메일, 기획 작업 등 글쓰기가 필요한 사람",
      icon: <Users className="h-5 w-5" />,
    },
    {
      type: "사업가",
      description: "자신의 사업을 홍보하거나 관리해야 하는 사람",
      icon: <Award className="h-5 w-5" />,
    },
    {
      type: "전문직(프리랜서)",
      description: "글쓰기 작업이 자신의 업무 비중이 높은 사람",
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      type: "개발자",
      description: "코드 주석, 개발 문서 작성, 팀원과의 커뮤니케이션 등에서 명확한 글쓰기가 필요한 사람",
      icon: <Zap className="h-5 w-5" />,
    },
  ]

  const writingProblems = [
    {
      problem: "소통의 어려움",
      impact: "다른 사람과 소통하는데 중요한 수단",
      critical: true,
    },
    {
      problem: "업무 효율성 저하",
      impact: "보고서나 제안서 작성 시간이 많이 소요",
      critical: true,
    },
    {
      problem: "자신의 역량 저하",
      impact: "생각을 정리하고 표현하는 능력이 저하",
      critical: false,
    },
    {
      problem: "이미지 하락",
      impact: "글쓰기 능력을 통해 그 사람의 역량을 판단",
      critical: false,
    },
    {
      problem: "업무 성과 하락",
      impact: "업무 성과를 결정하는 중요한 요소 중 하나",
      critical: false,
    },
  ]

  return (
    <div className="w-full bg-gradient-to-b from-gray-900 to-gray-950 text-white rounded-lg">
      {/* 강의 제목 섹션 */}
      <div className="border-b border-gray-700 pb-6 pt-6 px-6">
        {/* <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          챗GPT 비즈니스 글쓰기: 당신의 업무 비서가 되는 방법 (입문편)
        </h1> */}
        <p className="text-gray-300 text-lg md:text-base">임문자를 위해 준비한 [업무 자동화] 강의입니다.</p>
      </div>

      {/* 수강평 섹션 */}
      <div className="py-8 border-b border-gray-700 px-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Star className="h-5 w-5 text-yellow-400 mr-2" />
          수강생 후기
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-500 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                    <span className="font-bold text-white">{review.name[0]}</span>
                  </div>
                  <div>
                    <span className="font-medium block">{review.name}</span>
                    <span className="text-sm text-gray-400">
                      {review.role} · 평균 평점 {review.rating}
                    </span>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  {/* <span className="ml-1 font-medium">{review.rating}</span> */}
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">{review.content}</p>
              <div className="mt-2 text-xs text-gray-400">{review.progress}</div>
            </motion.div>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-blue-400 hover:text-blue-300 flex items-center transition-colors duration-300"
          >
            {showAllReviews ? "접기" : "더 많은 수강평 보기"}
            <ChevronRight
              className={`h-5 w-5 ml-1 transition-transform duration-300 ${showAllReviews ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 이런 걸 배울 수 있어요 섹션 */}
      <div className="py-8 border-b border-gray-700 px-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <BookOpen className="h-5 w-5 text-blue-400 mr-2" />
          이런 걸 배울 수 있어요
        </h2>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <ul className="space-y-4">
            {learningPoints.map((point, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-200">{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* 강의 소개 섹션 */}
      <div className="py-8 border-b border-gray-700 px-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Lightbulb className="h-5 w-5 text-yellow-400 mr-2" />
          강의 소개
        </h2>
        <p className="mb-6 text-gray-300 leading-relaxed">
          이 강의는 챗GPT를 비즈니스 글쓰기에 효과적으로 활용하는 방법에 제공합니다. 각 글쓰기 단계에서 챗GPT의 효율적인
          사용 전략과 실제 사례를 소개하고, 개인 사용자에 맞춘 맞춤형 지침을 통해 개인화된 글쓰기 스타일을 구축하는
          방법과 원고 수정에 대한 상세한 지침을 다룹니다. 이 강의는 직장인, 사업가, 프리랜서, 개발자들에게 업무에서의
          글쓰기 커뮤니케이션에 유용한 도구가 될 것입니다.
        </p>

        <div className="space-y-4 mt-6">
          <h3 className="font-medium text-lg flex items-center">
            <Clock className="h-5 w-5 text-blue-400 mr-2" />
            주요 내용:
          </h3>
          <ol className="list-decimal pl-8 space-y-3">
            <li className="text-gray-300">맞춤형 지침으로 개인화된 글쓰기 스타일 구축</li>
            <li className="text-gray-300">글쓰기 프롬프트의 효과적인 사용 방법</li>
            <li className="text-gray-300">비즈니스 글쓰기의 5단계 프로세스 이해</li>
            <li className="text-gray-300">원고 수정을 위한 3단계 방법론 이해</li>
          </ol>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/30 rounded-lg">
          <h3 className="text-lg font-medium text-blue-300 mb-4">무료 제공 자료</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-blue-500 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="text-blue-200">
                <span className="font-medium">맞춤형 지침 다운로드</span> - 챕터0에서 다운로드 가능
              </p>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-500 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="text-blue-200">
                <span className="font-medium">챗GPT 프롬프트 사용자 가이드: 글쓰기편 (PDF)</span> - 현재 크롬에서 판매
                중인 전자책을 무료로 제공
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 프롬프트 작성법 섹션 */}
      <div className="py-8 border-b border-gray-700 px-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <MessageSquare className="h-5 w-5 text-green-400 mr-2" />
          효과적인 프롬프트 작성법
        </h2>

        {/* 프로세스 단계 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 relative">
            {writingProcess.map((step, index) => (
              <div key={index} className="w-full md:w-1/3 mb-4 md:mb-0 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.2 }}
                  className={`mx-2 p-5 rounded-lg cursor-pointer transition-all duration-300 ${
                    activeStep === index
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                      : "bg-gray-800 hover:bg-gray-750"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                        activeStep === index ? "bg-white" : "bg-gray-700"
                      }`}
                    >
                      <span className={activeStep === index ? "text-blue-600" : "text-gray-300"}>{index + 1}</span>
                    </div>
                    <h3 className="font-medium">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-300">{step.description}</p>
                </motion.div>
                {index < writingProcess.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 z-0">
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 프로세스 상세 내용 */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            {activeStep === 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">기본 프롬프트 작성 시 고려사항</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2">글의 주제</h4>
                    <p className="text-sm">명확한 주제 설정으로 AI가 이해하기 쉽게 합니다.</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2">세부 사항</h4>
                    <p className="text-sm">필요한 세부 정보를 포함하여 구체적인 결과물을 얻습니다.</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2">목적과 타깃</h4>
                    <p className="text-sm">글의 목적과 대상 독자를 명확히 하여 맞춤형 콘텐츠를 생성합니다.</p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div>
                <h3 className="text-lg font-medium mb-4">생성된 내용 수정 방법</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-500 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-gray-300">AI가 생성한 내용을 검토하고 필요한 부분을 수정합니다.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-gray-300">추가 정보가 필요한 경우 프롬프트를 보완하여 다시 요청합니다.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-gray-300">톤과 스타일을 일관되게 유지하도록 조정합니다.</p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <h3 className="text-lg font-medium mb-4">원고 피드백 및 교정 단계</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-green-400 mb-2">피드백 요청하기</h4>
                    <p className="text-sm">챗GPT에게 작성된 글에 대한 피드백을 요청하여 개선점을 파악합니다.</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-green-400 mb-2">교정 및 편집</h4>
                    <p className="text-sm">문법, 맞춤법, 문장 구조 등을 개선하여 글의 품질을 높입니다.</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 md:col-span-2">
                    <h4 className="font-medium text-green-400 mb-2">최종 검토</h4>
                    <p className="text-sm">전체적인 흐름, 일관성, 명확성을 확인하고 최종 원고를 완성합니다.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* 글쓰기 비중 및 효율성 섹션 */}
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-6">직장인 글쓰기 비중 및 문제점</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 글쓰기 비중 차트 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="font-medium mb-4 flex items-center">
                <Clock className="h-5 w-5 text-blue-400 mr-2" />
                직장인 글쓰기 비중
              </h4>

              <div className="space-y-4">
                {writingEfficiency.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{item.category}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 text-center">
                  <div className="text-white font-bold">
                    글쓰기 비중
                    <br />
                    40~50%
                  </div>
                </div>
              </div>
            </div>

            {/* 글쓰기 문제점 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="font-medium mb-4 flex items-center">
                <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                글쓰기 부족 시 발생 문제
              </h4>

              <div className="space-y-3">
                {writingProblems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <div className="mr-3 mt-0.5 text-gray-400">{index + 1}.</div>
                    <div>
                      <span className="font-medium">{item.problem}:</span>
                      <span className={`ml-2 ${item.critical ? "text-red-400" : "text-gray-400"}`}>{item.impact}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 추천 대상 섹션 */}
      <div className="py-8 px-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Users className="h-5 w-5 text-purple-400 mr-2" />
          이런 분들께 추천드려요!
        </h2>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
            <div className="mr-0 md:mr-8 mb-6 md:mb-0 flex-shrink-0">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="text-center mt-3">
                <span className="text-sm text-gray-300">
                  학습 대상은
                  <br />
                  누구일까요?
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
              {targetAudience.map((audience, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2 mr-3 flex-shrink-0 mt-0.5">
                    {audience.icon}
                  </div>
                  <div>
                    <span className="font-medium block mb-1">{audience.type}</span>
                    <span className="text-sm text-gray-300">{audience.description}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mr-0 md:mr-8 mb-6 md:mb-0 flex-shrink-0">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                <Lightbulb className="h-10 w-10 text-white" />
              </div>
              <div className="text-center mt-3">
                <span className="text-sm text-gray-300">
                  선수 지식,
                  <br />
                  필요할까요?
                </span>
              </div>
            </div>

            <div className="flex-grow">
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-full p-2 mr-3 flex-shrink-0 mt-0.5">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg">기본적인 챗GPT 사용법만 알면 충분합니다</span>
                  <p className="text-sm text-gray-300 mt-2">
                    이 강의는 챗GPT를 처음 접하는 분들도 쉽게 따라할 수 있도록 기초부터 차근차근 설명합니다. 복잡한
                    프로그래밍 지식이나 AI에 대한 깊은 이해가 없어도 비즈니스 글쓰기에 챗GPT를 활용할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 수강 신청 버튼 */}
        {/* <div className="mt-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg transition-all duration-300"
          >
            지금 바로 수강 신청하기
          </motion.button>
        </div> */}
      </div>
    </div>
  )
}
