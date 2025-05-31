"use client"

import {useEffect, useState} from "react"
import {ArrowUpDown, Copy, Download, MoreHorizontal, Plus, Send, Trash} from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"

import {Button} from "@/components/user/ui/button"
import {Checkbox} from "@/components/user/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/user/ui/dropdown-menu"
import {Input} from "@/components/user/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/user/ui/table"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/user/ui/select"
import {Badge} from "@/components/user/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/user/ui/dialog"
import {Label} from "@/components/user/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/user/ui/tabs"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/user/ui/card"
import {useToast} from "@/components/user/ui/use-toast"
import {ScrollArea} from "@/components/user/ui/scroll-area"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/user/ui/avatar"
import {RadioGroup, RadioGroupItem} from "@/components/user/ui/radio-group"
import axios from "axios";

type Coupon = {
  id: string
  code: string
  name: string
  value: number
  courseId: string | null
  courseName: string | null
  expiryDate: string
  status: "active" | "expired"
  createdAt: string
}

type User = {
  id: number
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "suspended"
}

const API_URL = "/api/admin";

export default function CouponsPage() {
  const {toast} = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState("");


  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: "1",
      code: "WELCOME20",
      name: "coupon_1",
      value: 20,
      courseId: null,
      courseName: null,
      expiryDate: "2023-12-31",
      status: "active",
      createdAt: "2023-06-01",
    },
  ])

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "김민수",
      email: "kim@example.com",
      role: "학생",
      status: "active",
    },
  ])


  // 모달 상태 관리
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false)
  /*const [isDistributeCouponOpen, setIsDistributeCouponOpen] = useState(false)*/
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [isDeleteCouponOpen, setIsDeleteCouponOpen] = useState(false)

  // 쿠폰 생성 상태
  const [newCoupon, setNewCoupon] = useState<{
    code: string
    name: string
    value: string
    expiryDate: string
  }>({
    code: "",
    name: "",
    value: "",
    expiryDate: "",
  })

  // 쿠폰 배포 상태
  const [distributionMethod, setDistributionMethod] = useState<"all" | "selected">("selected")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [distributionMessage, setDistributionMessage] = useState("")

  const handleCreateCoupon = async () => {
    try {
      const response = await fetch("/api/admin/addCoupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCoupon),
      });
      await fetchCoupons()

      const result = await response.json();
      console.log(result)

      toast({
        title: "쿠폰 생성 완료",
        description: `${newCoupon.code} 쿠폰이 성공적으로 생성되었습니다.`,
      });

      // 폼 초기화 및 팝업 닫기
      setNewCoupon({
        code: "",
        name: "",
        value: "",
        expiryDate: "",
      });
      setIsCreateCouponOpen(false);
    } catch (error) {
      toast({
        title: "쿠폰 생성 실패",
        description: "다시 시도해 주세요.",
      });
      console.error("Error creating coupon:", error);
    }
  };

  const handleDistributeCoupon = async () => {
    if (!selectedCoupon) {
      console.log("선택 오류")
      return;
    }

    const payload = {
      couponId: selectedCoupon.id,
      userIds: distributionMethod === "all" ? [0] : selectedUsers,
      message: distributionMessage,
    };

    try {
      const response = await fetch("/api/admin/Distribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("쿠폰 배포에 실패했습니다.");
      }

      const userCount = distributionMethod === "all" ? users.length : selectedUsers.length;
      toast({
        title: "쿠폰 배포 완료",
        description: `${selectedCoupon.code} 쿠폰이 ${userCount}명의 사용자에게 배포되었습니다.`,
      });

      // 상태 초기화
      setDistributionMethod("selected");
      setSelectedUsers([]);
      setDistributionMessage("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: error.message || "알 수 없는 오류가 발생했습니다.",
      });
    }
  };


  const handleDeleteCoupon = () => {
    // 실제 구현에서는 API 호출을 통해 쿠폰 삭제
    toast({
      title: "쿠폰 삭제 완료",
      description: `${selectedCoupon?.code} 쿠폰이 삭제되었습니다.`,
    })
    setIsDeleteCouponOpen(false)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
    });
    toast({
      title: "쿠폰 코드 복사됨",
      description: `${code} 코드가 클립보드에 복사되었습니다.`,
    })
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const columns: ColumnDef<Coupon>[] = [
    {
      id: "select",
      header: ({table}) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="모두 선택"
        />
      ),
      cell: ({row}) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="행 선택"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: "쿠폰 코드",
      cell: ({row}) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("code")}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyCode(row.getValue("code"))}>
            <Copy className="h-3.5 w-3.5"/>
            <span className="sr-only">코드 복사</span>
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "이름",
      cell: ({row}) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {row.getValue("name") ? row.getValue("name") : "[이름없음]"}
          </span>
        </div>

      ),
    },
    {
      accessorKey: "value",
      header: "할인 값",
      cell: ({row}) => {
        const value = row.getValue("value") as number
        return (
          <div>{
            new Intl.NumberFormat("ko-KR", {
              style: "currency",
              currency: "KRW",
            }).format(value)}
          </div>
        )
      },
    },
    {
      accessorKey: "courseName",
      header: "적용 강의",
      cell: ({row}) => {
        const courseName = row.getValue("courseName") as string | undefined
        return <div>{courseName || "모든 강의"}</div>
      },
    },
    {
      accessorKey: "expiryDate",
      header: ({column}) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            만료일
            <ArrowUpDown className="ml-2 h-4 w-4"/>
          </Button>
        )
      },
      cell: ({row}) => {
        const date = new Date(row.getValue("expiryDate"))
        return <div>{date.toLocaleDateString("ko-KR")}</div>
      },
    },
    {
      accessorKey: "status",
      header: "상태",
      cell: ({row}) => {
        const status = row.getValue("status") as "active" | "expired" | "used"
        return (
          <Badge variant={status === "active" ? "default" : status === "expired" ? "secondary" : "outline"}>
            {status === "active" ? "활성" : status === "expired" ? "만료됨" : "사용됨"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({row}) => {
        const coupon = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>작업</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleCopyCode(coupon.code)}>코드 복사</DropdownMenuItem>
              <DropdownMenuSeparator/>
              {/*<DropdownMenuItem
                onClick={() => {
                  setSelectedCoupon(coupon)
                  setIsDistributeCouponOpen(true)
                }}
                disabled={coupon.status !== "active"}
              >
                쿠폰 배포
              </DropdownMenuItem>*/}
              <DropdownMenuSeparator/>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setSelectedCoupon(coupon)
                  setIsDeleteCouponOpen(true)
                }}
              >
                쿠폰 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: coupons,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/coupon`);
      const result = response.data.data;
      console.log(result)

      if (result) {
        setCoupons(result.coupons);
        setUsers(result.userCoupons);
      }
    } catch (err) {
      setError("쿠폰 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons().then(() => {
    }); // 컴포넌트 마운트 시 API 호출
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">쿠폰 관리</h2>
        <p className="text-muted-foreground">쿠폰을 생성하고 사용자에게 배포하세요.</p>
      </div>

      <Tabs defaultValue="coupons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coupons">쿠폰 목록</TabsTrigger>
          <TabsTrigger value="distribution">쿠폰 배포</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="쿠폰 코드 검색..."
                value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("code")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <Select
                onValueChange={(value) => {
                  if (value === "all") {
                    table.getColumn("status")?.setFilterValue(undefined)
                  } else {
                    table.getColumn("status")?.setFilterValue(value)
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="expired">만료됨</SelectItem>
                  <SelectItem value="used">사용됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4"/>
                내보내기
              </Button>
              <Button onClick={() => setIsCreateCouponOpen(true)}>
                <Plus className="mr-2 h-4 w-4"/>
                쿠폰 생성
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length}개 선택됨 / 총 {table.getFilteredRowModel().rows.length}
              개
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                이전
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                다음
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>쿠폰 배포</CardTitle>
              <CardDescription>사용자에게 쿠폰을 배포합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>배포할 쿠폰 선택</Label>
                <Select
                  onValueChange={(value) => {
                    const selected = coupons.find((coupon) => coupon.id === value);
                    if (selected) {
                      setSelectedCoupon(selected);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="쿠폰 선택"/>
                  </SelectTrigger>
                  <SelectContent>
                    {coupons
                      .filter((coupon) => coupon.status === "active")
                      .map((coupon) => (
                        <SelectItem key={coupon.id} value={coupon.id}>
                          {coupon.code} - {coupon.name === "percentage" ? `${coupon.value}%` : `${coupon.value}원`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

              </div>

              <div className="space-y-2">
                <Label>배포 방식</Label>
                <RadioGroup
                  value={distributionMethod}
                  onValueChange={(value: "all" | "selected") => setDistributionMethod(value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected" id="selected"/>
                    <Label htmlFor="selected">선택한 사용자에게 배포</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all"/>
                    <Label htmlFor="all">모든 사용자에게 배포</Label>
                  </div>
                </RadioGroup>
              </div>

              {distributionMethod === "selected" && (
                <div className="space-y-2">
                  <Label>사용자 목록</Label>
                  <Input
                    type="text"
                    placeholder="사용자 이름 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  <div className="h-[300px] rounded-md border">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-2">
                        {filteredUsers.map((user) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`/abstract-geometric-shapes.png?height=32&width=32&query=${user.name}`}
                                  alt={user.name}
                                />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <Label htmlFor={`user-${user.id}`} className="font-medium">
                                  {user.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <Badge
                              variant={user.status === "active" ? "default" : "secondary"}
                              className="ml-auto"
                            >
                              {user.status === "active" ? "활성" : "비활성"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dist-message">배포 메시지 (선택사항)</Label>
                <Input
                  id="dist-message"
                  placeholder="쿠폰 배포와 함께 전송할 메시지를 입력하세요"
                  value={distributionMessage}
                  onChange={(e) => setDistributionMessage(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">취소</Button>
              <Button
                onClick={handleDistributeCoupon}
                disabled={!selectedCoupon || (distributionMethod === "selected" && selectedUsers.length === 0)}
              >
                <Send className="mr-2 h-4 w-4"/>
                쿠폰 배포
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 쿠폰 생성 모달 */}
      <Dialog open={isCreateCouponOpen} onOpenChange={setIsCreateCouponOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>쿠폰 생성</DialogTitle>
            <DialogDescription>새로운 쿠폰을 생성합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                쿠폰 코드
              </Label>
              <Input
                id="code"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})}
                className="col-span-3"
                placeholder="예: SUMMER30"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                쿠폰 이름
              </Label>
              <Input
                id="name"
                value={newCoupon.name}
                onChange={(e) => setNewCoupon({...newCoupon, name: e.target.value})}
                className="col-span-3"
                placeholder="예: 여름할인쿠폰"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                할인 값
              </Label>
              <Input
                id="value"
                type="number"
                value={newCoupon.value}
                onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                className="col-span-3"
                placeholder={"예: 50000"}
              />
            </div>
            {/*<div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseId" className="text-right">
                적용 강의
              </Label>
              <Select
                value={newCoupon.courseId}
                onValueChange={(value) => setNewCoupon({...newCoupon, courseId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="강의 선택 (선택사항)"/>
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="all">모든 강의</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>*/}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">
                만료일
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={newCoupon.expiryDate}
                onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                className="col-span-3"
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateCouponOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateCoupon}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 쿠폰 배포 모달 */}
      {/*<Dialog open={isDistributeCouponOpen} onOpenChange={setIsDistributeCouponOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>쿠폰 배포</DialogTitle>
            <DialogDescription>{selectedCoupon?.code} 쿠폰을 사용자에게 배포합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>배포 방식</Label>
              <RadioGroup
                value={distributionMethod}
                onValueChange={(value: "all" | "selected") => setDistributionMethod(value)}
                className="flex flex-col space-y-1"
              >
                <RadioGroupItem value="selected" id="r-selected"/>
                <Label htmlFor="r-selected">선택한 사용자에게 배포</Label>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="r-all"/>
                  <Label htmlFor="r-all">모든 사용자에게 배포</Label>
                </div>
              </RadioGroup>
            </div>

            {distributionMethod === "selected" && (
              <div className="space-y-2">
                <Label>사용자 선택</Label>
                <div className="h-[200px] rounded-md border">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dist-user-${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/abstract-geometric-shapes.png?height=32&width=32&query=${user.name}`}
                                alt={user.name}
                              />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <Label htmlFor={`dist-user-${user.id}`} className="font-medium">
                                {user.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dist-message">배포 메시지 (선택사항)</Label>
              <Input
                id="dist-message"
                placeholder="쿠폰 배포와 함께 전송할 메시지를 입력하세요"
                value={distributionMessage}
                onChange={(e) => setDistributionMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDistributeCouponOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleDistributeCoupon}
              disabled={distributionMethod === "selected" && selectedUsers.length === 0}
            >
              <Send className="mr-2 h-4 w-4"/>
              쿠폰 배포
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>*/}

      {/* 쿠폰 삭제 다이얼로그 */}
      <Dialog open={isDeleteCouponOpen} onOpenChange={setIsDeleteCouponOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>쿠폰 삭제</DialogTitle>
            <DialogDescription>
              {selectedCoupon?.code} 쿠폰을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCouponOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteCoupon}>
              <Trash className="mr-2 h-4 w-4"/>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
