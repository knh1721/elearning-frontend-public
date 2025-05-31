"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/user/ui/input";
import { Separator } from "@/components/user/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/user/ui/card";
import { Textarea } from "@/components/user/ui/textarea";
import { Button } from "@/components/user/ui/button";
import useUserStore from "@/app/auth/userStore";
import { Edit2 } from "lucide-react";

interface MyProfileProps {
    onUserUpdate: (updatedFields: Partial<{ email: string; phone: string; githubLink: string; bio: string; nickname: string; profileUrl: string; }>) => void;
  }

  export default function MyProfile({ onUserUpdate }: MyProfileProps) {
    
  const { user, updateUser } = useUserStore();
  const API_URL = "/api/mypage";

  console.log("현재 userStore에 저장된 user 정보:", user);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [githubLink, setGithubLink] = useState(user?.githubLink || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedProfileUrl, setUploadedProfileUrl] = useState<string | null>(null);

  // 수정용 state
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPhone, setNewPhone] = useState(user?.phone || "");

  // 프로필 수정 버튼 클릭
  const handleProfileEditClick = () => {
    setNickname(user?.nickname || "");    
    setGithubLink(user?.githubLink || ""); 
    setBio(user?.bio || "");               
    setIsEditingProfile(true);
  };

  // 프로필 이미지 변경
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      // 1. 업로드용 Presigned URL 요청
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `profile/${Date.now()}_${file.name}`,  // 파일명 고유하게 (폴더명/profile/)
          fileType: file.type,
        }),
      });
  
      const { uploadUrl, fileUrl } = await res.json();
  
      // 2. Presigned URL로 S3에 직접 업로드
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
  
      console.log("✅ S3 업로드 완료:", fileUrl);
  
      // 3. 업로드 성공하면, 프로필 사진 미리보기 업데이트
      // 만약 서버에도 업데이트하고 싶으면 추가로 API 호출
      setUploadedProfileUrl(fileUrl);
  
      // 나중에 저장할 때 백엔드로 이 fileUrl 보내야 함
    } catch (error) {
      console.error("S3 업로드 실패:", error);
      alert("파일 업로드 중 오류가 발생했습니다.");
    }
  };

  
   // 프로필 저장
   const handleProfileSave = async () => {
    try {
      const response = await fetch(`${API_URL}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          nickname, 
          githubLink, 
          bio,
          profileUrl: uploadedProfileUrl || user?.profileUrl, }),
      });
      const data = await response.json();

      if (data.totalCount === 1) {
        alert(data.msg || "프로필이 성공적으로 수정되었습니다.");
        setIsEditingProfile(false);
        // userStore 업데이트
        updateUser({
          ...user,
          nickname,
          githubLink,
          bio,
          profileUrl: uploadedProfileUrl || user?.profileUrl,
        });
        onUserUpdate({ nickname, githubLink, bio, profileUrl: uploadedProfileUrl || user?.profileUrl });
      } else {
        alert(data.msg || "프로필 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정 요청 중 오류가 발생했습니다.");
    }
  };

  // 프로필 수정 취소
  const handleProfileCancel = () => {
    setNickname(user?.nickname || "");
    setGithubLink(user?.githubLink || "");
    setBio(user?.bio || "");
    setUploadedProfileUrl(null);
    setIsEditingProfile(false);
  };

  useEffect(() => {
    const fetchUserFallback = async () => {
      if (!user || !user.id || !user.phone) {
        try {
          const res = await fetch("/api/user/me", { credentials: "include" });
          const result = await res.json();
          console.log("🔍 /api/user/me 응답 확인:", result);
          if (result.code === 1 && result.data) {
            updateUser(result.data);
          }
        } catch (err) {
          console.error("유저 정보 fallback 실패", err);
        }
      }
    };
  
    fetchUserFallback();
  }, [user, updateUser]);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setNewPhone(user.phone || "");
      setEmail(user.email || "");
      setNewEmail(user.email || "");
      setGithubLink(user.githubLink || "");
      setBio(user.bio || "");
      setNickname(user.nickname || "");
    }
  }, [user]);


  // 이메일 수정 버튼 클릭
  const handleEditEmailClick = () => {
      setNewEmail(user?.email || "");
      setIsEditingEmail(true);
  };

  // 휴대폰 수정 버튼 클릭
  const handleEditPhoneClick = () => {
      setNewPhone(user?.phone || "");
      setIsEditingPhone(true);
  };

  // 이메일 저장
  const handleEmailSave = async () => {
    try {
      const response = await fetch(`${API_URL}/update-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await response.json();
      if (data.totalCount === 1) {
        alert(data.msg || "이메일이 성공적으로 변경되었습니다.");
        setEmail(newEmail);
        setIsEditingEmail(false);
        onUserUpdate({ email: newEmail });
      } else {
        alert(data.msg || "이메일 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("이메일 저장 실패:", error);
      alert("이메일 변경 요청 중 오류가 발생했습니다.");
    }
  };

  // 연락처 저장
  const handlePhoneSave = async () => {
    try {
      const response = await fetch(`${API_URL}/update-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: newPhone }),
      });
      const data = await response.json();
      if (data.totalCount === 1) {
        alert(data.msg || "연락처가 성공적으로 변경되었습니다.");
        setPhone(newPhone);
        setIsEditingPhone(false);
        onUserUpdate({ phone: newPhone });
      } else {
        alert(data.msg || "연락처 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("연락처 저장 실패:", error);
      alert("연락처 변경 요청 중 오류가 발생했습니다.");
    }
  };

  // 비밀번호 재설정 링크 발송
  const handlePasswordReset = async () => {
    try {
      const response = await fetch(`${API_URL}/send-reset-password-email`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.totalCount === 1) {
        alert(data.msg || "비밀번호 재설정 링크가 이메일로 전송되었습니다.");
      } else {
        alert(data.msg || "비밀번호 재설정 링크 발송에 실패했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 재설정 요청 실패:", error);
      alert("비밀번호 재설정 요청 중 오류가 발생했습니다.");
    }
  };


  return (
    <>
      {/* ➡️ 내 프로필 */}
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg">내 프로필</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">이미지</div>
            <div className="relative inline-block w-[80px] h-[80px]">
            <div className="w-full h-full overflow-hidden rounded-full bg-gray-800">
              <Image
                src={uploadedProfileUrl || user?.profileUrl || "/placeholder.svg?height=80&width=80"}
                alt="프로필 이미지"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>

            {isEditingProfile && (
              <>
                <input
                  type="file"
                  id="profileImageUpload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-gray-700 hover:bg-gray-600"
                  onClick={() => document.getElementById('profileImageUpload')?.click()}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">닉네임</div>
            <div className="col-span-1">
              {isEditingProfile ? (
                <Input value={nickname} onChange={(e) => setNickname(e.target.value)} className="text-white" />
              ) : (
               user?.nickname || "사용자"
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">GitHub</div>
            <div className="col-span-1 text-sm">
              {isEditingProfile ? (
                <Input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} className="text-white" />
              ) : (
                user?.githubLink || "GitHub 링크를 입력해주세요."
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">자기소개</div>
            <div className="col-span-1 text-sm">
              {isEditingProfile ? (
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="text-white min-h-[100px]"
                  placeholder="자기소개를 입력하세요"
                />
              ) : (
                user?.bio || "자기소개를 작성해주세요."
              )}
            </div>
          </div>

          <div className="text-right">
          {isEditingProfile ? (
              <>
                <Button variant="outline" size="sm" onClick={handleProfileSave} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  저장
                </Button>
                <Button variant="outline" size="sm" onClick={handleProfileCancel} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  취소
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleProfileEditClick} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                설정
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 기본 정보 */}
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 이메일 */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">이메일</div>
            <div className="col-span-1">
              {isEditingEmail ? (
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="text-white"
                />
              ) : (
                email || "이메일을 등록해주세요."
              )}
            </div>
            <div className="text-right">
              {isEditingEmail ? (
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={handleEmailSave}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  저장
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditEmailClick}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  수정
                </Button>
              )}
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">비밀번호</div>
            <div className="col-span-1">••••••••••</div>
            <div className="text-right">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={handlePasswordReset}
              >
                재설정
              </Button>
            </div>
          </div>

          {/* 연락처 */} 
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-sm text-gray-400">연락처</div>
            <div className="col-span-1">
              {isEditingPhone ? (
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="text-white"
                />
              ) : (
                user?.phone?.trim() ? (
                  <span>{user.phone}</span>
                ) : (
                  <span>연락처를 등록해주세요.</span>
                )
              )}
            </div>
            <div className="text-right">
              {isEditingPhone ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handlePhoneSave}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  저장
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditPhoneClick}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  수정
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
