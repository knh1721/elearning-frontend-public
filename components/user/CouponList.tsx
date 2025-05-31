import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/user/ui/card';
import useUserStore from '@/app/auth/userStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/user/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/user/ui/tabs';

interface Coupon {
  id: number;
  couponId: number;
  code: string;
  discount: number;
  courseId: number | null;
  courseName: string;
  regDate: string;
  expiryDate: string | null;
  isDel: boolean;
}

export default function CouponList() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!accessToken) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        router.push('/auth/user/login');
        return;
      }

      try {
        console.log('Fetching coupons...');
        const response = await axios.get('/api/user/coupons', {
          withCredentials: true
        });
        
        console.log('Coupons response:', response.data);
        if (response.data) {
          setCoupons(response.data);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
            router.push('/auth/user/login');
          } else {
            const errorMessage = error.response?.data?.message || error.response?.data || '쿠폰 정보를 가져오는데 실패했습니다.';
            setError(errorMessage);
          }
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [accessToken, router]);

  // 사용 가능한 쿠폰과 사용한 쿠폰 분리
  const availableCoupons = coupons.filter(coupon => !coupon.isDel);
  const usedCoupons = coupons.filter(coupon => coupon.isDel);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">보유한 쿠폰</h2>
        <p className="text-sm text-gray-500">총 {coupons.length}개 ({availableCoupons.length}개 사용 가능)</p>
      </div>
      
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="available">사용 가능한 쿠폰 ({availableCoupons.length})</TabsTrigger>
          <TabsTrigger value="used">사용한 쿠폰 ({usedCoupons.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          {availableCoupons.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-2">사용 가능한 쿠폰이 없습니다.</p>
              <p className="text-sm text-gray-400">강의 구매 시 사용할 수 있는 쿠폰이 발급되면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableCoupons.map((coupon) => (
                <Card key={coupon.id} className="border-2 border-primary">
                  <CardContent className="p-5">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{coupon.code}</h3>
                          <div className="mt-1">
                            <Badge variant="default" className="text-xs">
                              사용 가능
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{coupon.discount}%</p>
                          <p className="text-xs text-gray-500">할인</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="border-t border-gray-100 pt-3 mt-3">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">적용 강의:</span> {coupon.courseName || '전체 강의'}
                          </p>
                          {coupon.expiryDate && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">유효기간:</span> {format(new Date(coupon.expiryDate), 'yyyy년 MM월 dd일', { locale: ko })}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            발급일: {format(new Date(coupon.regDate), 'yyyy년 MM월 dd일', { locale: ko })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="used">
          {usedCoupons.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-2">사용한 쿠폰이 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {usedCoupons.map((coupon) => (
                <Card key={coupon.id} className="border-2 border-gray-200 opacity-70">
                  <CardContent className="p-5">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{coupon.code}</h3>
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                              사용됨
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-500">{coupon.discount}%</p>
                          <p className="text-xs text-gray-500">할인</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="border-t border-gray-100 pt-3 mt-3">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">적용 강의:</span> {coupon.courseName || '전체 강의'}
                          </p>
                          {coupon.expiryDate && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">유효기간:</span> {format(new Date(coupon.expiryDate), 'yyyy년 MM월 dd일', { locale: ko })}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            발급일: {format(new Date(coupon.regDate), 'yyyy년 MM월 dd일', { locale: ko })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
