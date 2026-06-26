import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function cnStatus(status: string) {
  if (status === "SCHEDULED" || status === "TIMED") return "未开始";
  if (status === "LIVE" || status === "IN_PLAY" || status === "PAUSED") return "进行中";
  if (status === "FINISHED") return "已结束";
  if (status === "POSTPONED") return "延期";
  if (status === "CANCELLED") return "取消";
  return status || "未开始";
}

function formatEDT(date?: string | null) {
  if (!date) return "";

  return (
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(date)) + " EDT"
  );
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("match_time", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          matches: [],
        },
        { status: 500 }
      );
    }

    const matches = (data || []).map((m: any, index: number) => ({
      id: m.id,
      code: `Match ${index + 1}`,
      time: formatEDT(m.match_time),
      home: m.home_team,
      away: m.away_team,
      homeScore: m.home_score ?? 0,
      awayScore: m.away_score ?? 0,
      status: cnStatus(m.status),
      odds: {
        home: 2,
        draw: 3,
        away: 2,
      },
    }));

    return NextResponse.json({
      success: true,
      updateTime: new Date().toISOString(),
      matches,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "获取比赛失败",
        matches: [],
      },
      { status: 500 }
    );
  }
}