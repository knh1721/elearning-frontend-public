import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

interface MonthlyRevenueDTO {
  month: string; // 예: "2025-04"
  revenue: number; // BigDecimal 이지만 프론트에서는 number 로
}

interface OverviewProps {
  monthlyRevenueOverview: MonthlyRevenueDTO[];
}

export function Overview({monthlyRevenueOverview}: OverviewProps) {
  // 월별 매출 데이터를 ReChart 의 형식에 맞게 변환
  const formatMonthlyRevenueData = (monthlyRevenueOverview: MonthlyRevenueDTO[]) => {
    return monthlyRevenueOverview.map((data) => {
      const month = String(data.month); // 숫자일 경우 문자열로 변환
      const [year, monthNum] = month.split('-');
      return {
        name: `${year}-${monthNum}`, // 예: "2025-04"
        total: data.revenue, // 매출
      };
    });
  };

  const monthlyRevenueData = formatMonthlyRevenueData(monthlyRevenueOverview);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={monthlyRevenueData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₩${value / 1000000}M`}
        />
        {/* 툴팁 추가 */}
        <Tooltip
          content={({payload}) => {
            if (payload && payload.length > 0) {
              const value = payload[0].value
              const {name} = payload[0].payload;

              if (!name) {
                return null; // name 값이 없으면 툴팁 표시하지 않음
              }

              // payload 의 name 을 제대로 분리하고 처리하기
              const [year, month] = String(name).split('-'); // 문자열로 변환하고 split
              const date = `${year}년 ${month}월`;  // 년도와 월을 분리한 후

              return (
                <div className="custom-tooltip p-2 bg-white rounded-lg shadow-lg">
                  <p className="font-bold text-sm text-gray-700">{date}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₩{value?.toLocaleString()}
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={{fill: "rgba(0, 0, 0, 0.1)"}}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary"/>
      </BarChart>
    </ResponsiveContainer>

  );
}
