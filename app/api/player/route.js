import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { username } = await request.json();

    if (!username || username.trim().length < 3) {
      return Response.json(
        { error: "Username minimal 3 karakter" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    let { data: existing } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("username", cleanUsername)
      .single();

    if (existing) {
      return Response.json({ player: existing });
    }

    const { data: created, error } = await supabaseAdmin
      .from("players")
      .insert({ username: cleanUsername })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ player: created });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
      }
