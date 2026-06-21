"use client";

import { useEffect } from "react";

export default function PayPalSuccessPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/?tab=recharge";
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main style={{ padding: 24, textAlign: "center" }}>
      <h1>支付成功</h1>
      <p>正在返回充值页面...</p>

      <a href="/?tab=recharge" style={{ color: "#0f766e", fontWeight: "bold" }}>
        立即返回充值页面
      </a>
    </main>
  );
}