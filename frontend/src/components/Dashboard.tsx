import React, { useEffect, useState } from 'react';
import { Trophy, Users, History, Calendar, Play, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCricket } from '../context/CricketContext';
import dayjs from 'dayjs';
import { PlayerStats } from '../types/cricket';
import { StatsCard } from './StatsCard';
import { Button } from './Button';
import { Avatar } from './Avatar';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { players, matches, loading, getAllPlayerStats } = useCricket();
  const [recentMatches, setRecentMatches] = useState(matches.slice(0, 3));
  const [topStats, setTopStats] = useState<{
    topScorer: PlayerStats | null;
    topWicketTaker: PlayerStats | null;
  }>({
    topScorer: null,
    topWicketTaker: null
  });

  useEffect(() => {
    setRecentMatches(matches.slice(0, 3));
  }, [matches]);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      const stats = await getAllPlayerStats();
      if (stats && stats.length > 0) {
        const scorer = [...stats].sort((a, b) => b.totalRuns - a.totalRuns)[0];
        const wicketTaker = [...stats].sort((a, b) => b.totalWickets - a.totalWickets)[0];
        setTopStats({
          topScorer: scorer?.totalRuns > 0 ? scorer : null,
          topWicketTaker: wicketTaker?.totalWickets > 0 ? wicketTaker : null
        });
      }
    };

    if (matches.length > 0) {
      fetchTopPlayers();
    }
  }, [matches, getAllPlayerStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary rounded-3xl shadow-2xl text-white p-8 sm:p-12">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Trophy className="w-6 h-6 text-accent-300" />
            </div>
            <span className="font-medium text-primary-50">Season 2025</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Manage Your Cricket Club Like a Pro
          </h1>
          <p className="text-lg text-primary-50 mb-8 max-w-xl">
            Track matches, analyze player performance, and build your legacy with our advanced management tools.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-white !text-primary-700 hover:!bg-white border-none shadow-lg hover:shadow-xl font-semibold"
              onClick={() => navigate('/app/new-match')}
              leftIcon={<Play className="w-5 h-5 fill-current text-primary-700" />}
            >
              Start New Match
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              onClick={() => navigate('/app/players')}
            >
              Manage Players
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Players"
          value={players.length}
          icon={Users}
          gradient="from-primary-500 to-primary-700"
          onClick={() => navigate('/app/players')}
        />
        <StatsCard
          title="Matches Played"
          value={matches.length}
          icon={History}
          gradient="from-accent-500 to-accent-700"
          onClick={() => navigate('/app/history')}
        />
        <StatsCard
          title="Active Season"
          value="2025"
          icon={Calendar}
          gradient="from-secondary-500 to-secondary-700"
          onClick={() => navigate('/app/stats')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Recent Matches</h2>
            <Button variant="ghost" onClick={() => navigate('/app/history')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentMatches.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No matches yet</h3>
                <p className="text-slate-500 mt-1">Start a new match to see it here.</p>
              </div>
            ) : (
              recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
                  onClick={() => navigate('/app/history')}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-secondary-50 text-secondary-700 text-xs font-bold uppercase tracking-wider rounded-full">
                        {match.overs} Overs
                      </span>
                      <span className="text-sm text-slate-500">
                        {dayjs(match.match_date).format('MMM D, YYYY')}
                      </span>
                    </div>
                    {match.winner && (
                      <div className="flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                        <Trophy className="w-4 h-4" />
                        {match.winner} Won
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Team A</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{match.team_a_name}</h3>
                        <span className="text-lg font-mono text-primary-600">
                          {match.team_a_score}/{match.team_a_wickets}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-slate-500">Team B</p>
                      <div className="flex items-baseline gap-2 justify-end">
                        <h3 className="text-lg font-bold text-slate-900">{match.team_b_name}</h3>
                        <span className="text-lg font-mono text-primary-600">
                          {match.team_b_score}/{match.team_b_wickets}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Top Performers</h2>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Top Scorer */}
            <div className="p-6 border-b border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-accent-100 text-accent-600 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-900">Orange Cap</span>
                </div>

                {topStats.topScorer ? (
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={topStats.topScorer.player.profilePictureUrl}
                      alt={topStats.topScorer.player.name}
                      size="lg"
                      className="ring-4 ring-accent-50"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{topStats.topScorer.player.name}</p>
                      <p className="text-accent-600 font-bold text-2xl">{topStats.topScorer.totalRuns} <span className="text-sm font-normal text-slate-500">Runs</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No data available</p>
                )}
              </div>
            </div>

            {/* Top Wicket Taker */}
            <div className="p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-900">Purple Cap</span>
                </div>

                {topStats.topWicketTaker ? (
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={topStats.topWicketTaker.player.profilePictureUrl}
                      alt={topStats.topWicketTaker.player.name}
                      size="lg"
                      className="ring-4 ring-secondary-50"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{topStats.topWicketTaker.player.name}</p>
                      <p className="text-secondary-600 font-bold text-2xl">{topStats.topWicketTaker.totalWickets} <span className="text-sm font-normal text-slate-500">Wickets</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
