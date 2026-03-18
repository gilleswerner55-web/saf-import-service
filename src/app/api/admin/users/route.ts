import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return data.user;
}

async function isSuperAdmin(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .single();

  return !!data;
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const superAdmin = await isSuperAdmin(user.id);

  if (!superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();

  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("Failed to list auth users:", authError);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }

  const userIds = authUsers.users.map((u) => u.id);

  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", userIds);

  if (rolesError) {
    console.error("Failed to load user roles:", rolesError);
    return NextResponse.json(
      { error: "Failed to load user roles" },
      { status: 500 }
    );
  }

  const { data: clubAdmins, error: clubAdminsError } = await supabase
    .from("club_admins")
    .select("user_id, club_id, role")
    .in("user_id", userIds);

  if (clubAdminsError) {
    console.error("Failed to load club admins:", clubAdminsError);
    return NextResponse.json(
      { error: "Failed to load club admins" },
      { status: 500 }
    );
  }

  const clubIds = [...new Set((clubAdmins ?? []).map((c) => c.club_id))];

  let clubsById: Record<string, { id: string; name: string }> = {};

  if (clubIds.length > 0) {
    const { data: clubs, error: clubsError } = await supabase
      .from("clubs")
      .select("id, name")
      .in("id", clubIds);

    if (clubsError) {
      console.error("Failed to load clubs:", clubsError);
      return NextResponse.json(
        { error: "Failed to load clubs" },
        { status: 500 }
      );
    }

    clubsById = Object.fromEntries((clubs ?? []).map((c) => [c.id, c]));
  }

  const rolesByUserId = new Map<string, string[]>();
  for (const row of userRoles ?? []) {
    const existing = rolesByUserId.get(row.user_id) ?? [];
    existing.push(row.role);
    rolesByUserId.set(row.user_id, existing);
  }

  const clubsByUserId = new Map<
    string,
    { club_id: string; club_name: string | null; role: string }[]
  >();

  for (const row of clubAdmins ?? []) {
    const existing = clubsByUserId.get(row.user_id) ?? [];
    existing.push({
      club_id: row.club_id,
      club_name: clubsById[row.club_id]?.name ?? null,
      role: row.role,
    });
    clubsByUserId.set(row.user_id, existing);
  }

  const result = authUsers.users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    roles: rolesByUserId.get(u.id) ?? [],
    club_assignments: clubsByUserId.get(u.id) ?? [],
  }));

  return NextResponse.json(result);
}