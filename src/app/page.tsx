"use client";

import { useState } from "react";
import { YearMonthNav } from "@/components/YearMonthNav";
import { TemperatureCalendar } from "@/components/TemperatureCalendar";
import { useWeatherData } from "@/hooks/useWeatherData";

export default function Home() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { days, loading, error } = useWeatherData(year, month);

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            埼玉県川口市 気温カレンダー
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            データ提供: Open-Meteo（気象庁準拠データ）
          </p>
        </div>

        {/* ナビゲーション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <YearMonthNav
            year={year}
            month={month}
            onYearChange={setYear}
            onMonthChange={setMonth}
          />
        </div>

        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-lg font-semibold text-gray-700">
            {year}年 {month}月
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1" />
              最高気温
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />
              最低気温
            </span>
          </div>
        </div>

        {/* カレンダー本体 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          {error ? (
            <div className="text-center py-8 text-red-500 text-sm">{error}</div>
          ) : (
            <TemperatureCalendar
              year={year}
              month={month}
              days={days}
              loading={loading}
            />
          )}
        </div>

        {/* 凡例 */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">気温の目安</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { label: "0°以下", color: "text-blue-800 font-bold" },
              { label: "〜5°", color: "text-blue-600 font-semibold" },
              { label: "〜10°", color: "text-cyan-600" },
              { label: "〜15°", color: "text-teal-600" },
              { label: "〜20°", color: "text-green-600" },
              { label: "〜25°", color: "text-yellow-600" },
              { label: "〜30°", color: "text-orange-500" },
              { label: "〜35°", color: "text-red-500 font-semibold" },
              { label: "35°超", color: "text-red-700 font-bold" },
            ].map(({ label, color }) => (
              <span key={label} className={`px-2 py-0.5 bg-gray-50 rounded ${color}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
