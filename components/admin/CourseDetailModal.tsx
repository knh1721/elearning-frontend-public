// CourseDetailModal.tsx
import {useEffect, useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/user/ui/avatar";
import {Badge} from "@/components/user/ui/badge";
import {FileText} from "lucide-react";

interface CourseInfoDTO {
  id: number;
  title: string;
  description: string;
  instructor: string;
  instructorId: number;
  price: number;
  rating: number;
  students: number;
  totalLectures: number;
  totalHours: number;
  level: string;
  lastUpdated: string;
  image: string;
  curriculum: CourseSectionDTO[];
}

interface CourseSectionDTO {
  id: number;
  title: string;
  lectures: LectureVideoDTO[];
}

interface LectureVideoDTO {
  id: number;
  title: string;
  duration: number;
  free: boolean;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const hStr = hours > 0 ? `${String(hours).padStart(2, '0')}:` : '';
  return `${hStr}${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function formatDurationFromMinutes(minutes: number): string {
  const totalMinutes = Math.floor(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return `${hours}시간 ${remainingMinutes}분`;
}

export default function CourseDetailModal({courseId}: { courseId: number }) {
  const [course, setCourse] = useState<CourseInfoDTO>({
    id: 0,
    title: "",
    description: "",
    instructor: "",
    instructorId: 0,
    price: 0,
    rating: 0,
    students: 0,
    totalLectures: 0,
    totalHours: 0,
    level: "",
    lastUpdated: "",
    image: "/placeholder.svg?height=400&width=800",
    curriculum: [], // CourseSectionDTO 배열
  });

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/admin/course/${courseId}`);
        const data = await res.json();
        console.log(data)
        setCourse(data.data);
      } finally {
      }
    }

    fetchCourse().then(() => {
    });
  }, [courseId]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-start gap-4">
        <div className="rounded-md bg-muted h-40 w-64 flex items-center justify-center overflow-hidden">
          <img
            src={course.image || "/placeholder.svg?height=400&width=800"}
            alt={course.title}
            className="object-cover w-full h-full"
          />

        </div>
        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-semibold">{course.title}</h3>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={`/abstract-geometric-shapes.png?height=24&width=24&query=${course.instructor}`}
                alt={course.instructor}
              />
              <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{course.instructor}</span>
          </div>
          <Badge variant="outline" className="mt-1">
            {course.level}
          </Badge>
          <div className="text-sm font-medium">
            {new Intl.NumberFormat("ko-KR", {
              style: "currency",
              currency: "KRW",
            }).format(course.price)}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">강의 설명</h4>
        <p className="text-sm text-muted-foreground">{course.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">섹션 수</h4>
          <p className="text-2xl font-bold">{course.curriculum.length}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">강의 수</h4>
          <p className="text-2xl font-bold">
            {course.curriculum.reduce((total, sec) => total + sec.lectures.length, 0)}
          </p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">총 시간</h4>
          <p className="text-2xl font-bold">{formatDurationFromMinutes(course.totalHours)}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">커리큘럼</h4>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {course.curriculum.map((section, sectionIndex) => {
            const totalDuration = section.lectures.reduce((sum, l) => sum + l.duration, 0)
            return (
              <div className="space-y-2" key={section.id}>
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">
                    {sectionIndex + 1}. {section.title}
                  </h5>
                  <span className="text-xs text-muted-foreground">
                    {section.lectures.length}개 강의 · {formatDuration(totalDuration)}
                  </span>
                </div>
                <div className="space-y-1 pl-4">
                  {section.lectures.map((lecture, lectureIndex) => (
                    <div
                      className="text-sm flex items-center gap-2"
                      key={lecture.id}
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground"/>
                      <span>
                        {sectionIndex + 1}.{lectureIndex + 1} {lecture.title}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDuration(lecture.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
