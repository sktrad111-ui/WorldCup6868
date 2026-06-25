"use client";

import { useEffect, useState } from "react";
import { matches as defaultMatches } from "./data/matches";
import { markets } from "./data/markets";
import { generateInviteCode } from "./utils/invite";
import type { Match, Bet } from "./types";
import { supabase } from "@/lib/supabase";

type Tab = "bet" | "schedule" | "invite" | "recharge" | "mine";
type BetStatus = "待开奖" | "已中奖" | "未中奖";

type AppBet = Bet & {
  id: number;
  matchId: number;
  status: BetStatus;
  winPoints?: number;
};

type AppUser = {
id?: string;
   invitedBy?: string;
  username: string;
  password: string;
  points: number;
  inviteCode: string;
  invited: number;
  inviteReward: number;
};

export default function Home() {
  useEffect(() => {
  testSupabase();
}, []);

async function testSupabase() {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  console.log("Supabase测试", data);
  console.log("错误", error);
}
  const [tab, setTab] = useState<Tab>("bet");
  const [mode, setMode] = useState<"login" | "register">("login");

  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  useEffect(() => {
  if (currentUser?.username === "2317577970") {
    loadRequests();
    loadWithdrawals();
  }
}, [currentUser]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteInput, setInviteInput] = useState("");

  const [stake, setStake] = useState(10);
  const [rechargeAmount, setRechargeAmount] = useState(10);
  const [rechargeRequests, setRechargeRequests] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [myRecharges, setMyRecharges] = useState<any[]>([]);
  const [myWithdrawals, setMyWithdrawals] = useState<any[]>([]);
  const payWithPaypal = async () => {
    alert("PayPal clicked");

  try {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: rechargeAmount,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error(err);
    alert("PayPal Error");
  }
};
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedBet, setSelectedBet] = useState<AppBet | null>(null);
  const [bets, setBets] = useState<AppBet[]>([]);
  const [matches, setMatches] = useState<Match[]>(defaultMatches);
  
  const upcomingMatches = matches.filter(
  (m) => m.status !== "已结束"
);

