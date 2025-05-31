import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 관리자 페이지 경로 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 로그인 페이지는 예외 처리
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // 쿠키에서 토큰 확인
    const token = request.cookies.get('admin-token')
    
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: '/admin/:path*'
} 