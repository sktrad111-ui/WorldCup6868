import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const teamNameMap: Record<string, string> = {
  France: "法国",
  Senegal: "塞内加尔",
  Iraq: "伊拉克",
  Norway: "挪威",
  Argentina: "阿根廷",
  Algeria: "阿尔及利亚",
  Brazil: "巴西",
  Germany: "德国",
  Spain: "西班牙",
  Portugal: "葡萄牙",
  England: "英格兰",
  Mexico: "墨西哥",
  "South Africa": "南非",
  Canada: "加拿大",
  "United States": "美国",
  Japan: "日本",
  Korea: "韩国",
};

function cnTeam(name?: string) {
  return name || "TBD";
}

function cnStatus(status: string) {
  if (status === "SCHEDULED" || status === "TIMED") return "未开始";
  if (status === "LIVE" || status === "IN_PLAY" || status === "PAUSED") return "进行中";
  if (status === "FINISHED") return "已结束";
  if (status === "POSTPONED") return "延期";
  if (status === "CANCELLED") return "取消";
  return status;
}

function formatEDT(utcDate: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(utcDate)) + " EDT";
}

function makeOdds(index: number) {
  return {
    home: Number((1.7 + (index % 5) * 0.15).toFixed(2)),
    draw: Number((3.1 + (index % 4) * 0.12).toFixed(2)),
    away: Number((2.2 + (index % 6) * 0.18).toFixed(2)),
  };
}

export async function GET() {
  const token = "af3b9ada5348466bba0af05bb0af679e";

  if (!token) {
    return NextResponse.json({
      success: false,
      message: "缺少 FOOTBALL_DATA_TOKEN，请在 .env.local 里填写免费 API Key",
      matches: [],
    });
  }

  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches?season=2026",
      {
        headers: {
          "X-Auth-Token": token,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        message: data?.message || "获取世界杯赛程失败",
        matches: [],
      });
    }

    const matches = (data.matches || []).map((m: any, index: number) => ({
      id: m.id,
      code: m.group || m.stage || `Match ${index + 1}`,
      time: formatEDT(m.utcDate),
      home: cnTeam(m.homeTeam?.name),
      away: cnTeam(m.awayTeam?.name),
      homeScore: m.score?.fullTime?.home ?? 0,
      awayScore: m.score?.fullTime?.away ?? 0,
      status: cnStatus(m.status),
      odds: makeOdds(index),
    }));

    return NextResponse.json({
      success: true,
      updateTime: new Date().toISOString(),
      matches,
    });
   } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || "服务器请求赛程失败",
      matches: [],
    });
  }
}