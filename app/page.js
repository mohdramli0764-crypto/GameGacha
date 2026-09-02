"use client";

import { useState } from "react";

const RARITY_COLORS = {
  Common: "#9ca3af",
  Uncommon: "#22c55e",
  Rare: "#3b82f6",
  Epic: "#a855f7",
  Legendary: "#facc15",
};

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin() {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlayer(data.player);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSpin() {
    setErrorMsg("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: player.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.card);
      setPlayer({ ...player, jumlah_koin: data.sisa_koin });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!player) {
    return (
      <main style={styles.center}>
        <h1 style={{ fontSize: "28px", marginBottom: "16px" }}>🎴 Game Kartu Koleksi</h1>
        <input
          style={styles.input}
          placeholder="Masukkan username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? "Memuat..." : "Masuk"}
        </button>
        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
      </main>
    );
  }

  return (
    <main style={styles.center}>
      <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>Halo, {player.username}</h1>
      <p style={{ color: "#facc15", marginBottom: "24px" }}>💰 {player.jumlah_koin} koin</p>

      <button style={styles.spinButton} onClick={handleSpin} disabled={loading}>
        {loading ? "Memutar..." : "SPIN (20 koin)"}
      </button>

      {errorMsg && <p style={styles.error}>{errorMsg}</p>}

      {result && (
        <div
          style={{
            ...styles.cardResult,
            borderColor: RARITY_COLORS[result.rarity],
          }}
        >
          <p style={{ color: RARITY_COLORS[result.rarity], fontWeight: "bold" }}>
            {result.rarity}
          </p>
          <p style={{ fontSize: "18px", margin: "8px 0" }}>{result.nama}</p>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Nilai: {result.nilai_koin} koin</p>
        </div>
      )}
    </main>
  );
}

const styles = {
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f1f5f9",
    marginBottom: "12px",
    width: "100%",
    maxWidth: "280px",
    fontSize: "16px",
  },
  button: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
  },
  spinButton: {
    padding: "16px 32px",
    borderRadius: "12px",
    border: "none",
    background: "#facc15",
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "24px",
  },
  cardResult: {
    border: "2px solid",
    borderRadius: "12px",
    padding: "20px",
    minWidth: "220px",
    background: "#1e293b",
  },
  error: {
    color: "#f87171",
    marginTop: "12px",
  },
};
