"use client"

import {useState} from "react"
import {ArrowUpRight, Calendar, Download, LineChart, TrendingUp, Users} from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/user/ui/card"
import {Button} from "@/components/user/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/user/ui/tabs"
import {Calendar as CalendarComponent} from "@/components/user/ui/calendar"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/user/ui/popover"
import type {DateRange} from "react-day-picker"
import {format} from "date-fns"
import {ko} from "date-fns/locale"

// 방문자 데이터
const visitorData = [
  {name: "1월", users: 2500, pageViews: 7500},
  {name: "2월", users: 3200, pageViews: 9600},
  {name: "3월", users: 2800, pageViews: 8400},
  {name: "4월", users: 3800, pageViews: 11400},
  {name: "5월", users: 4500, pageViews: 13500},
  {name: "6월", users: 5200, pageViews: 15600},
]

// 사용자 유입 경로 데이터
const referrerData = [
  {name: "직접 접속", value: 40},
  {name: "검색 엔진", value: 30},
  {name: "소셜 미디어", value: 15},
  {name: "외부 링크", value: 10},
  {name: "기타", value: 5},
]

// 사용자 활동 데이터
const activityData = [
  {name: "1월", enrollments: 180, completions: 120},
  {name: "2월", enrollments: 220, completions: 150},
  {name: "3월", enrollments: 240, completions: 170},
  {name: "4월", enrollments: 280, completions: 200},
  {name: "5월", enrollments: 320, completions: 230},
  {name: "6월", enrollments: 350, completions: 250},
]

// 인기 강의 데이터
const popularCoursesData = [
  {name: "React 완벽 가이드", students: 1250},
  {name: "Node.js 백엔드 마스터", students: 980},
  {name: "Python 데이터 분석", students: 1100},
  {name: "Flutter 모바일 앱 개발", students: 750},
  {name: "AWS 클라우드 아키텍처", students: 620},
]

// 사용자 위치 데이터
const locationData = [
  {name: "서울", value: 45},
  {name: "경기", value: 25},
  {name: "부산", value: 10},
  {name: "인천", value: 8},
  {name: "기타", value: 12},
]

// 디바이스 데이터
const deviceData = [
  {name: "데스크톱", value: 55},
  {name: "모바일", value: 35},
  {name: "태블릿", value: 10},
]

// 파이 차트 색상
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

// 데이터 타입 정의
interface ExitPage {
   name: string;
  url: string;
  rate: number;
}

interface PopularCourse {
  name: string;
  instructor: string;
  students: number;
}

interface DataPoint {
  name: string;
  value: number;
}

// 이탈 페이지 데이터
const exitPages: ExitPage[] = [
  {month: "홈페이지", url: "/", rate: 25},
  {month: "강의 목록", url: "/courses", rate: 18},
  {month: "강의 상세", url: "/courses/[id]", rate: 15},
  {month: "결제 페이지", url: "/checkout", rate: 12},
  {month: "로그인", url: "/login", rate: 10},
]

// 인기 강의 데이터
const popularCourses: PopularCourse[] = [
  {month: "React 완벽 가이드", instructor: "김개발", students: 1250},
  {month: "Node.js 백엔드 마스터", instructor: "이서버", students: 980},
  {month: "Python 데이터 분석", instructor: "박데이터", students: 1100},
  {month: "Flutter 모바일 앱 개발", instructor: "최모바일", students: 750},
  {month: "AWS 클라우드 아키텍처", instructor: "정클라우드", students: 620},
]

// 연령대 데이터
const ageData: DataPoint[] = [
  {month: "10대", value: 5},
  {month: "20대", value: 45},
  {month: "30대", value: 35},
  {month: "40대", value: 12},
  {month: "50대 이상", value: 3},
]

