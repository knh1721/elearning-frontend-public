'use client'
import Link from "next/link"
import {ArrowUpRight, BookOpen, DollarSign, MessageSquare, TrendingUp, Users} from "lucide-react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/user/ui/card"
import {Button} from "@/components/user/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/user/ui/tabs"
import {Overview} from "@/components/user/dashboard/overview"
import {RecentSales} from "@/components/user/dashboard/recent-sales"
import {useEffect, useState} from "react";

interface AdminDashboardDTO {
  totalRevenue: number;

  totalUsers: number;
  userIncreaseFromLastWeek: number;

  totalCourses: number;
  courseIncreaseFromLastWeek: number;

  unresolvedInquiries: number;
  inquiryIncreaseFromLastWeek: number;

  monthlyRevenueOverview: MonthlyRevenueDTO[];
  recentSales: RecentSaleDTO[];

  pendingCourse: number;
  popularCategories: PopularCategoryDTO[];

  recentActivity: RecentActivityDTO;
}

interface MonthlyRevenueDTO {
  month: string; // 예: "2025-04"
  revenue: number; // BigDecimal 이지만 프론트에서는 number 로
}

interface RecentSaleDTO {
  courseTitle: string;
  purchaserId: number;
  purchaserName: string;
  profileImg: string;
  price: number;
  purchasedAt: string; // 예: "3시간 전"
}

interface PopularCategoryDTO {
  categoryName: string;
   usageRate: number;
}

interface RecentActivityDTO {
  userRegistrations: DailyUserRegistrationDTO;
  recentCourse: RecentCourseDTO;
}

interface DailyUserRegistrationDTO {
  todayCount: number;
  lastUserRegisteredAgo: string; // 예: "2시간전" 또는 "-"
}

interface RecentCourseDTO {
  courseTitle: string;
  instructorName: string;
  registeredAgo: string; // 예: "3시간 전"
}


export default function DashboardPage() {

  const [dashboardData, setDashboardData] = useState<AdminDashboardDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  function formatRevenue(revenue: number) {
    return revenue.toLocaleString();
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        const data = await response.json();
        console.log(data);
        setDashboardData(data.data);
      } catch (err: any) {
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData().then(() => {
    });
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류 발생: {error}</p>;
  if (!dashboardData) return <p>데이터가 없습니다.</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
        <p className="text-muted-foreground">개발자 e러닝 플랫폼의 주요 지표와 현황을 확인하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatRevenue(dashboardData.totalRevenue)}</div>
            {/*<p className="text-xs text-muted-foreground">+20.1% 전월 대비</p>*/}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.userIncreaseFromLastWeek >= 0 ? `+${dashboardData.userIncreaseFromLastWeek}` : dashboardData.userIncreaseFromLastWeek} 지난
              주 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 강의</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.courseIncreaseFromLastWeek >= 0 ? `+${dashboardData.courseIncreaseFromLastWeek}` : dashboardData.courseIncreaseFromLastWeek} 지난
              달 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미해결 문의</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.unresolvedInquiries}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.inquiryIncreaseFromLastWeek >= 0 ? `+${dashboardData.inquiryIncreaseFromLastWeek}` : dashboardData.inquiryIncreaseFromLastWeek} 지난
              주 대비
            </p>
          </CardContent>
        </Card>

      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          {/*<TabsTrigger value="analytics">분석</TabsTrigger>
          <TabsTrigger value="reports">보고서</TabsTrigger>*/}
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>매출 개요</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview monthlyRevenueOverview={dashboardData.monthlyRevenueOverview}/>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>최근 판매</CardTitle>
                <CardDescription>최근 10건의 판매 내역입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales recentSales={dashboardData.recentSales}/>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/*<TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>상세 분석</CardTitle>
              <CardDescription>플랫폼 사용 패턴과 사용자 행동에 대한 상세 분석입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">상세 분석 차트가 여기에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>*/}
        {/*<TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>보고서</CardTitle>
              <CardDescription>다운로드 가능한 보고서 목록입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">월간 매출 보고서</p>
                    <p className="text-sm text-muted-foreground">2023년 6월</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4"/>
                    다운로드
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">분기별 사용자 통계</p>
                    <p className="text-sm text-muted-foreground">2023년 Q2</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4"/>
                    다운로드
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">강의 인기도 분석</p>
                    <p className="text-sm text-muted-foreground">2023년 상반기</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4"/>
                    다운로드
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>*/}
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>심사 대기 강의</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingCourse}</div>
            <p className="text-sm text-muted-foreground mt-2">{dashboardData.pendingCourse}개의 강의가 심사 대기 중입니다.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/dashboard/reviews" className="w-full">
              <Button className="w-full" variant="outline">
                심사하기
                <ArrowUpRight className="ml-2 h-4 w-4"/>
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>인기 카테고리</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardData.popularCategories.map((category, index) => {
              return (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{category.categoryName}</span>
                    <span className="text-sm font-medium">{category.usageRate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-primary" style={{width: `${category.usageRate}%`}}></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 사용자 등록 섹션 */}
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-secondary p-2">
                  <Users className="h-4 w-4"/>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">새 사용자 등록</p>
                  {dashboardData.recentActivity.userRegistrations.todayCount > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        오늘 {dashboardData.recentActivity.userRegistrations.todayCount}명의 새로운 사용자가 등록했습니다.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.recentActivity.userRegistrations.lastUserRegisteredAgo}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">오늘 등록한 사용자가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 강의 등록 섹션 */}
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-secondary p-2">
                  <BookOpen className="h-4 w-4"/>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">새 강의 등록</p>
                  {dashboardData.recentActivity.recentCourse ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.recentActivity.recentCourse.courseTitle} 강의가 등록되었습니다.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.recentActivity.recentCourse.registeredAgo}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">오늘 등록된 강의가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

        </Card>
      </div>
    </div>
  )
}
