"use client";

import { useState, useEffect } from "react";
import { YearMonthNav } from "@/components/YearMonthNav";
import { TemperatureCalendar } from "@/components/TemperatureCalendar";
import { useWeatherData } from "@/hooks/useWeatherData";

const CURRENT_YEAR = new Date().getFullYear();
const ALL_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const LOCATIONS = [
  { id: "kawaguchi", label: "埼玉県川口市", lat: 35.8082, lon: 139.724 },
  { id: "tsukuba", label: "筑波サーキット周辺", lat: 36.175, lon: 140.073 },
] as const;

type LocationId = (typeof LOCATIONS)[number]["id"];

function loadSettings() {
  try {
    const raw = localStorage.getItem("temp_calendar_settings");
    if (!raw) return null;
    return JSON.parse(raw) as {
      year: number;
      month: number;
      locationId: LocationId;
      compareMode: boolean;
      compareYear: number;
    };
  } catch {
    return null;
  }
}

function saveSettings(s: {
  year: number;
  month: number;
  locationId: LocationId;
  compareMode: boolean;
  compareYear: number;
}) {
  try {
    localStorage.setItem("temp_calendar_settings", JSON.stringify(s));
  } catch {}
}

export default function Home() {
  const now = new Date();
  const saved = typeof window !== "undefined" ? loadSettings() : null;

  const [year, setYear] = useState(saved?.year ?? now.getFullYear());
  const [month, setMonth] = useState(saved?.month ?? now.getMonth() + 1);
  const [locationId, setLocationId] = useState<LocationId>(saved?.locationId ?? "kawaguchi");
  const [compareMode, setCompareMode] = useState(saved?.compareMode ?? false);
  const [compareYear, setCompareYear] = useState(saved?.compareYear ?? now.getFullYear() - 1);

  const location = LOCATIONS.find((l) => l.id === locationId) ?? LOCATIONS[0];

  // 設定変更のたびにlocalStorageへ保存
  useEffect(() => {
    saveSettings({ year, month, locationId, compareMode, compareYear });
  }, [year, month, locationId, compareMode, compareYear]);

  const { days, loading, error } = useWeatherData(year, month, location.lat, location.lon);
  const {
    days: compareDays,
    loading: compareLoading,
  } = useWeatherData(compareMode ? compareYear : null, month, location.lat, location.lon);

  const compareYearOptions = ALL_YEARS.filter((y) => y !== year);

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {location.label} 気温カレンダー
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            データ提供: Open-Meteo（気象庁準拠データ）
          </p>
        </div>

        {/* ナビゲーション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          {/* 地域選択 */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">地域</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value as LocationId)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>

          <YearMonthNav
            year={year}
            month={month}
            onYearChange={setYear}
            onMonthChange={setMonth}
          />

          {/* 比較年コントロール */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                compareMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              比較
            </button>
            {compareMode && (
              <select
                value={compareYear}
                onChange={(e) => setCompareYear(Number(e.target.value))}
                className="px-3 py-1 rounded-lg border border-orange-200 text-sm font-semibold text-orange-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {compareYearOptions.map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-lg font-semibold text-gray-700">
            {compareMode ? (
              <>
                <span className="text-blue-600">{year}年</span>
                <span className="text-gray-400 mx-1 text-base">vs</span>
                <span className="text-orange-500">{compareYear}年</span>
                <span className="text-gray-500 ml-1">{month}月</span>
              </>
            ) : (
              `${year}年 ${month}月`
            )}
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1" />
              最高
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />
              最低
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
              compareYear={compareMode ? compareYear : undefined}
              compareDays={compareMode ? compareDays : undefined}
              compareLoading={compareLoading}
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
