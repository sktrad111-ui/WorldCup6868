import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function getWinner(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}

function checkBetWin(bet: any, match: any) {
  const homeScore = Number(match.home_score ?? 0);
  const awayScore = Number(match.away_score ?? 0);
  const totalGoals = homeScore + awayScore;

  const winner = getWinner(homeScore, awayScore);

  const scoreText = `${homeScore}:${awayScore}`;
  const bothScore = homeScore > 0 && awayScore > 0 ? "是" : "否";
  const totalGoalsText = totalGoals >= 7 ? "7+球" : `${totalGoals}球`;

  if (bet.market === "胜平负") {
    if (bet.option === "主胜") return winner === "home";
    if (bet.option === "平") return winner === "draw";
    if (bet.option === "主负") return winner === "away";

    if (bet.option === "home") return winner === "home";
    if (bet.option === "draw") return winner === "draw";
    if (bet.option === "away") return winner === "away";
  }

  if (bet.market === "波胆") {
    return bet.option === scoreText;
  }

  if (bet.market === "总进球数") {
    return bet.option === totalGoalsText;
  }

  if (bet.market === "双方进球") {
    return bet.option === bothScore;
  }

  return false;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
  const cronSecret =
  process.env.CRON_SECRET || "sktrad111-settle-secret-2026";

    if (!cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing CRON_SECRET",
        },
        { status: 500 }
      );
    }

    if (secret !== cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "FINISHED")
      .eq("settled", false);

    if (matchError) {
      return NextResponse.json(
        { success: false, error: matchError.message },
        { status: 500 }
      );
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No matches need settlement",
      });
    }

    let settledMatches = 0;
    let settledBets = 0;
    let winBets = 0;
    let loseBets = 0;
    let totalPaidPoints = 0;

    for (const match of matches) {
      const homeScore = Number(match.home_score ?? 0);
      const awayScore = Number(match.away_score ?? 0);
      const finalResult = match.result || getWinner(homeScore, awayScore);

      const { data: bets, error: betError } = await supabase
        .from("bets")
        .select("*")
        .eq("match_id", match.id)
        .eq("status", "pending");

      if (betError) {
        console.log("Bet query error:", betError.message);
        continue;
      }

      for (const bet of bets || []) {
        const isWin = checkBetWin(bet, match);
        const winPoints = isWin
          ? Math.ceil(Number(bet.stake || 0) * Number(bet.odds || 0))
          : 0;

        const { error: updateBetError } = await supabase
          .from("bets")
          .update({
            status: isWin ? "win" : "lose",
            win_points: winPoints,
          })
          .eq("id", bet.id);

        if (updateBetError) {
          console.log("Update bet error:", updateBetError.message);
          continue;
        }

        if (isWin && winPoints > 0) {
          const { data: user, error: userQueryError } = await supabase
            .from("users")
            .select("points")
            .eq("id", bet.user_id)
            .single();

          if (!userQueryError && user) {
            const oldPoints = Number(user.points || 0);

            const { error: updateUserError } = await supabase
              .from("users")
              .update({
                points: oldPoints + winPoints,
              })
              .eq("id", bet.user_id);

            if (!updateUserError) {
              totalPaidPoints += winPoints;
            }
          }

          winBets++;
        } else {
          loseBets++;
        }

        settledBets++;
      }

      const { error: updateMatchError } = await supabase
        .from("matches")
        .update({
          settled: true,
          result: finalResult,
        })
        .eq("id", match.id);

      if (!updateMatchError) {
        settledMatches++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Settlement completed",
      settledMatches,
      settledBets,
      winBets,
      loseBets,
      totalPaidPoints,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Settlement failed",
        message: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}