"use client"

import {useEffect, useState} from "react"
import {CreditCard, DollarSign, Download, LineChart, Wallet} from "lucide-react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/user/ui/card"
import {Button} from "@/components/user/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/user/ui/tabs"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/user/ui/table"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/user/ui/select"
import {Badge} from "@/components/user/ui/badge"
import {Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import axios from "axios";

interface AdminDashboardData {
  totalRevenue: number;
  totalRevenueGrowth: number;
  currentMonthRevenue: number;
  currentMonthGrowth: number;
  expectedSettlementAmount: number;
  expectedSettlementCount: number;
  commissionRevenue: number;
  commissionGrowth: number;
  averageCoursePrice: number;
  averagePurchaseAmount: number;
  repurchaseRate: number;
  refundRate: number;
  revenueData: MonthlyRevenueDTO[];
  categoryRevenueData: CategoryRevenueDTO[];
  paymentData: PaymentDTO[];
  settlementData: SettlementDTO[];
}

interface MonthlyRevenueDTO {
  month: string; // 예: "2025-04"
  revenue: number; // BigDecimal 이지만 프론트에서는 number 로
}

interface CategoryRevenueDTO {
  name: string;
  value: number;
}

interface PaymentDTO {
  id: string;
  user: string;
  email: string;
  course: string;
  amount: number;
  status: string;
  date: string;
  method: string;
}

interface SettlementDTO {
  id: string;
  instructor: string;
  email: string;
  courses: number;
  totalSales: number;
  commission: number;
  amount: number;
  status: string;
  date: string;
}

const fetchAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const response = await axios.get('/api/admin/sales');
  return response.data.data; // API 에서 data 안에 들어있기 때문에
};

const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('ko-KR'); // 한국식 콤마 포맷
};

