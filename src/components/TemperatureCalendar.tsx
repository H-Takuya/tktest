"use client";

import { useMemo } from "react";
import { DayWeather } from "@/hooks/useWeatherData";

interface Props {
  year: number;
  month: number;
  days: Record<string, DayWeather>;
  loading: boolean;
  compareYear?: number;
  compareDays?: Record<string, DayWeather>;
  compareLoading?: boolean;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function getWeatherEmoji(code: number | null): string {
  if (code === null) return "";
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

function getTempColor(temp: number | null): string {
  if (temp === null) return "";
  if (temp <= 0) return "text-blue-800 font-bold";
  if (temp <= 5) return "text-blue-600 font-semibold";
  if (temp <= 10) return "text-cyan-600";
  if (temp <= 15) return "text-teal-600";
  if (temp <= 20) return "text-green-600";
  if (temp <= 25) return "text-yellow-600";
  if (temp <= 30) return "text-orange-500";
  if (temp <= 35) return "text-red-500 font-semibold";
  return "text-red-700 font-bold";
}

function getTempBg(tempMean: number | null): string {
  if (tempMean === null) return "";
  if (tempMean <= 0) return "bg-blue-50";
  if (tempMean <= 5) return "bg-blue-50";
  if (tempMean <= 10) return "bg-cyan-50";
  if (tempMean <= 15) return "bg-teal-50";
  if (tempMean <= 20) return "bg-green-50";
  if (tempMean <= 25) return "bg-yellow-50";
  if (tempMean <= 30) return "bg-orange-50";
  return "bg-red-50";
}

export function TemperatureCalendar({
  year,
  month,
  days,
  loading,
  compareYear,
  compareDays,
  compareLoading,
}: Props) {
  const isCompare = compareYear !== undefined;

  const cells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();
    const result: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= lastDate; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [year, month]);

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  const fmt = (n: number | null) =>
    n === null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(1)}°`;

  const fmtCmp = (n: number | null) =>
    n === null ? "—" : `${Math.round(n)}°`;

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs font-semibold py-1 ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-600"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (d === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const mm = String(month).padStart(2, "0");
          const dd = String(d).padStart(2, "0");
          const dateStr = `${year}-${mm}-${dd}`;
          const weather = days[dateStr];
          const col = i % 7;
          const dayColor =
            col === 0 ? "text-red-500" : col === 6 ? "text-blue-500" : "text-gray-700";

          const compareDateStr = compareYear ? `${compareYear}-${mm}-${dd}` : null;
          const compareWeather = compareDateStr ? compareDays?.[compareDateStr] : undefined;

          return (
            <div
              key={dateStr}
              className={`rounded-lg border p-1 flex flex-col items-center transition-all
                ${isCompare ? "min-h-[72px] sm:min-h-[80px]" : "min-h-[64px] sm:min-h-[72px]"}
                ${isToday(d) ? "border-blue-400 ring-2 ring-blue-300" : "border-gray-100"}
                ${weather ? getTempBg(weather.tempMean) : "bg-white"}
                ${loading ? "opacity-50" : ""}
              `}
            >
              <div className="flex items-center gap-0.5 mb-1">
                <span className={`text-xs font-bold leading-none ${dayColor}`}>{d}</span>
                {!isCompare && weather && (
                  <span className="text-[10px] leading-none">
                    {getWeatherEmoji(weather.weatherCode)}
                  </span>
                )}
              </div>

              {isCompare ? (
                <div className="grid grid-cols-2 gap-0 w-full">
                  {/* 主年列 */}
                  <div className="flex flex-col items-center border-r border-gray-100 pr-0.5">
                    <span className="text-[7px] leading-none text-blue-400 mb-0.5">
                      &apos;{String(year).slice(2)}
                    </span>
                    {weather ? (
                      <>
                        <span className={`text-[10px] leading-tight ${getTempColor(weather.tempMax)}`}>
                          {fmtCmp(weather.tempMax)}
                        </span>
                        <span className={`text-[10px] leading-tight ${getTempColor(weather.tempMin)}`}>
                          {fmtCmp(weather.tempMin)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-300 text-[9px]">{loading ? "…" : "—"}</span>
                    )}
                  </div>
                  {/* 比較年列 */}
                  <div className="flex flex-col items-center pl-0.5">
                    <span className="text-[7px] leading-none text-orange-400 mb-0.5">
                      &apos;{String(compareYear).slice(2)}
                    </span>
                    {compareWeather ? (
                      <>
                        <span className={`text-[10px] leading-tight ${getTempColor(compareWeather.tempMax)}`}>
                          {fmtCmp(compareWeather.tempMax)}
                        </span>
                        <span className={`text-[10px] leading-tight ${getTempColor(compareWeather.tempMin)}`}>
                          {fmtCmp(compareWeather.tempMin)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-300 text-[9px]">{compareLoading ? "…" : "—"}</span>
                    )}
                  </div>
                </div>
              ) : weather ? (
                <div className="flex flex-col items-center gap-0 text-center">
                  <span className={`text-xs leading-tight ${getTempColor(weather.tempMax)}`}>
                    {fmt(weather.tempMax)}
                  </span>
                  <span className={`text-xs leading-tight ${getTempColor(weather.tempMin)}`}>
                    {fmt(weather.tempMin)}
                  </span>
                </div>
              ) : loading ? (
                <span className="text-gray-300 text-xs mt-1">…</span>
              ) : (
                <span className="text-gray-200 text-xs mt-1">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
