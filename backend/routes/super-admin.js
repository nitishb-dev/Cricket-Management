import { Router } from "express";
import { supabase } from "../db.js";
import { authenticateSuperAdmin } from "./super-admin-auth.js";
import { superAdminSecurityCheck } from "../middleware/superAdminSecurity.js";

const router = Router();

// Apply security checks first, then authentication
router.use(superAdminSecurityCheck);
router.use(authenticateSuperAdmin);

// Get all clubs with their admin details and statistics
router.get("/clubs", async (req, res, next) => {
  try {
    const { data: clubs, error } = await supabase
      .from("clubs")
      .select(`
        *,
        admins (
          id,
          username,
          admin_name,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get statistics for each club
    const clubsWithStats = await Promise.all(
      clubs.map(async (club) => {
        // Get player count
        const { count: playerCount } = await supabase
          .from("players")
          .select("*", { count: "exact", head: true })
          .eq("club_id", club.id);

        // Get match count
        const { count: matchCount } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("club_id", club.id);

        // Get last activity (most recent match)
        const { data: lastMatch } = await supabase
          .from("matches")
          .select("match_date")
          .eq("club_id", club.id)
          .order("match_date", { ascending: false })
          .limit(1);

        return {
          ...club,
          stats: {
            playerCount: playerCount || 0,
            matchCount: matchCount || 0,
            lastActivity: lastMatch?.[0]?.match_date || null
          }
        };
      })
    );

    res.json(clubsWithStats);
  } catch (err) {
    next(err);
  }
});

// Get detailed club information
router.get("/clubs/:clubId", async (req, res, next) => {
  try {
    const { clubId } = req.params;

    // Get club with admin details
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select(`
        *,
        admins (
          id,
          username,
          admin_name,
          created_at
        )
      `)
      .eq("id", clubId)
      .single();

    if (clubError || !club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Get detailed statistics
    const [
      { count: playerCount },
      { count: matchCount },
      { data: lastMatch },
      { data: totalRuns },
      { data: totalWickets }
    ] = await Promise.all([
      supabase.from("players").select("*", { count: "exact", head: true }).eq("club_id", clubId),
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("club_id", clubId),
      supabase.from("matches").select("match_date").eq("club_id", clubId).order("match_date", { ascending: false }).limit(1),
      supabase.from("matches").select("team_a_score, team_b_score").eq("club_id", clubId),
      supabase.from("matches").select("team_a_wickets, team_b_wickets").eq("club_id", clubId)
    ]);

    // Calculate total runs and wickets
    let totalRunsCount = 0;
    let totalWicketsCount = 0;

    if (totalRuns) {
      totalRunsCount = totalRuns.reduce((sum, match) => {
        return sum + (match.team_a_score || 0) + (match.team_b_score || 0);
      }, 0);
    }

    if (totalWickets) {
      totalWicketsCount = totalWickets.reduce((sum, match) => {
        return sum + (match.team_a_wickets || 0) + (match.team_b_wickets || 0);
      }, 0);
    }

    res.json({
      ...club,
      stats: {
        playerCount: playerCount || 0,
        matchCount: matchCount || 0,
        lastActivity: lastMatch?.[0]?.match_date || null,
        totalRuns: totalRunsCount,
        totalWickets: totalWicketsCount,
        averageScore: matchCount > 0 ? Math.round(totalRunsCount / (matchCount * 2)) : 0
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get all players for a specific club
router.get("/clubs/:clubId/players", async (req, res, next) => {
  try {
    const { clubId } = req.params;

    // Verify club exists
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("id")
      .eq("id", clubId)
      .single();

    if (clubError || !club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Get all players for the club
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id, name, username, created_at")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });

    if (playersError) throw playersError;

    // Get stats for each player
    const playersWithStats = await Promise.all(
      (players || []).map(async (player) => {
        // Get match participation and stats from match_player_stats table
        const { data: playerStats } = await supabase
          .from("match_player_stats")
          .select("runs, wickets")
          .eq("player_id", player.id);

        const matchesPlayed = playerStats?.length || 0;
        const runsScored = playerStats?.reduce((sum, stat) => sum + (stat.runs || 0), 0) || 0;
        const wicketsTaken = playerStats?.reduce((sum, stat) => sum + (stat.wickets || 0), 0) || 0;

        return {
          ...player,
          stats: {
            matchesPlayed,
            runsScored,
            wicketsTaken,
            average: matchesPlayed > 0 ? Math.round((runsScored / matchesPlayed) * 100) / 100 : 0
          }
        };
      })
    );

    res.json(playersWithStats);
  } catch (err) {
    next(err);
  }
});

// Get all matches for a specific club
router.get("/clubs/:clubId/matches", async (req, res, next) => {
  try {
    const { clubId } = req.params;

    // Verify club exists
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("id")
      .eq("id", clubId)
      .single();

    if (clubError || !club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Get all matches for the club
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        team_a_name,
        team_b_name,
        match_date,
        is_completed,
        winner,
        team_a_score,
        team_b_score,
        team_a_wickets,
        team_b_wickets
      `)
      .eq("club_id", clubId)
      .order("match_date", { ascending: false });

    if (matchesError) throw matchesError;

    // Format matches for frontend
    const formattedMatches = (matches || []).map(match => ({
      id: match.id,
      team1: match.team_a_name,
      team2: match.team_b_name,
      date: match.match_date,
      status: match.is_completed ? 'completed' : 'ongoing',
      winner: match.winner,
      total_runs: (match.team_a_score || 0) + (match.team_b_score || 0),
      total_wickets: (match.team_a_wickets || 0) + (match.team_b_wickets || 0)
    }));

    res.json(formattedMatches);
  } catch (err) {
    next(err);
  }
});

