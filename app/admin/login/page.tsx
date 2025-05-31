"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { Label } from "@/components/user/ui/label"
import axios from "axios"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      console.log(email)
      console.log(password)
      const response = await axios.post("/api/admin/login", {
        email,
        password
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (response.data.code === 1) {
         router.push("/admin/dashboard")
      } else {
         setError(response.data.message || "로그인에 실패했습니다.")
      }
    } catch (error: any) {
         console.error("Login error:", error)
      if (error.response?.data?.message) {
         setError(error.response.data.message)
      } else if (error.response?.status === 500) {
         setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      } else {
         setError("로그인 중 오류가 발생했습니다.")
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-800 p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">관리자 로그인</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email" className="text-gray-200">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-200">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <Button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            로그인
          </Button>
        </form>
      </div>
    </div>
  )
} 