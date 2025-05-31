"use client";

import Image from "next/image";
import { Bell, Home, FileText } from "lucide-react";
import { Button } from "@/components/user/ui/button";
import { Separator } from "@/components/user/ui/separator";

type UserData = {
  nickname: string;
  bio: string;
  githubLink?: string;
  profileUrl?: string;
};

type UserHomeSidebarProps = {
  userData: UserData;
  isMyPage: boolean;
  isFollowing: boolean;
  followerCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleFollowToggle: () => Promise<void>;
};

export default function UserHomeSidebar({
  userData,
  isMyPage,
  isFollowing,
  followerCount,
  activeTab,
  setActiveTab,
  handleFollowToggle,
}: UserHomeSidebarProps) {
  return (
    <div className="p-4 pt-8 w-[250px]">
      {/* 프로필 영역 */}
      <div className="flex flex-col items-center mb-6">
        <Image
          src={userData.profileUrl || "/placeholder.svg"}
          alt="사용자 프로필"
          width={200}
          height={200}
          className="w-32 h-32 rounded-full object-cover border border-gray-800 mb-4"
        />
        <h2 className="font-bold text-xl text-white">{userData.nickname}</h2>

        {/* GitHub 링크 표시 (링크 존재할 경우만) */}
        {userData.githubLink ? (
          <a
            href={userData.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-sm text-blue-400 hover:underline break-all"
          >
            {userData.githubLink}
          </a>
        ) : (
          <p className="mt-2 text-sm text-gray-500">등록된 GitHub 링크가 없습니다.</p>
        )}
        {/* 본인이면 팔로워 수, 아니면 팔로우 버튼 */}
        {isMyPage ? (
          <div className="mt-4 text-white text-sm">팔로워 수 : {followerCount ?? 0}명</div>
        ) : (
          <Button
            onClick={handleFollowToggle}
            className={`mt-4 w-full flex items-center justify-center gap-2 rounded-full border text-sm font-semibold transition
              ${
                isFollowing
                  ? "bg-red-600 text-white hover:bg-red-700 border-red-600"
                  : "bg-white text-red-600 border-red-600 hover:bg-red-100"
              }`}
          >
            <Bell className="h-4 w-4" />
            {isFollowing ? "팔로우 취소" : "팔로우"}
          </Button>
        )}
      </div>

      <Separator className="my-4 bg-gray-800" />

      {/* 사이드바 메뉴 */}
      <nav>
        <ul className="space-y-2">
          {[ 
            { label: "홈", value: "home", icon: <Home className="h-4 w-4 mr-2" /> },
            { label: "게시글", value: "posts", icon: <FileText className="h-4 w-4 mr-2" /> },
          ].map((tab) => (
            <li key={tab.value}>
              <Button
                variant={activeTab === tab.value ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === tab.value
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "hover:bg-gray-800 text-white"
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.icon}
                {tab.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
