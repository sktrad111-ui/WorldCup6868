import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function boostOdds(value: number | undefined | null) {
  const n = Number(value);
  if (!n || Number.isNaN(n)) return null;

  return Number((n * 1.2).toFixed(2));
}

export async function GET() {
  try {
    const apiKey = process.env.THE_ODDS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing THE_ODDS_API_KEY" },
        { status: 500 }
      );
    }

    const url =
      "https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds" +
      `?apiKey=${apiKey}` +
      "&regions=us,eu,uk" +
      "&markets=h2h" +
      "&oddsFormat=decimal" +
      "&dateFormat=iso";

    const res = await fetch(url, {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "The Odds API error", raw: data },
        { status: res.status }
      );
    }

    // 同步比赛到 matches 表
    const matchRows = data.map((game: any) => ({
      id: game.id,
      home_team: game.home_team,
      away_team: game.away_team,
      match_name: `${game.home_team} vs ${game.away_team}`,
      match_time: game.commence_time,
      status: "SCHEDULED",
      settled: false,
    }));

    const { error: syncError } = await supabase
      .from("matches")
      .upsert(matchRows, {
        onConflict: "id",
      });

    if (syncError) {
      return NextResponse.json(
        {
          error: "Failed to sync matches to Supabase",
          details: syncError.message,
        },
        { status: 500 }
      );
    }

    const odds = data.map((game: any) => {
      const bookmaker = game.bookmakers?.[0];
      const market = bookmaker?.markets?.find((m: any) => m.key === "h2h");
      const outcomes = market?.outcomes || [];

      const home = outcomes.find((o: any) => o.name === game.home_team);
      const away = outcomes.find((o: any) => o.name === game.away_team);
      const draw = outcomes.find((o: any) => o.name === "Draw");

      return {
        id: game.id,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        commenceTime: game.commence_time,
        bookmaker: bookmaker?.title || "",
        odds: {
          home: boostOdds(home?.price),
          draw: boostOdds(draw?.price),
          away: boostOdds(away?.price),
        },
        rawOdds: {
          home: home?.price || null,
          draw: draw?.price || null,
          away: away?.price || null,
        },
      };
    });

    return NextResponse.json({
      success: true,
      syncedMatches: matchRows.length,
      odds,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch odds",
        message: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}