"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import useUserStore from "@/app/auth/userStore"

interface User {
  id: number
  name: string
  profileUrl?: string
  isInstructor?: boolean
}

interface NewMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUsers: (users: User[]) => void
}

export default function NewMessageModal({ isOpen, onClose, onSelectUsers }: NewMessageModalProps) {
  const { user } = useUserStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]) // string[] → User[]
  const [users, setUsers] = useState<User[]>([])

  // 추천 유저 또는 검색 결과 불러오기
  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
      try {
        const endpoint = searchQuery.trim()
          ? `/api/chat/search?keyword=${encodeURIComponent(searchQuery)}`
          : `/api/chat/recommended?userId=${user.id}`
        const res = await fetch(endpoint)
        const data = await res.json()
        console.log("유저 목록:", data)
        setUsers(Array.isArray(data) ? data.map(u => ({
          id: u.id,
          name: u.nickname, // nickname을 name으로 복사
          profileUrl: u.profileUrl,
          isInstructor: u.isInstructor,
        })) : [])
      } catch (err) {
        console.error("유저 목록 불러오기 실패", err)
        setUsers([])
      }
    }

    const timeout = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery, user, isOpen])

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id)
      return exists ? prev.filter((u) => u.id !== user.id) : [...prev, user]
    })
  }  

  const handleNext = () => {
    onSelectUsers(selectedUsers)
    onClose()
  }
  
  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("")
      setSelectedUsers([])
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-black w-full max-w-md rounded-lg border border-gray-800 overflow-hidden">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-white">새로운 메시지</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-2 mb-22">
            {selectedUsers.map((u) => (
              <div key={u.id} className="flex items-center px-2 py-1 bg-gray-700 rounded-full text-white text-sm">
                {u.name}
                <button
                  className="ml-2 text-xs text-gray-300 hover:text-white"
                  onClick={() => toggleUserSelection(u)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 검색 필드 */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center">
            <span className="text-white mr-2">받는 사람 :</span>
            <div className="relative flex-1">
              <Input
                placeholder="이름, 이메일, 깃허브 링크로 검색..."
                className="bg-transparent border-0 focus-visible:ring-0 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 유저 목록 */}
        <div className="max-h-[400px] overflow-y-auto">
          <div className="p-2">
            <h3 className="text-sm text-gray-400 px-2 py-1">
              {searchQuery ? "검색 결과" : "추천"}
            </h3>
          </div>

          {users.map((user) => {
            const isSelected = selectedUsers.some((u) => u.id === user.id)
            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-gray-900 cursor-pointer"
                onClick={() => toggleUserSelection(user)}
              >
                <div className="flex items-center">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                  <Image
                    src={
                      user.profileUrl ||
                      `/placeholder.svg?height=40&width=40&text=${user.name ? user.name.charAt(0) : "?"}`
                    }
                    alt={user.name || "유저"}
                    width={40}
                    height={40}
                  />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-white">{user.name}</span>
                      {user.isInstructor && (
                        <span className="ml-2 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">강사</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                  {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                </div>
              </div>
            )
          })}

        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t border-gray-800">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={selectedUsers.length === 0}
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}