export default function AnalyticsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 5, 1),
    to: new Date(2023, 5, 30),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">통계 분석</h2>
        <p className="text-muted-foreground">
          플랫폼의 사용자 활동과 성과를 분석하세요.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <Calendar className="mr-2 h-4 w-4"/>
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "yyyy년 MM월 dd일", {locale: ko})} -{" "}
                    {format(date.to, "yyyy년 MM월 dd일", {locale: ko})}
                  </>
                ) : (
                  format(date.from, "yyyy년 MM월 dd일", {locale: ko})
                )
              ) : (
                <span>날짜 선택</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={ko}
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4"/>
            보고서 다운로드
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 방문자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22,000</div>
            <p className="text-xs text-muted-foreground">
              +15.6% 전월 대비
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">페이지 뷰</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">66,000</div>
            <p className="text-xs text-muted-foreground">
              +15.5% 전월 대비
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 체류 시간</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">12분 30초</div>
            <p className="text-xs text-muted-foreground">
              +2.3% 전월 대비
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이탈률</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.5%</div>
            <p className="text-xs text-muted-foreground">
              -3.2% 전월 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visitors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visitors">방문자</TabsTrigger>
          <TabsTrigger value="engagement">참여도</TabsTrigger>
          <TabsTrigger value="courses">강의 분석</TabsTrigger>
          <TabsTrigger value="demographics">인구통계</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>방문자 추이</CardTitle>
                <CardDescription>
                  일별 방문자 수 추이입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350} children={
                  <AreaChart data={visitorData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip formatter={(value) => [`${value}명`, "방문자"]}/>
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      name="방문자"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      name="페이지 뷰"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.2}
                    />
                    <Legend/>
                  </AreaChart>
                }/>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>유입 경로</CardTitle>
                <CardDescription>
                  방문자의 유입 경로 분포입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsPieChart>
                    <Pie
                      data={referrerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {referrerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "비율"]}/>
                    <Legend/>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>주요 지표</CardTitle>
              <CardDescription>
                방문자 관련 주요 지표입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">신규 방문자 비율</p>
                  <p className="text-2xl font-bold">65.2%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">재방문 비율</p>
                  <p className="text-2xl font-bold">34.8%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">평균 페이지 뷰</p>
                  <p className="text-2xl font-bold">3.2</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">전환율</p>
                  <p className="text-2xl font-bold">4.8%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>체류 시간 분포</CardTitle>
                <CardDescription>
                  사용자의 체류 시간 분포입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350} children={
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, "비율"]}/>
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {activityData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                      ))}
                    </Bar>
                  </BarChart>
                }/>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>이탈 페이지</CardTitle>
                <CardDescription>
                  사용자가 가장 많이 이탈하는 페이지입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exitPages.map((page, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{page.name}</p>
                        <p className="text-sm text-muted-foreground">{page.url}</p>
                      </div>
                      <div className="ml-auto font-medium">{page.rate}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>인기 강의</CardTitle>
                <CardDescription>
                  가장 많은 수강생이 있는 강의입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularCourses.map((course, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{course.name}</p>
                        <p className="text-sm text-muted-foreground">{course.instructor}</p>
                      </div>
                      <div className="ml-auto font-medium">{course.students}명</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>카테고리별 강의 분포</CardTitle>
                <CardDescription>
                  카테고리별 강의 수 분포입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        {name: "프론트엔드", value: 35},
                        {name: "백엔드", value: 30},
                        {name: "모바일", value: 15},
                        {name: "데브옵스", value: 10},
                        {name: "데이터 사이언스", value: 10}
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color}/>
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "비율"]}/>
                    <Legend/>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>강의 성과</CardTitle>
              <CardDescription>
                강의 관련 주요 지표입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">총 강의 수</p>
                  <p className="text-2xl font-bold">128</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">총 수강생</p>
                  <p className="text-2xl font-bold">5,240</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">평균 수강 완료율</p>
                  <p className="text-2xl font-bold">78.5%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">평균 평가 점수</p>
                  <p className="text-2xl font-bold">4.7/5.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>연령대 분포</CardTitle>
                <CardDescription>
                  사용자의 연령대 분포입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, "비율"]}/>
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>기기 분포</CardTitle>
                <CardDescription>
                  사용자의 기기 분포입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={deviceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, "비율"]}/>
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
