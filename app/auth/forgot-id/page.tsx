"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Phone, Check, Loader2 } from 'lucide-react'
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { Label } from "@/components/user/ui/label"
import { Alert, AlertDescription } from "@/components/user/ui/alert"
import NetflixHeader from "@/components/netflix-header"
import axios from "axios"


export default function ForgotIdPage() {
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState(1) // 1: 휴대폰 입력, 2: 인증번호 입력, 3: 결과
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180) // 3분 타이머
  const [timerActive, setTimerActive] = useState(false)
  const [verificationError, setVerificationError] = useState("")
  const [foundEmail, setFoundEmail] = useState("")

  // 인증번호 요청
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      await axios.post("/api/auth/send-auth-code", null, {
        params: { phone: phone.replaceAll("-", "") }
      })
  
      setStep(2)
      setTimerActive(true)
      setTimeLeft(180)
  
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            setTimerActive(false)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
  
      return () => clearInterval(timer)
    } catch (err: any) {
      alert(err.response?.data?.msg || "휴대폰 인증번호 발송 실패")
    } finally {
      setIsLoading(false)
    }
  }

  // 인증번호 검증 + 아이디(이메일)조회
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setVerificationError("")
  
    try {
      const res = await axios.post("/api/auth/verify-auth-code", {
        phone: phone.replaceAll("-", ""),
        authCode: verificationCode
      })
  
      setFoundEmail(res.data.data)  // 서버에서 내려준 email
      setStep(3)
    } catch (err: any) {
      setVerificationError(err.response?.data?.msg || "인증 실패")
    } finally {
      setIsLoading(false)
    }
  }

  // 인증번호 재발송
  const resendVerificationCode = async () => {
    try {
      await axios.post("/api/auth/send-auth-code", null, {
        params: { phone: phone.replaceAll("-", "") }
      })
  
      setTimeLeft(180)
      setTimerActive(true)
      setVerificationError("")
    } catch (err: any) {
      alert(err.response?.data?.msg || "인증번호 재발송 실패")
    }
  }

  // const handleVerificationSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setIsLoading(true)
  //   setVerificationError("")

  //   // 실제 구현에서는 API 호출을 통해 인증번호를 확인합니다
  //   setTimeout(() => {
  //     setIsLoading(false)
  //     if (verificationCode === "123456") { // 예시 코드
  //       // 인증 성공 시 이메일 표시
  //       setFoundEmail("user***@example.com") // 실제로는 서버에서 받아온 이메일
  //       setStep(3)
  //     } else {
  //       setVerificationError("인증 코드가 일치하지 않습니다. 다시 확인해주세요.")
  //     }
  //   }, 1500)
  // }

  // const resendVerificationCode = () => {
  //   // 실제로는 여기서 서버에 인증 코드 재발송 요청을 보냅니다.
  //   setTimeLeft(180)
  //   setTimerActive(true)
  //   setVerificationError("")

  //   // 타이머 재시작
  //   const timer = setInterval(() => {
  //     setTimeLeft((prevTime) => {
  //       if (prevTime <= 1) {
  //         clearInterval(timer)
  //         setTimerActive(false)
  //         return 0
  //       }
  //       return prevTime - 1
  //     })
  //   }, 1000)

  //   return () => clearInterval(timer)
  // }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "")
    
    // 형식에 맞게 변환 (010-1234-5678)
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value)
    setPhone(formattedValue)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NetflixHeader />

      <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/auth/user/login" className="inline-flex items-center text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              로그인으로 돌아가기
            </Link>
          </div>

          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo/CodeFlix.png?height=40&width=120"
                alt="CODEFLIX 로고"
                width={120}
                height={40}
                className="h-10 mx-auto"
              />
            </Link>
            <h2 className="mt-6 text-3xl font-bold">아이디 찾기</h2>
            <p className="mt-2 text-sm text-gray-400">
              가입 시 등록한 휴대폰 번호로 아이디를 찾을 수 있습니다.
            </p>
          </div>

          <div className="bg-gray-900 py-8 px-6 shadow-lg rounded-lg border border-gray-800">
            {step === 1 && (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    휴대폰 번호
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="010-0000-0000"
                      className="appearance-none block w-full px-3 py-2 bg-gray-800 border-gray-700 text-white"
                      value={phone}
                      onChange={handlePhoneChange}
                      maxLength={13}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">가입 시 등록한 휴대폰 번호를 입력해주세요.</p>
                </div>

                <div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        인증번호 받기
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">휴대폰 인증</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    {phone}로 인증 코드를 발송했습니다.
                    <br />
                    문자메시지를 확인하고 아래에 인증 코드를 입력해주세요.
                  </p>
                </div>

                {verificationError && (
                  <Alert variant="destructive" className="mb-4 bg-red-900 border-red-800 text-white">
                    <AlertDescription>{verificationError}</AlertDescription>
                  </Alert>
                )}

                <form className="space-y-6" onSubmit={handleVerificationSubmit}>
                  <div>
                    <Label htmlFor="verification-code" className="block text-sm font-medium text-gray-300">
                      인증 코드
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="verification-code"
                        name="verification-code"
                        type="text"
                        required
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-400">
                        인증 코드 유효시간:{" "}
                        <span className={timeLeft < 60 ? "text-red-500" : "text-gray-300"}>{formatTime(timeLeft)}</span>
                      </p>
                      <button
                        type="button"
                        onClick={resendVerificationCode}
                        disabled={timerActive && timeLeft > 0}
                        className="text-xs text-red-500 hover:text-red-400 disabled:text-gray-500"
                      >
                        인증 코드 재발송
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => setStep(1)}
                    >
                      이전
                    </Button>
                    <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          인증 중...
                        </>
                      ) : (
                        "인증 확인"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">아이디 찾기 완료</h3>
                <p className="text-gray-300 mb-6">
                  회원님의 아이디는 <span className="font-medium text-white">{foundEmail}</span> 입니다.
                </p>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => window.location.href = "/auth/user/login"}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    로그인하기
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/auth/forgot-password"}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    비밀번호 찾기
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              계정이 기억나셨나요?{" "}
              <Link href="/auth/user/login" className="font-medium text-red-500 hover:text-red-400">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
