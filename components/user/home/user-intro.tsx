"use client";

import { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/user/ui/button";
import { Textarea } from "@/components/user/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/user/ui/dialog";

type UserIntroProps = {
  userData: {
    nickname: string;
    bio: string;
    githubLink?: string;
    profileUrl?: string;
  };
  bio: string;
  setBio: (bio: string) => void;
  isMyPage: boolean;
  followerCount: number;
  handleSaveBio: () => Promise<void>;
};

export default function UserIntro({
  userData,
  bio,
  setBio,
  isMyPage,
  followerCount,
  handleSaveBio,
}: UserIntroProps) {
  const [editBio, setEditBio] = useState(bio ?? "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  // bio 값이 바뀔 때마다 editBio도 업데이트
  useEffect(() => {
    setEditBio(bio ?? "");
  }, [bio]);

  const handleSaveClick = async () => {
    setBio(editBio);
    await handleSaveBio(); // 서버 저장
    setIsDialogOpen(false); // 다이얼로그 닫기
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6 mb-8">
      {/* 상단: 소개 타이틀 + 수정 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">소개</h2>
        {isMyPage && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => setIsDialogOpen(open)}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-gray-700 text-white hover:bg-gray-800 bg-transparent"
              >
                <Edit className="h-4 w-4" /> 수정
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">소개글 수정</DialogTitle>
                <DialogDescription className="text-gray-400">자기소개를 입력하세요.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="min-h-[200px] bg-gray-800 border-gray-700 text-white focus-visible:ring-red-600 focus-visible:ring-offset-0"
                  placeholder="자기소개를 입력해주세요"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSaveClick}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  저장하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* 소개글 본문 */}
      <div>
        <p
          className={`text-white whitespace-pre-line transition-all duration-300 ${
            showFullBio ? "" : "line-clamp-3"
          }`}
        >
          {bio || "작성한 소개글이 없습니다."}
        </p>

        {(bio?.length ?? 0) > 100 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowFullBio(!showFullBio)}
              className="mt-2 text-red-500 text-sm hover:underline"
            >
              {showFullBio ? "접기 ▲" : "더보기 ▼"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