// Delete a club (CASCADE will delete all related data)
router.delete("/clubs/:clubId", async (req, res, next) => {
  try {
    const { clubId } = req.params;

    // Prevent deletion of default club
    if (clubId === '00000000-0000-0000-0000-000000000001') {
      return res.status(400).json({ 
        error: "Cannot delete the default club" 
      });
    }

    // Get club details before deletion
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("name")
      .eq("id", clubId)
      .single();

    if (clubError || !club) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Delete the club (CASCADE will handle related data)
    const { error: deleteError } = await supabase
      .from("clubs")
      .delete()
      .eq("id", clubId);

    if (deleteError) throw deleteError;

    res.json({ 
      message: `Club "${club.name}" and all associated data deleted successfully` 
    });

  } catch (err) {
    next(err);
  }
});

// Suspend/Activate a club admin
router.patch("/clubs/:clubId/admin/status", async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { isActive } = req.body;

    // Note: We don't have is_active field in admins table yet
    // For now, we can delete/recreate or add this field later
    res.status(501).json({ 
      message: "Admin suspension feature will be implemented in next update" 
    });

  } catch (err) {
    next(err);
  }
});

// Get platform statistics
router.get("/stats", async (req, res, next) => {
  try {
    const [
      { count: totalClubs },
      { count: totalPlayers },
      { count: totalMatches },
      { data: recentClubs }
    ] = await Promise.all([
      supabase.from("clubs").select("*", { count: "exact", head: true }),
      supabase.from("players").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase.from("clubs").select("id, name, created_at").order("created_at", { ascending: false }).limit(5)
    ]);

    // Get monthly registration stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: monthlyStats } = await supabase
      .from("clubs")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString());

    // Group by month
    const monthlyRegistrations = {};
    monthlyStats?.forEach(club => {
      const month = new Date(club.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyRegistrations[month] = (monthlyRegistrations[month] || 0) + 1;
    });

    res.json({
      totalClubs: totalClubs || 0,
      totalPlayers: totalPlayers || 0,
      totalMatches: totalMatches || 0,
      recentClubs: recentClubs || [],
      monthlyRegistrations
    });

  } catch (err) {
    next(err);
  }
});

// Search clubs
router.get("/search/clubs", async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: "Search query must be at least 2 characters" 
      });
    }

    const { data: clubs, error } = await supabase
      .from("clubs")
      .select(`
        *,
        admins (
          id,
          username,
          admin_name
        )
      `)
      .or(`name.ilike.%${q}%,admins.admin_name.ilike.%${q}%,admins.username.ilike.%${q}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(clubs || []);

  } catch (err) {
    next(err);
  }
});

export default router;