const finishedMatches = matches.filter(
  (m) => m.status === "已结束"
);
  const fetchMatches = async () => {
  try {
    const res = await fetch("/api/matches");

    const data = await res.json();

    if (data.success) {
      setMatches(data.matches);
      autoSettleFinishedMatches(data.matches);
    }
  } catch (err) {
    console.log("获取比赛失败", err);
  }
};

  useEffect(() => {
    
    const savedUsers = localStorage.getItem("wc_users_v10");
    const savedCurrent = localStorage.getItem("wc_current_user_v10");
    const savedBets = localStorage.getItem("wc_bets_v10");
    const savedMatches = localStorage.getItem("wc_matches_v10");
    

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedCurrent) setCurrentUser(JSON.parse(savedCurrent));
    if (savedBets) setBets(JSON.parse(savedBets));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    fetchMatches();

const timer = setInterval(() => {
  fetchMatches();
}, 5000);

const upcomingMatches = matches.filter((m) => m.status !== "已结束");
const finishedMatches = matches.filter((m) => m.status === "已结束");

return () => clearInterval(timer);
  }, []);

  const saveUsers = (data: AppUser[]) => {
    setUsers(data);
    localStorage.setItem("wc_users_v10", JSON.stringify(data));
  };

  const saveCurrentUser = (user: AppUser | null) => {
    setCurrentUser(user);
    if (user) localStorage.setItem("wc_current_user_v10", JSON.stringify(user));
    else localStorage.removeItem("wc_current_user_v10");
  };

  const saveBets = (data: AppBet[]) => {
    setBets(data);
    localStorage.setItem("wc_bets_v10", JSON.stringify(data));
  };

  const updateUser = (user: AppUser) => {
    const nextUsers = users.map((u) =>
      u.username === user.username ? user : u
    );
    saveUsers(nextUsers);
    saveCurrentUser(user);
  };

  const inviteRanking = users
    .filter((u) => u.invited > 0)
    .sort((a, b) => b.invited - a.invited || b.inviteReward - a.inviteReward);

  const register = async () => {
  if (!username || !password) return alert("请输入用户名和密码");

  const inviteCode = generateInviteCode();

  const { data: existingUsers } = await supabase
    .from("users")
    .select("username")
    .eq("username", username);

  if (existingUsers && existingUsers.length > 0) {
    return alert("用户名已存在");
  }

const newUser = {
  username,
  password,
  points: 0,
  inviteCode,
  invitedBy: inviteInput || "",
  invited: 0,
  inviteReward: 0,
};

  const { error } = await supabase.from("users").insert({
    username,
    password,
    points: 0,
    invite_code: inviteCode,
    invited_by: inviteInput || null,
  });

  if (error) {
    console.log(error);
    return alert("注册失败");
  }

  saveUsers([newUser, ...users]);
  saveCurrentUser(newUser);

  setUsername("");
  setPassword("");
  setInviteInput("");

  alert("注册成功，初始积分为0，请充值后参与竞猜");
};



  const login = async () => {
  if (!username || !password) return alert("请输入用户名和密码");

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    return alert("用户名或密码错误");
  }

 const loginUser = {
  username: data.username,
  password: data.password,
  points: data.points || 0,
  inviteCode: data.invite_code,
  invitedBy: data.invited_by || "",
  invited: data.invited || 0,
  inviteReward: data.invite_reward || 0,
};

  saveCurrentUser(loginUser);
  setUsername("");
  setPassword("");
};
const submitRecharge = async () => {
  if (!currentUser) return alert("请先登录");

  const amount = Number(rechargeAmount);
  localStorage.setItem("rechargeAmount", String(amount));

  if (!amount || amount <= 0) {
    return alert("请输入充值金额");
  }
  

  try {
    alert("正在跳转 PayPal...");

    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });


    const data = await res.json();
    console.log("PayPal result:", data);

    if (!data.url) {
      return alert("PayPal 创建订单失败");
    }

    window.location.href = data.url;
  } catch (err) {
    console.error(err);
    alert("PayPal 支付失败");
  }
};
const submitUsdtRecharge = async () => {
  if (!currentUser) return alert("请先登录");

  const amount = Number(rechargeAmount);

  if (!amount || amount <= 0) {
    return alert("请输入充值金额");
  }

  const { error } = await supabase
    .from("recharge_requests")
    .insert({
      username: currentUser.username,
      amount,
      points: amount * 10,
      method: "USDT_TRC20",
      status: "pending",
    });

  if (error) {
    alert("提交失败：" + error.message);
    return;
  }

  alert("USDT充值申请已提交，请等待管理员审核");
};
const loadMyRecords = async () => {
  if (!currentUser) return;

  const { data: recharges } = await supabase
    .from("recharge_requests")
    .select("*")
    .eq("username", currentUser.username)
    .order("created_at", { ascending: false });

  const { data: withdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("username", currentUser.username)
    .order("created_at", { ascending: false });

  setMyRecharges(recharges || []);
  setMyWithdrawals(withdrawals || []);

  alert("Records loaded");
};
const loadRequests = async () => {
  const { data, error } = await supabase
    .from("recharge_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }
  setRechargeRequests(data || []);

const text = (data || [])
  .map((r) => {
    return (
      "Username: " + r.username +
      "\nAmount: " + r.amount +
      "\nPoints: " + r.points +
      "\nID: " + r.id +
      "\n\nType APPROVE-" + r.id + " to approve"
    );
  })
  .join("\n\n");
 const id = prompt(
  (text || "No pending recharge requests") +
  "\n\nEnter ID to approve:"
);

if (!id) return;

approveRecharge(id);
};
const approveRecharge = async (id: string) => {
  const { data, error } = await supabase
    .from("recharge_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Request not found");
    return;
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", data.username)
    .single();

  if (!user) {
    alert("User not found");
    return;
  }

  await supabase
    .from("users")
    .update({
      points: Number(user.points || 0) + Number(data.points || 0)
    })
    .eq("username", data.username);

  await supabase
    .from("recharge_requests")
    .update({
      status: "approved"
    })
    .eq("id", id);

 alert("Recharge approved successfully");
loadRequests();
};
const loadWithdrawals = async () => {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }
  setWithdrawalRequests(data || []);

 const text = (data || [])
  .map((w) => {
    return (
      "Username: " + w.username +
      "\nPoints: " + w.points +
      "\nUSDT Address: " + w.usdt_address +
      "\nID: " + w.id +
      "\n\nType APPROVE-" + w.id + " to approve"
    );
  })
  .join("\n\n");

  const id = prompt(
    (text || "No pending withdrawal requests") +
    "\n\nEnter ID to approve:"
  );

  if (!id) return;

  approveWithdrawal(id);
};
const approveWithdrawal = async (id: string) => {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Withdrawal request not found");
    return;
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", data.username)
    .single();

  if (!user) {
    alert("User not found");
    return;
  }

  if (Number(user.points || 0) < Number(data.points || 0)) {
    alert("User points are not enough");
    return;
  }

  await supabase
    .from("users")
    .update({
      points: Number(user.points || 0) - Number(data.points || 0),
    })
    .eq("username", data.username);

  await supabase
    .from("withdrawal_requests")
    .update({
      status: "approved",
    })
    .eq("id", id);

 alert("Withdrawal approved successfully");
loadWithdrawals();
};
  const chooseOption = (
    match: Match,
    market: string,
    option: string,
    odds: number
  ) => {
    if (match.status === "已结束") return;

    setSelectedBet({
      id: Date.now(),
      matchId: match.id,
      match: `${match.home} vs ${match.away}`,
      market,
      option,
      odds,
      stake,
      status: "待开奖",
    });
  };

  const confirmBet = async () => {
    if (!currentUser || !selectedBet) return;
    if (stake <= 0) return alert("请输入投注积分");
    if (stake > currentUser.points) return alert("积分不足");

    const newBet = { ...selectedBet, id: Date.now(), stake };
    saveBets([newBet, ...bets]);

    updateUser({
      ...currentUser,
      points: currentUser.points - stake,
    });
  if (currentUser.invitedBy) {
  const reward = Math.floor(stake * 0.05);

  if (reward > 0) {
    const { data: inviter } = await supabase
      .from("users")
      .select("*")
      .eq("invite_code", currentUser.invitedBy)
      .single();

    if (inviter) {
      await supabase
        .from("users")
        .update({
          points: inviter.points + reward,
         invite_reward: (inviter.invite_reward || 0) + reward,
        })
        .eq("id", inviter.id);
    }
  }
} 
    

    setSelectedBet(null);
    setSelectedMatch(null);
    setStake(10);
  };
const getBetResult = (match: Match, bet: AppBet): boolean | null => {
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const totalGoals = homeScore + awayScore;

  const winner =
    homeScore > awayScore ? "主胜" : homeScore < awayScore ? "主负" : "平";

  const scoreText = `${homeScore}:${awayScore}`;
  const bothScore = homeScore > 0 && awayScore > 0 ? "是" : "否";
  const totalText = totalGoals >= 7 ? "7+球" : `${totalGoals}球`;

  if (bet.market === "胜平负") return bet.option === winner;
  if (bet.market === "波胆") return bet.option === scoreText;
  if (bet.market === "总进球数") return bet.option === totalText;
  if (bet.market === "双方进球") return bet.option === bothScore;

  return null;
};

const autoSettleFinishedMatches = (latestMatches: Match[]) => {
  if (!currentUser) return;

  let added = 0;
  let changed = false;

  const nextBets = bets.map((b) => {
    if (b.status !== "待开奖") return b;

    const match = latestMatches.find((m) => m.id === b.matchId);
    if (!match) return b;
    if (match.status !== "已结束") return b;

    const result = getBetResult(match, b);
    if (result === null) return b;

    changed = true;

    if (result) {
      const winPoints = Math.floor(b.stake * b.odds);
      added += winPoints;

      return {
        ...b,
        status: "已中奖" as const,
        winPoints,
      };
    }

    return {
      ...b,
      status: "未中奖" as const,
      winPoints: 0,
    };
  });

  if (!changed) return;

  saveBets(nextBets);

  if (added > 0) {
    updateUser({
      ...currentUser,
      points: currentUser.points + added,
    });
  }
};
  const settleMatch = (matchId: number) => {
    if (!currentUser) return;

    const result = {
      winner: "主胜",
      score: "2:0",
      totalGoals: "2球",
      bothScore: "否",
    };

    const nextMatches = matches.map((m) =>
      m.id === matchId ? { ...m, status: "已结束" } : m
    );

    setMatches(nextMatches);
    localStorage.setItem("wc_matches_v10", JSON.stringify(nextMatches));

    let added = 0;

    const nextBets = bets.map((b) => {
      if (b.matchId !== matchId || b.status !== "待开奖") return b;

      const isWin =
        (b.market === "胜平负" && b.option === result.winner) ||
        (b.market === "波胆" && b.option === result.score) ||
        (b.market === "总进球数" && b.option === result.totalGoals) ||
        (b.market === "双方进球" && b.option === result.bothScore);

      if (isWin) {
        const winPoints = Math.floor(b.stake * b.odds);
        added += winPoints;
        return { ...b, status: "已中奖" as const, winPoints };
      }

      return { ...b, status: "未中奖" as const, winPoints: 0 };
    });

    saveBets(nextBets);

    if (added > 0) {
      updateUser({ ...currentUser, points: currentUser.points + added });
      alert(`结算完成，获得 ${added} 积分`);
    } else {
      alert("结算完成，暂无中奖");
    }
  };

  const copyInviteCode = async () => {
    if (!currentUser) return;

    try {
      await navigator.clipboard.writeText(currentUser.inviteCode);
      alert("邀请码已复制");
    } catch {
      alert(`你的邀请码是：${currentUser.inviteCode}`);
    }
  };

  if (!currentUser) {
    return (
      <div style={styles.page}>
        <div style={styles.loginBox}>
          <h1>⚽ Soccer Mini Game</h1>
          <p style={styles.small}>Simulated Play · Points Entertainment Version</p>

          <div style={styles.authTabs}>
            <button
              onClick={() => setMode("login")}
              style={mode === "login" ? styles.authActive : styles.authBtn}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              style={mode === "register" ? styles.authActive : styles.authBtn}
            >
              Register
            </button>
          </div>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          {mode === "register" && (
            <input
              placeholder="Invite Code (Optional)"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              style={styles.input}
            />
          )}

          <button
            onClick={mode === "login" ? login : register}
            style={styles.confirmBtn}
          >
            {mode === "login" ? "Login" : "Register and Enter"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.phone}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>⚽ World Cup Predictions</div>
            <div style={styles.subTitle}>Welcome, {currentUser.username}</div>
          </div>

          <div style={styles.pointsBox}>
            <span>Points</span>
            <b>{currentUser.points}</b>
          </div>


        </div>

        {tab === "bet" && (
          <>
            <div style={styles.section}>
              <h3>🔥 Upcoming Matches</h3>

{upcomingMatches.map((match) => (
                <div key={match.id} style={styles.matchListCard}>
                  <div style={styles.matchListTop}>
                    <span>{match.code}</span>
                    <span>{match.time}</span>
                  </div>

                  <div style={styles.matchListTeams}>
                    <b>{match.home}</b>
                    <span>VS</span>
                    <b>{match.away}</b>
                  </div>

                  <button
                    disabled={match.status === "已结束"}
                    onClick={() => {
                      setSelectedMatch(match);
                      setSelectedBet(null);
                    }}
                    style={{
                      ...styles.enterBtn,
                      opacity: match.status === "已结束" ? 0.5 : 1,
                    }}
                  >
                    {match.status === "已结束" ? "已结束" : "进入竞猜"}
                  </button>
                </div>
              ))}
              <h3>✅ Finished Matches</h3>

{finishedMatches.map((match) => (
  <div key={match.id} style={styles.matchListCard}>
    <div style={styles.matchListTop}>
      <span>{match.code}</span>
      <span>{match.time}</span>
    </div>

    <div style={styles.matchListTeams}>
      <b>{match.home}</b>
      <span>VS</span>
      <b>{match.away}</b>
    </div>

    <button
      disabled
      style={{
        ...styles.enterBtn,
        opacity: 0.5,
      }}
    >
      Finished
    </button>
  </div>
))}
            </div>

            <div style={styles.section}>
              <h3>My Betting Records</h3>

              {bets.length === 0 ? (
                <div style={styles.empty}>No betting records available</div>
              ) : (
                bets.map((b) => (
                  <div key={b.id} style={styles.recordItem}>
                    <div>
                      <b>{b.match}</b>
                      <div style={styles.small}>
                        {b.market} / {b.option} / {b.stake} points / Odds {b.odds}
                      </div>
                      <div style={styles.small}>
                        Status: {b.status}{" "}
                        {b.winPoints ? `+${b.winPoints} points` : ""}
                      </div>
                    </div>

                    <b style={b.status === "已中奖" ? styles.plus : styles.minus}>
                      {b.status === "已中奖" ? `+${b.winPoints}` : `-${b.stake}`}
                    </b>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {tab === "schedule" && (
          <div style={styles.section}>
            <h3>World Cup Schedule / Results</h3>

            {matches.map((m) => (
              <div key={m.id} style={styles.scheduleItem}>
                <div>
                  <b>
                    {m.home} vs {m.away}
                    <div>
  <b>
  </b>

  <div style={styles.small}>
    Status: {m.status}
  </div>

  <div style={styles.small}>
    Score: {m.homeScore ?? 0} - {m.awayScore ?? 0}
  </div>

  <div style={styles.small}>
    Live Odds: Home Win {m.odds?.home} / Draw {m.odds?.draw} / Away Win {m.odds?.away}
  </div>

  <div style={styles.small}>
    {m.code} · {m.time}
  </div>
</div>
                  </b>
                  <div style={styles.small}>
                    {m.code} · {m.time}
                  </div>
                </div>

                {m.status === "未开始" ? (
                  <button onClick={() => settleMatch(m.id)} style={styles.settleBtn}>
                    模拟开奖
                  </button>
                ) : (
                  <span style={styles.status}>Finished</span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "invite" && (
          <div style={styles.section}>
            <h3>Invite Friends</h3>

            <div style={styles.inviteCard}>
              <div style={styles.inviteTitle}>My Invite Code</div>
              <div style={styles.inviteCode}>{currentUser.inviteCode}</div>

              <button onClick={copyInviteCode} style={styles.whiteBtn}>
                Copy Invite Code
              </button>
            </div>

            <div style={styles.infoBox}>
              <div>Invited Users: {currentUser.invited}</div>
              <div>Total Invite Rewards: {currentUser.inviteReward} Points</div>
              <div>Friends can use your invite code to register. You will receive up to 40% of their deposit amount as a reward after they successfully deposit.</div>
              <div>Invite rewards are only issued after your friends place successful bets.</div>
            </div>

            {inviteRanking.length === 0 ? (
              <div style={styles.empty}>No invite records available</div>
            ) : (
              inviteRanking.map((u, index) => (
                <div key={u.username} style={styles.rankItem}>
                  <b>#{index + 1}</b>
                  <span>{u.username}</span>
                  <span>{u.invited} 人</span>
                  <b>{u.inviteReward} Points</b>
                </div>
              ))
            )}
          </div>
        )}
{tab === "recharge" && (
  <div style={styles.section}>
    <h3>Deposit Center</h3>

    <div style={styles.infoBox}>
      <div>Recharge Rate：1 USD/USDT = 10积分</div>
      <div>10 USD/USDT = 100积分</div>
      <div>50 USD/USDT = 500积分</div>
      <div>100 USD/USDT = 1000积分</div>
    </div>
    <div style={{
  background: "#111",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "15px",
  color: "#fff"
}}>
  <h4>USDT Recharge (TRC20)</h4>

  <div
    style={{
      background: "#222",
      padding: "10px",
      borderRadius: "6px",
      wordBreak: "break-all",
      marginTop: "10px"
    }}
  >
    TDUqzoEr175nM34duPdGZizP2jG8zBzDgy
  </div>

  <div style={{ marginTop: "10px" }}>
    Network: TRON (TRC20)
  </div>

  <div style={{ marginTop: "5px" }}>
    1 USDT = 10 Points
  </div>

<div style={{ marginTop: "10px", color: "#00ff99" }}>
  After sending USDT, please contact customer service to complete your recharge.
</div>

<button
  onClick={() => window.open("https://t.me/SKtrad111", "_blank")}
  style={{
    ...styles.confirmBtn,
    background: "#229ED9",
    marginTop: 8,
  }}
>
  💬 Contact Customer Service
</button>
</div>
<button
  onClick={() => {
    navigator.clipboard.writeText(
      "TDUqzoEr175nM34duPdGZizP2jG8zBzDgy"
    );
    alert("USDT address copied");
  }}
  style={styles.confirmBtn}
>
  Copy USDT Address
</button>

    <input
      type="number"
      style={styles.input}
      value={rechargeAmount}
      onChange={(e) =>
        setRechargeAmount(Number(e.target.value))
      }
      placeholder="请输入充值金额"
    />
    <button
  onClick={submitRecharge}
  style={styles.confirmBtn}
>
  Pay {rechargeAmount} USD with PayPal
</button>
<button
  onClick={submitUsdtRecharge}
  style={styles.confirmBtn}
>
  Submit USDT Recharge Request
</button>
{rechargeRequests.map((r) => (
  <div
    key={r.id}
    style={{
      background: "#f5f5f5",
      padding: 8,
      borderRadius: 6,
      marginTop: 8,
      fontSize: 12,
    }}
  >
    <div>User: {r.username}</div>
    <div>Amount: {r.amount}</div>
    <div>Points: {r.points}</div>

    <button
      onClick={() => approveRecharge(r.id)}
      style={{
        ...styles.confirmBtn,
        marginTop: 6,
      }}
    >
      Approve Recharge
    </button>
  </div>
))}

  </div>
)}
        {tab === "mine" && (
          <div style={styles.section}>
            <h3>My Account</h3>

            <div style={styles.profile}>
              <div style={styles.avatar}>⚽</div>
              <div>
                <b>{currentUser.username}</b>
                <div style={styles.small}>Current Points: {currentUser.points}</div>
              </div>
            </div>

            <div style={styles.infoBox}>
              <div> Betting次数: {bets.length}</div>
              <div>Invited Users: {currentUser.invited}</div>
              <div>Invite Rewards: {currentUser.inviteReward} Points</div>
              <div>
                My Invite Code: <b>{currentUser.inviteCode}</b>
              </div>
            </div>
{currentUser?.username === "2317577970" && (
  <div
    style={{
      background: "#fff",
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
    }}
  >
    <h3>Admin Panel</h3>

{rechargeRequests.map((r) => (
  <div
    key={r.id}
    style={{
      background: "#f5f5f5",
      padding: 8,
      borderRadius: 6,
      marginTop: 8,
      fontSize: 12,
    }}
  >
    <div>User: {r.username}</div>
    <div>Amount: {r.amount}</div>
    <div>Points: {r.points}</div>

    <button
      onClick={() => approveRecharge(r.id)}
      style={{
        ...styles.confirmBtn,
        marginTop: 6,
      }}
    >
      Approve Recharge
    </button>
  </div>
))}

    {withdrawalRequests.map((w) => (
  <div
    key={w.id}
    style={{
      background: "#fff5f5",
      padding: 8,
      borderRadius: 6,
      marginTop: 8,
      fontSize: 12,
    }}
  >
    <div>User: {w.username}</div>
    <div>Points: {w.points}</div>
    <div>Address: {w.usdt_address}</div>

    <button
      onClick={() => approveWithdrawal(w.id)}
      style={{
        ...styles.confirmBtn,
        marginTop: 6,
      }}
    >
      Approve Withdrawal
    </button>
  </div>
))}
  </div>
)}

<button
 onClick={async () => {
    const withdrawAddress = prompt(

  "Please enter your PayPal email or USDT(TRC20) address"
);

if (!withdrawAddress) return;

   const amount = Number(prompt("Please enter the withdrawal amount (USD)"));

if (!amount || amount <= 0) {
  alert("Please enter the correct withdrawal amount");
  return;
}

const needPoints = amount * 10;

if (currentUser.points < needPoints) {
  alert(`Insufficient points. Withdrawing ${amount} USD requires ${needPoints} points.`);
  return;
}
const { error } = await supabase
.from("withdrawal_requests")
.insert({
  username: currentUser.username,
  points: needPoints,
  usdt_address: withdrawAddress,
  status: "pending",
})

if (error) {
  alert(error.message);
  console.log(error);
  return;
}
 alert(
  `Withdrawal request submitted

Address: ${withdrawAddress}

Amount: ${amount} USD`
);
  }}
  style={{
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  
  Withdrawal Request
</button>
<div
  style={{
    fontSize: 13,
    color: "#ff9800",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  }}
>
  ⚠️ Use the same withdrawal method as your deposit method.
</div>
            <button onClick={() => saveCurrentUser(null)} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        )}
      </div>
      <div style={styles.tabs}>
  <button style={styles.tabBtn} onClick={() => setTab("bet")}>
    ⚽<br />Predictions
  </button>

  <button style={styles.tabBtn} onClick={() => setTab("schedule")}>
    📅<br />Fixtures
  </button>

  <button style={styles.tabBtn} onClick={() => setTab("invite")}>
    👥<br />Invite Friends
  </button>

  <button style={styles.tabBtn} onClick={() => setTab("recharge")}>
    💰<br />Deposit
  </button>

  <button style={styles.tabBtn} onClick={() => setTab("mine")}>
    👤<br />Account
  </button>
</div>

      {selectedMatch && (
        <div style={styles.mask}>
          <div style={styles.gamePanel}>
            <div style={styles.panelBar}></div>

  <button
    onClick={() => {
      setSelectedMatch(null);
      setSelectedBet(null);
    }}
    style={styles.closeBtn}
  >
    ✕
  </button>
            <div style={styles.panelHeader}>
  <div>
    <div style={styles.small}>
      {selectedMatch.code} · {selectedMatch.time}
    </div>

    <h3>
      {selectedMatch.home}
      <span>VS</span>
      {selectedMatch.away}
    </h3>
  </div>
</div>

            <div style={styles.marketScroll}>
              {markets.map((market) => (
                <div key={market.name} style={styles.market}>
                  <div style={styles.marketTitle}>{market.name}</div>

                  <div style={styles.oddsGrid}>
                    {market.options.map((o) => (
                      <button
                        key={o.name}
                        onClick={() =>
                          chooseOption(
                            selectedMatch,
                            market.name,
                            o.name,
                            o.odds
                          )
                        }
                        style={{
                          ...styles.oddsButton,
                          ...(selectedBet?.market === market.name &&
                          selectedBet?.option === o.name
                            ? styles.activeOdds
                            : {}),
                        }}
                      >
                        <span>{o.name}</span>
                        <b>{o.odds}</b>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedBet && (
              <div style={styles.confirmBox}>
                <div style={styles.betInfo}>
                  <div>{selectedBet.match}</div>
                  <b>
                    {selectedBet.market} · {selectedBet.option} @{" "}
                    {selectedBet.odds}
                  </b>
                </div>

                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  style={styles.input}
                />

                <div style={styles.quickStakes}>
                  {[10, 50, 100, 500].map((n) => (
                    <button
                      key={n}
                      onClick={() => setStake(n)}
                      style={styles.quickBtn}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div style={styles.expected}>
                  Betting Points: {stake}
                  <br />
                  Odds: {selectedBet.odds}
                  <br />
                  Expected Winnings: <b>{stake * selectedBet.odds}</b> Points
                </div>

                <button onClick={confirmBet} style={styles.confirmBtn}>
                  Confirm Bet
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedMatch(null);
                setSelectedBet(null);
              }}
              style={styles.cancelBtn}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  background: "none",
  border: "none",
  color: active ? "#facc15" : "white",
  fontWeight: active ? "bold" : "normal",
  cursor: "pointer",
});

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#111827",
    display: "flex",
    justifyContent: "center",
    padding: 16,
    fontFamily: "Arial",
  },
  
  
  loginBox: {
    width: "100%",
    maxWidth: 390,
    background: "white",
    borderRadius: 20,
    padding: 24,
    marginTop: 80,
  },
  authTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    margin: "20px 0",
  },
  authBtn: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#f9fafb",
  },
  authActive: {
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#0f766e",
    color: "white",
    fontWeight: "bold",
  },
phone: {
  width: "100%",
  maxWidth: 390,
  minHeight: "100vh",
  background: "#f5f5f5",
  paddingBottom: 80,
},
  header: {
    background: "linear-gradient(135deg, #064e3b, #0f766e)",
    color: "white",
    padding: 18,
    display: "flex",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "bold" },
  subTitle: { fontSize: 12, opacity: 0.8, marginTop: 4 },
  pointsBox: {
    background: "rgba(255,255,255,0.15)",
    padding: "8px 12px",
    borderRadius: 12,
    textAlign: "center",
  },
tabs: {
  position: "fixed",
  bottom: 0,
  left: "50%",
  transform: "translateX(-50%)",

  width: "100%",
  maxWidth: 390,

  height: 60,

  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",

  background: "#ffffff",

  borderTop: "1px solid #eee",

  zIndex: 999,
},
tabBtn: {
  flex: 1,
  border: "none",
  background: "transparent",
  color: "#666",
  fontSize: 14,
  fontWeight: "bold",
  cursor: "pointer",
},

  section: { margin: 12 },
  matchListCard: {
    background: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  matchListTop: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#6b7280",
  },
  matchListTeams: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: "18px 0",
    fontSize: 20,
  },
  enterBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "#0f766e",
    color: "white",
    fontWeight: "bold",
  },
  empty: {
    background: "white",
    padding: 16,
    borderRadius: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  recordItem: {
    background: "white",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
  },
  scheduleItem: {
    background: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankItem: {
    background: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    display: "grid",
    gridTemplateColumns: "40px 1fr 60px 80px",
    gap: 8,
    alignItems: "center",
  },
  profile: {
    background: "white",
    padding: 16,
    borderRadius: 12,
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    background: "#0f766e",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  infoBox: {
    background: "white",
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    lineHeight: 2,
  },
  inviteCard: {
    background: "linear-gradient(135deg, #064e3b, #0f766e)",
    color: "white",
    borderRadius: 18,
    padding: 20,
    textAlign: "center",
  },
  inviteTitle: {
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 10,
  },
  inviteCode: {
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 18,
  },
  whiteBtn: {
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: "white",
    color: "#0f766e",
    fontWeight: "bold",
    fontSize: 16,
  },
  small: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  minus: { color: "#dc2626" },
  plus: { color: "#16a34a" },
  status: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 8px",
    borderRadius: 99,
    fontSize: 12,
  },
  settleBtn: {
    border: "none",
    background: "#0f766e",
    color: "white",
    padding: "8px 10px",
    borderRadius: 8,
  },
  logoutBtn: {
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: "#dc2626",
    color: "white",
    fontWeight: "bold",
    marginTop: 16,
  },
  mask: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  gamePanel: {
     position: "relative",
    background: "white",
    width: "100%",
    maxWidth: 430,
    maxHeight: "92vh",
    borderRadius: "22px 22px 0 0",
    padding: 16,
    overflow: "hidden",
  },
  panelBar: {
    width: 48,
    height: 5,
    background: "#d1d5db",
    borderRadius: 99,
    margin: "0 auto 12px",
  },
  closeBtn: {
  position: "absolute",
  top: 12,
  right: 16,
  border: "none",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
  cursor: "pointer",
  width: 32,
  height: 32,
  borderRadius: 16,
  zIndex: 1000,
},
  panelHeader: {
    textAlign: "center",
    background: "linear-gradient(90deg, #075985, #0f766e)",
    color: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  marketScroll: {
    maxHeight: "46vh",
    overflowY: "auto",
  },
  market: {
    padding: 12,
    borderBottom: "1px solid #eee",
  },
  marketTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    borderLeft: "4px solid #0ea5e9",
    paddingLeft: 8,
  },
  oddsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  oddsButton: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 6px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    cursor: "pointer",
  },
  activeOdds: {
    background: "#0f766e",
    color: "white",
    border: "1px solid #0f766e",
  },
  confirmBox: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: 12,
    marginTop: 10,
  },
  betInfo: {
    background: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    marginBottom: 10,
    fontSize: 18,
  },
  quickStakes: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginBottom: 12,
  },
  quickBtn: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#f9fafb",
  },
  expected: {
    background: "#ecfeff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    lineHeight: 1.8,
  },
  confirmBtn: {
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: "#0f766e",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelBtn: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    border: "none",
    background: "transparent",
    color: "#6b7280",
  },
};