export default function SalesPage() {
  /*const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 1),
    to: new Date(2025, 3, 30),
  })*/
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const [settlementStatusFilter, setSettlementStatusFilter] = useState("all");
  const [settlementPage, setSettlementPage] = useState(1);

  const settlementsPerPage = 10;


  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // 매출 데이터
  const [revenueData, setRevenueData] = useState<MonthlyRevenueDTO[]>([
    {month: "1월", revenue: 45000000},
    {month: "2월", revenue: 52000000},
    {month: "3월", revenue: 48000000},
    {month: "4월", revenue: 61000000},
    {month: "5월", revenue: 75000000},
    {month: "6월", revenue: 85000000},
  ])

  // 카테고리별 매출 데이터
  const [categoryRevenueData, setCategoryRevenueData] = useState<CategoryRevenueDTO[]>([
    {name: "프론트엔드", value: 42},
    {name: "백엔드", value: 35},
    {name: "모바일", value: 15},
    {name: "데브옵스", value: 8},
  ])

  // 결제 내역 데이터
  const [paymentData, setPaymentData] = useState<PaymentDTO[]>([
    {
      id: "INV-001",
      user: "김민수",
      email: "kim@example.com",
      course: "React 완벽 가이드",
      amount: 120000,
      status: "completed",
      date: "2023-06-28",
      method: "카드",
    },
  ])

  // 정산 내역 데이터
  const [settlementData, setSettlementData] = useState<SettlementDTO[]>([
    {
      id: "STL-001",
      instructor: "이지은",
      email: "lee@example.com",
      courses: 2,
      totalSales: 930000,
      commission: 279000,
      amount: 651000,
      status: "completed",
      date: "2023-06-15",
    },
  ])

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchAdminDashboardData();
        setDashboardData(data);

        // 개별 상태에 데이터 설정
        setRevenueData(data.revenueData || []);
        setCategoryRevenueData(data.categoryRevenueData || []);
        setPaymentData(data.paymentData || []);
        setSettlementData(data.settlementData || []);
      } catch (error) {
        console.error('관리자 대시보드 데이터를 불러오지 못했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    getData().then(() => {
    });
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (!dashboardData) return <div>데이터 없음</div>;
  const filteredPayments = paymentData.filter(
    (payment) => statusFilter === "all" || payment.status === statusFilter
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const currentData = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredSettlements = settlementData.filter(
    (settlement) =>
      settlementStatusFilter === "all" || settlement.status === settlementStatusFilter
  );

  const totalSettlementPages = Math.ceil(filteredSettlements.length / settlementsPerPage);
  const currentSettlements = filteredSettlements.slice(
    (settlementPage - 1) * settlementsPerPage,
    settlementPage * settlementsPerPage
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">매출 관리</h2>
        <p className="text-muted-foreground">플랫폼의 매출 현황과 결제 내역, 정산 내역을 확인하세요.</p>
      </div>

      {/*<div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4"/>
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "yyyy 년 MM월 dd일", {locale: ko})} -{" "}
                    {format(date.to, "yyyy 년 MM월 dd일", {locale: ko})}
                  </>
                ) : (
                  format(date.from, "yyyy 년 MM월 dd일", {locale: ko})
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
      </div>*/}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatCurrency(dashboardData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.totalRevenueGrowth}% 전월 대비</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatCurrency(dashboardData.currentMonthRevenue)}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.currentMonthGrowth}% 전월 대비</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">정산 예정</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatCurrency(dashboardData.expectedSettlementAmount)}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.expectedSettlementCount}명의 강사에게 정산 예정</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수수료 수익</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatCurrency(dashboardData.commissionRevenue)}</div>
            <p className="text-xs text-muted-foreground">+{dashboardData.commissionGrowth}% 전월 대비</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">매출 개요</TabsTrigger>
          <TabsTrigger value="payments">결제 내역</TabsTrigger>
          <TabsTrigger value="settlements">정산 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>월별 매출</CardTitle>
                <CardDescription>최근 6개월 간의 월별 매출 추이입니다.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(revenue: number) => `₩${revenue / 1000000}M`}
                    />
                    <Tooltip
                      labelFormatter={(label) => label}
                      formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']}
                      contentStyle={{
                        backgroundColor: "white", // 또는 원하는 색상
                        borderColor: "#ccc",
                        color: "#000", // ← 이거 중요!
                      }}
                      cursor={{fill: "rgba(0, 0, 0, 0.1)"}}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>카테고리별 매출 비중</CardTitle>
                <CardDescription>카테고리별 매출 비중을 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={categoryRevenueData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
                    <XAxis
                      type="number"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "비중"]}
                      cursor={{fill: "rgba(0, 0, 0, 0.1)"}}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>매출 요약</CardTitle>
              <CardDescription>주요 매출 지표를 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">평균 강의 가격</p>
                  <p className="text-2xl font-bold">₩{formatCurrency(dashboardData.averageCoursePrice)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">평균 구매 금액</p>
                  <p className="text-2xl font-bold">₩{formatCurrency(dashboardData.averagePurchaseAmount)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">재구매율</p>
                  <p className="text-2xl font-bold">{dashboardData.repurchaseRate}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">환불률</p>
                  <p className="text-2xl font-bold">{dashboardData.refundRate}%</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4"/>
                상세 보고서 다운로드
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>결제 내역</CardTitle>
                <CardDescription>최근 결제 내역을 확인하세요.</CardDescription>
              </div>
              <Select
                defaultValue="all"
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1); // 상태 변경 시 페이지 초기화
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="refunded">환불됨</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>결제 ID</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>강의</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>결제일</TableHead>
                    <TableHead>결제수단</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData
                    .filter(
                      (payment) =>
                        statusFilter === "all" || payment.status === statusFilter
                    )
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{payment.user}</span>
                            <span className="text-xs text-muted-foreground">{payment.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.course}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("ko-KR", {
                            style: "currency",
                            currency: "KRW",
                          }).format(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {payment.status === "completed"
                              ? "완료"
                              : payment.status === "pending"
                                ? "대기중"
                                : "환불됨"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.date).toLocaleDateString("ko-KR")}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>

              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                페이지 {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>정산 내역</CardTitle>
                <CardDescription>강사별 정산 내역을 확인하세요.</CardDescription>
              </div>
              <Select
                defaultValue="all"
                onValueChange={(val) => {
                  setSettlementStatusFilter(val);
                  setSettlementPage(1); // 필터 변경 시 페이지 초기화
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                </SelectContent>
              </Select>

            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>정산 ID</TableHead>
                    <TableHead>강사</TableHead>
                    <TableHead>강의 수</TableHead>
                    <TableHead>총 매출</TableHead>
                    <TableHead>수수료</TableHead>
                    <TableHead>정산액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>정산일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSettlements.filter(
                    (settlement) =>
                      settlementStatusFilter === "all" || settlement.status === settlementStatusFilter
                  ).map((settlement) => (
                    <TableRow key={settlement.id}>
                      <TableCell className="font-medium">{settlement.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{settlement.instructor}</span>
                          <span className="text-xs text-muted-foreground">{settlement.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{settlement.courses}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("ko-KR", {
                          style: "currency",
                          currency: "KRW",
                        }).format(settlement.totalSales)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("ko-KR", {
                          style: "currency",
                          currency: "KRW",
                        }).format(settlement.commission)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("ko-KR", {
                          style: "currency",
                          currency: "KRW",
                        }).format(settlement.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={settlement.status === "completed" ? "default" : "secondary"}>
                          {settlement.status === "completed" ? "완료" : "대기중"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(settlement.date).toLocaleDateString("ko-KR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSettlementPage((prev) => Math.max(prev - 1, 1))}
                disabled={settlementPage === 1}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                페이지 {settlementPage} / {totalSettlementPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setSettlementPage((prev) => Math.min(prev + 1, totalSettlementPages))
                }
                disabled={settlementPage === totalSettlementPages}
              >
                다음
              </Button>
            </CardFooter>

          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
