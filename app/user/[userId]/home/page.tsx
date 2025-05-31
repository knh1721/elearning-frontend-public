"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useUserStore from "@/app/auth/userStore";
import UserHomeSidebar from "@/components/user/home/user-home-sidebar";
import UserIntro from "@/components/user/home/user-intro";
import UserPosts from "@/components/user/home/user-posts";
import NetflixHeader from "@/components/netflix-header";

const API_URL = "/api/user/home";

type Post = {
  postId: number;
  bname: string;
  subject: string;
  content: string;
  createdDate: string;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  reply: string | null;
  authorId: number;
  isInstructor: boolean;
};

type UserData = {
  userId: number;
  nickname: string;
  profileUrl?: string;
  bio: string;
  githubLink?: string;
};

export default function UserProfile() {
  const { user, restoreFromStorage } = useUserStore();
  const loginUserId = user?.id;
  const params = useParams();
  const profileUserId = params?.userId ? Number(params.userId) : null;
  const isMyPage = loginUserId === profileUserId;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("home");
  const [bio, setBio] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!user) {
      restoreFromStorage();
    }
  }, [user, restoreFromStorage]);

  useEffect(() => {
    if (!profileUserId) return;

    const fetchAll = async () => {
      try {
        const profileRes = await fetch(`${API_URL}/profile/${profileUserId}`, { credentials: "include" });
        if (profileRes.status === 401 || profileRes.status === 403) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          router.push("/auth/user/login");
          return;
        }
        const profileData = await profileRes.json();
        setUserData(profileData.data);
        setBio(profileData.data.bio);

        const postRes = await fetch(`${API_URL}/posts/${profileUserId}`, { credentials: "include" });
        const postResult = await postRes.json();
        const postsRaw = postResult.data ?? [];

        setPosts(
          postsRaw.map((post: any) => ({
            postId: post.postId,
            bname: post.bname,
            subject: post.subject,
            content: post.content,
            createdDate: post.createdDate,
            viewCount: post.viewCount,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            reply: post.reply,
            authorId: post.authorId,
            isInstructor: post.isInstructor,
          }))
        );

        const followerRes = await fetch(`${API_URL}/followers/count/${profileUserId}`, { credentials: "include" });
        const followerData = await followerRes.json();
        setFollowerCount(followerData?.data ?? 0);
      } catch (err) {
        console.error("사용자 데이터 로딩 실패", err);
      }
    };

    fetchAll();
  }, [profileUserId]);

  useEffect(() => {
    if (!userData) return;

    const checkFollowStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/follow/status/${profileUserId}`, { credentials: "include" });
        const result = await res.json();
        //console.log("팔로우 상태 응답:", result);

        const following = result?.data?.following;
        if (typeof following === "boolean") {
          setIsFollowing(following);
        } else {
          console.warn("팔로우 상태 데이터가 올바르지 않음:", result);
          setIsFollowing(false);
        }
      } catch (err) {
        console.error("팔로우 상태 확인 실패", err);
      }
    };

    checkFollowStatus();
  }, [userData, profileUserId]);

  const handleFollowToggle = async () => {
    try {
      const res = await fetch(`${API_URL}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          targetUserId: profileUserId,
        }),
      });
  
      const result = await res.json();
      if (result.msg === "팔로우 성공") {
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      } else if (result.msg === "팔로우 취소 성공") {
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
      } else if (result.msg === "본인은 본인을 팔로우할 수 없습니다.") {
        alert(result.msg);
      }
    } catch (err) {
      console.error("팔로우 처리 실패", err);
    }
  };

  const handleSaveBio = async () => {
    try {
      const res = await fetch(`${API_URL}/bio?bio=${encodeURIComponent(bio)}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        alert("소개글이 성공적으로 수정되었습니다.");
      } else {
        alert("소개글 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("소개글 수정 오류", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}. ${month}. ${day}.`;
  };

  if (!userData) {
    return <div className="text-white p-8">로딩 중...</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <NetflixHeader />

      <div className="max-w-7xl mx-auto px-6 pt-24 flex">
      <UserHomeSidebar
          userData={userData}
          isMyPage={isMyPage}
          isFollowing={isFollowing}
          followerCount={followerCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleFollowToggle={handleFollowToggle}
        />
        <main className="flex-1 ml-6 space-y-6 pb-16">
          {activeTab === "home" && (
            <UserIntro
            userData={userData}
            bio={bio}
            setBio={setBio}
            isMyPage={isMyPage}
            followerCount={followerCount}
            handleSaveBio={handleSaveBio}
          />
          )}

          {(activeTab === "home" || activeTab === "posts") && (
            <UserPosts posts={posts} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
}
