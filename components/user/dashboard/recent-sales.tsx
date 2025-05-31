interface RecentSaleDTO {
  courseTitle: string;
  purchaserId: number;
  purchaserName: string;
  profileImg: string;
  price: number;
  purchasedAt: string; // 예: "3시간 전"
}

interface RecentSalesProps {
  recentSales: RecentSaleDTO[];
}

const colors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-gray-500'
];

const getColorById = (id: number) => {
  const colorIndex = id % colors.length;  // user.id를 색상 배열의 인덱스로 변환
  return colors[colorIndex]; // 해당 색상 반환
};

export function RecentSales({recentSales}: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {recentSales.map((sale, index) => (
        <div key={index} className="flex items-center">
          {/* 프로필 이미지가 있으면 이미지 사용, 없으면 원형 배경색 사용 */}
          {sale.profileImg ? (
            <img
              src={sale.profileImg}
              alt={sale.purchaserName}
              className="w-9 h-9 rounded-full ring-2 ring-gray-800 object-cover"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${getColorById(sale.purchaserId)} ring-2 ring-gray-800`}
            >
              <span className="text-white text-xs font-semibold">
                {sale.purchaserName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.purchaserName}</p>
            <p className="text-sm text-muted-foreground">{sale.courseTitle}</p>
          </div>
          <div className="ml-auto font-medium">+₩{sale.price.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
