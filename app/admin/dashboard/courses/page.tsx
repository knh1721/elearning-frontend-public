"use client"

import {useEffect, useState} from "react"
import {ArrowUpDown, BookOpen, Eye, MoreHorizontal, Ticket, Trash} from "lucide-react"
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
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/user/ui/dialog";
import CourseDetailModal from "@/components/admin/CourseDetailModal";
import {useToast} from "@/components/user/ui/use-toast"
import {Label} from "@/components/user/ui/label";
import {Textarea} from "@/components/user/ui/textarea";

interface Course {
  id: number
  title: string
  instructor: string
  category: string
  price: number
  status: "PREPARING" | "ACTIVE" | "CLOSED" | "REJECT"
  students: number
  rating: number
  createdAt: string
}

export default function CoursesPage() {
  const {toast} = useToast();
  const [data, setData] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const API_URL = "/api/admin/course";

  const [isCourseDetailOpen, setIsCourseDetailOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);

  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<{
    code: string
    name: string
    value: string
    expiryDate: string
    courseId: string
  }>({
    code: "",
    name: "",
    value: "",
    expiryDate: "",
    courseId: ""
  })

  const handleCreateCoupon = async () => {
    try {
      const response = await fetch("/api/admin/addCoupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCoupon),
      });

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
        courseId: ""
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


  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<Course>({
    id: 0,
    title: "",
    instructor: "",
    category: "",
    price: 0,
    status: "PREPARING",
    students: 0,
    rating: 0,
    createdAt: ""
  });

  const columns: ColumnDef<Course>[] = [
    {
      id: "select",
      header: ({table}) => (
        <div className="w-8">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="모두 선택"
          />
        </div>
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
      accessorKey: "title",
      header: ({column}) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            강의명
            <ArrowUpDown className="ml-2 h-4 w-4"/>
          </Button>
        )
      },
      cell: ({row}) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground"/>
          <span className="font-medium">{row.getValue("title")}</span>
        </div>
      ),
    },
    {
      accessorKey: "instructor",
      header: "강사",
      cell: ({row}) => <div className="w-16">{row.getValue("instructor")}</div>,
    },
    {
      accessorKey: "category",
      header: "카테고리",
      cell: ({row}) => <div className="w-28">{row.getValue("category")}</div>,
    },
    {
      accessorKey: "price",
      header: ({column}) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            가격
            <ArrowUpDown className="ml-2 h-4 w-4"/>
          </Button>
        )
      },
      cell: ({row}) => {
        const amount = Number.parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("ko-KR", {
          style: "currency",
          currency: "KRW",
        }).format(amount)

        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: "상태",
      cell: ({row}) => {
        const status = row.getValue("status") as "PREPARING" | "ACTIVE" | "CLOSED" | "REJECT"

        let badgeVariant: "default" | "outline" | "secondary" | "destructive"
        let statusText: string
        let cName: string

        switch (status) {
          case "ACTIVE":
            badgeVariant = "default"
            statusText = "활성"
            cName = "w-12"
            break
          case "PREPARING":
            badgeVariant = "secondary"
            statusText = "준비중"
            cName = "w-14"
            break
          case "CLOSED":
            badgeVariant = "destructive"
            statusText = "종료"
            cName = "w-12"
            break
          case "REJECT":
            badgeVariant = "outline"
            statusText = "거부됨"
            cName = "w-14"
            break
          default:
            badgeVariant = "outline"
            statusText = status
            cName = ""
        }

        return <Badge variant={badgeVariant} className={`${cName} justify-center`}>{statusText}</Badge>
      },
    },
    {
      accessorKey: "students",
      header: ({column}) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            수강생
            <ArrowUpDown className="ml-2 h-4 w-4"/>
          </Button>
        )
      },
      cell: ({row}) => <div className="text-center">{row.getValue("students")}</div>,
    },
    {
      accessorKey: "rating",
      header: ({column}) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            평점
            <ArrowUpDown className="ml-2 h-4 w-4"/>
          </Button>
        )
      },
      cell: ({row}) => {
        const rating = Number.parseFloat(row.getValue("rating"))
        return <div className="text-center">{rating > 0 ? rating.toFixed(1) : "-"}</div>
      },
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: ({row}) => {
        const date = new Date(row.getValue("createdAt"))
        return <div className="w-24">{date.toLocaleDateString("ko-KR")}</div>
      },
    },
    {
      id: "actions",
      cell: ({row}) => {
        const course = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(course.id))}>ID
                복사</DropdownMenuItem>
              <DropdownMenuSeparator/>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCourse(course.id);
                  setIsCourseDetailOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4"/>
                강의 상세 보기
              </DropdownMenuItem>

              {course.status === "ACTIVE" && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCourses(course);
                    setIsCreateCouponOpen(true); // 모달 오픈
                    setNewCoupon((prev) => ({
                      ...prev,
                      courseId: selectedCourses.id.toString(),
                    }));
                  }}
                >
                  <Ticket className="mr-2 h-4 w-4"/>
                  쿠폰 생성
                </DropdownMenuItem>
              )}


              {/*<DropdownMenuItem>
                <FileEdit className="mr-2 h-4 w-4"/>
                강의 수정
              </DropdownMenuItem>*/}
              <DropdownMenuSeparator/>
              <DropdownMenuItem className="text-destructive" onClick={() => {
                setSelectedCourses(course);
                setIsSuspendDialogOpen(true)
              }
              }>
                <Trash className="mr-2 h-4 w-4"/>
                강의 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  })

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_URL)
      console.log(response)
      setData(response.data.data)
    } catch (err) {
      setError("강의 목록을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses().then(() => {
    })
  }, [])
  if (loading) return <div>불러오는 중...</div>
  if (error) return <div>{error}</div>

  const handleSuspendUser = async () => {
    if (!selectedCourses) return;

    try {
      const response = await fetch(`/api/admin/delCourse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourses.id,
          reason: suspensionReason,
        }),
      });

      if (response.ok) {
        console.log("강의를 성공적으로 정지했습니다.");
        setIsSuspendDialogOpen(false);

        // 🔄 정지 처리 후 테이블 데이터 다시 로드
        await fetchCourses();
      } else {
        const errorMessage = await response.text(); // 응답이 JSON 이 아닐 수도 있으니 text 로 받아보는 게 안전
        console.error(errorMessage + " 강의 정지에 실패했습니다.");
      }
    } catch (error) {
      console.error("요청 중 오류가 발생했습니다.", error);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">강의 관리</h2>
        <p className="text-muted-foreground">플랫폼의 모든 강의를 관리하고 상태를 변경하세요.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="강의명 검색..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <Select
              onValueChange={(value) => {
                if (value === "all") {
                  table.getColumn("category")?.setFilterValue(undefined)
                } else {
                  table.getColumn("category")?.setFilterValue(value)
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="카테고리 필터"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>{/*
                <SelectItem value="프론트엔드">프론트엔드</SelectItem>
                <SelectItem value="백엔드">백엔드</SelectItem>*/}
                <SelectItem value="프론트앤드">프론트엔드</SelectItem>
                <SelectItem value="백앤드">백엔드</SelectItem>
                <SelectItem value="AI, 머신러닝">AI, 머신러닝</SelectItem>
                <SelectItem value="데이터베이스">데이터베이스</SelectItem>
                <SelectItem value="프로그래밍 언어">프로그래밍 언어</SelectItem>
                <SelectItem value="풀스택">풀스택</SelectItem>
                <SelectItem value="알고리즘, 자료구조">알고리즘, 자료구조</SelectItem>
                <SelectItem value="프로그래밍 자격증">프로그래밍 자격증</SelectItem>
                <SelectItem value="모바일 앱 개발">모바일 앱 개발</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="ACTIVE">활성</SelectItem>
                <SelectItem value="PREPARING">준비중</SelectItem>
                <SelectItem value="REJECT">거부됨</SelectItem>
                <SelectItem value="CLOSED">종료</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/*<div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4"/>
              내보내기
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4"/>
              강의 추가
            </Button>
          </div>*/}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
            {table.getFilteredSelectedRowModel().rows.length}개 선택됨 / 총 {table.getFilteredRowModel().rows.length}개
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
      </div>

      <Dialog open={isCourseDetailOpen} onOpenChange={setIsCourseDetailOpen}>
        <DialogTitle>강의 상세 정보</DialogTitle>
        <DialogContent className="sm:max-w-[800px]">
          <CourseDetailModal courseId={selectedCourse}/>
        </DialogContent>
      </Dialog>

      {/* 강의 정지 다이얼로그 */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>강의 정지</DialogTitle>
            <DialogDescription>
              {selectedCourses.title} 강의을 정지합니다. 정지 사유를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">정지 사유</Label>
              <Textarea
                id="reason"
                placeholder="강의 정지 사유를 입력하세요"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleSuspendUser} disabled={!suspensionReason.trim()}>
              강의 삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseId" className="text-right">
                적용 강의
              </Label>
              <Input
                id="courseId"
                value={selectedCourses.title}
                readOnly
                className="col-span-3 bg-muted cursor-not-allowed"
                placeholder="선택된 강의 없음"
              />
            </div>

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
    </div>
  )
}
