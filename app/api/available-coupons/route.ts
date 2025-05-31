import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 쿠폰 인터페이스 정의 (백엔드 DTO와 일치하도록)
interface Coupon {
  id: number;
  couponId: number;
  code: string;
  discount: number;
  courseId: number | null;
  courseName: string;
  regDate: string;
  isDel: boolean;
}

// 백엔드 서버 주소 (환경 변수 우선)
// const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://3.34.90.186:8080';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // URL에서 courseId 파라미터 추출
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { message: '강의 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`강의 ID ${courseId}에 대한 쿠폰 조회 요청 (axios 사용)`);
    console.log(`인증 헤더: ${authHeader.substring(0, 20)}...`);

    // ✅ axios를 사용해서 백엔드 호출
    const { data } = await axios.get<Coupon[]>(`${BACKEND_API_URL}/api/payment/available-coupons`, {
      params: { courseId },
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      withCredentials: true, // 쿠키 필요 시 추가
    });

    console.log(`조회된 쿠폰 수: ${data.length}`);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('쿠폰 조회 중 오류 발생:', error?.response?.data || error.message);

    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || '서버 오류가 발생했습니다.';

    return NextResponse.json(
      { message },
      { status }
    );
  }
}