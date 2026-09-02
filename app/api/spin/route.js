import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const SPIN_COST = 20;

const RARITY_WEIGHTS = {
  Common: 50,
  Uncommon: 25,
  Rare: 15,
  Epic: 8,
  Legendary: 2,
};

function pickRarity() {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return "Common";
}

export async function POST(request) {
  try {
    const { player_id } = await request.json();
    if (!player_id) {
      return Response.json({ error: "player_id wajib diisi" }, { status: 400 });
    }

    const { data: player, error: playerErr } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("id", player_id)
      .single();

    if (playerErr || !player) {
      return Response.json({ error: "Pemain tidak ditemukan" }, { status: 404 });
    }

    if (player.jumlah_koin < SPIN_COST) {
      return Response.json({ error: "Koin tidak cukup" }, { status: 400 });
    }

    const rarity = pickRarity();

    const { data: candidateCards, error: cardErr } = await supabaseAdmin
      .from("cards")
      .select("*")
      .eq("rarity", rarity);

    if (cardErr || !candidateCards || candidateCards.length === 0) {
      throw new Error("Kartu untuk rarity ini tidak ditemukan");
    }

    const wonCard =
      candidateCards[Math.floor(Math.random() * candidateCards.length)];

    const { error: coinErr } = await supabaseAdmin
      .from("players")
      .update({ jumlah_koin: player.jumlah_koin - SPIN_COST })
      .eq("id", player_id);
    if (coinErr) throw coinErr;

    const { data: existingCard } = await supabaseAdmin
      .from("player_cards")
      .select("*")
      .eq("player_id", player_id)
      .eq("card_id", wonCard.id)
      .single();

    if (existingCard) {
      await supabaseAdmin
        .from("player_cards")
        .update({ jumlah: existingCard.jumlah + 1 })
        .eq("id", existingCard.id);
    } else {
      await supabaseAdmin
        .from("player_cards")
        .insert({ player_id, card_id: wonCard.id, jumlah: 1 });
    }

    await supabaseAdmin
      .from("spin_history")
      .insert({ player_id, card_id: wonCard.id });

    return Response.json({
      card: wonCard,
      sisa_koin: player.jumlah_koin - SPIN_COST,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
    }
        
