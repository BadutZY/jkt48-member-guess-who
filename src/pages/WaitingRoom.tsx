import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy, Check, Users, ArrowLeft, Play,
  ChevronRight, Heart, Filter,
} from 'lucide-react';
import { useRoom } from '@/contexts/RoomContext';
import { toast } from 'sonner';
import { GameState } from '@/lib/supabase';
import { getItemsForMode } from '@/lib/gameUtils';
import { TEAMS, GENERATIONS, STATUSES, TEAM_COLORS, MemberFilter } from '@/data/members';

const RestoreScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-muted-foreground text-sm uppercase tracking-widest font-display">Memulihkan sesi...</p>
  </div>
);

const WaitingRoom = () => {
  const navigate = useNavigate();
  const { room, playerNumber, updateRoom, leaveRoom, isRestoring } = useRoom();
  const [copied, setCopied]               = useState(false);
  const [showSecretPicker, setShowSecretPicker] = useState(false);
  const [selectedSecret, setSelectedSecret]     = useState<string | null>(null);
  const [displayCountdown, setDisplayCountdown] = useState<number | null>(null);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef  = useRef(false);

  // Filter state
  const [filterTeams, setFilterTeams] = useState<string[]>([]);
  const [filterGens, setFilterGens] = useState<number[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (isRestoring) return;
    if (!room) navigate('/');
  }, [room, isRestoring, navigate]);

  useEffect(() => {
    if (isRestoring) return;
    if (room?.status === 'playing' && !room.countdown_started_at && !navigatedRef.current) {
      navigatedRef.current = true;
      navigate('/game');
    }
  }, [room?.status, isRestoring, navigate]);

  // Parse filter from room mode when it changes
  useEffect(() => {
    if (room?.mode) {
      try {
        const f: MemberFilter = JSON.parse(room.mode);
        setFilterTeams(f.teams || []);
        setFilterGens(f.generations || []);
        setFilterStatuses(f.statuses || []);
      } catch {
        // mode not set or invalid
      }
    } else {
      setFilterTeams([]);
      setFilterGens([]);
      setFilterStatuses([]);
    }
    setSelectedSecret(null);
    setShowSecretPicker(false);
  }, [room?.mode]);

  // Countdown
  useEffect(() => {
    if (!room?.countdown_started_at) {
      setDisplayCountdown(null);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }
    const tick = () => {
      const startedAt = new Date(room.countdown_started_at!).getTime();
      const elapsed   = (Date.now() - startedAt) / 1000;
      const remaining = Math.ceil(3 - elapsed);
      if (remaining <= 0) {
        setDisplayCountdown(0);
        if (countdownRef.current) clearInterval(countdownRef.current);
      } else {
        setDisplayCountdown(remaining);
      }
    };
    tick();
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(tick, 200);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [room?.countdown_started_at]);

  useEffect(() => {
    if (displayCountdown === 0 && room?.status === 'playing' && !navigatedRef.current) {
      navigatedRef.current = true;
      setTimeout(() => navigate('/game'), 300);
    }
  }, [displayCountdown, room?.status, navigate]);

  if (isRestoring) return <RestoreScreen />;
  if (!room) return null;

  const isPlayer1   = playerNumber === 1;
  const mySecretKey = isPlayer1 ? 'player1_secret' : 'player2_secret';
  const myReadyKey  = isPlayer1 ? 'player1_ready'  : 'player2_ready';
  const mySecret    = room[mySecretKey as keyof typeof room] as string | null;
  const myReady     = room[myReadyKey  as keyof typeof room] as boolean;

  const bothReady  = room.player1_ready && room.player2_ready;
  const bothJoined = !!room.player2_id;

  const currentFilter: MemberFilter = {
    teams: filterTeams,
    generations: filterGens,
    statuses: filterStatuses,
  };
  const modeString = JSON.stringify(currentFilter);
  const modeItems   = getItemsForMode(room.mode || modeString);
  const secretItem  = modeItems.find(i => i.id === mySecret);

  const handleCopy = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Kode room disalin!');
  };

  const toggleFilter = <T,>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleApplyFilter = async () => {
    if (!isPlayer1) return;
    const filter: MemberFilter = { teams: filterTeams, generations: filterGens, statuses: filterStatuses };
    const filterStr = JSON.stringify(filter);
    const items = getItemsForMode(filterStr);
    if (items.length < 2) {
      toast.error('Filter menghasilkan kurang dari 2 member. Ubah filter!');
      return;
    }
    await updateRoom({
      mode: filterStr,
      player1_secret: null, player2_secret: null,
      player1_ready: false,  player2_ready: false,
    });
    toast.success(`${items.length} member dipilih!`);
  };

  const handleLockSecret = async () => {
    if (!selectedSecret) return;
    await updateRoom({ [mySecretKey]: selectedSecret, [myReadyKey]: true });
    setShowSecretPicker(false);
  };

  const handleUnlockSecret = async () => {
    setSelectedSecret(null);
    await updateRoom({ [mySecretKey]: null, [myReadyKey]: false });
  };

  const handleStart = async () => {
    if (!bothReady || !isPlayer1) return;
    const firstTurn: 'player1' | 'player2' = Math.random() < 0.5 ? 'player1' : 'player2';
    const initialState: GameState = {
      mode: room.mode!,
      player1_guesses: 0,     player2_guesses: 0,
      player1_eliminated: [], player2_eliminated: [],
      player1_correct: false, player2_correct: false,
      winner: null, surrendered: null, turn_actions: [],
      last_guess_action: null,
      current_turn: firstTurn,
      turn_changed_at: new Date().toISOString(),
    };
    navigatedRef.current = false;
    await updateRoom({
      countdown_started_at: new Date().toISOString(),
      status: 'playing',
      game_state: initialState,
    });
    setDisplayCountdown(3);
  };

  const handleLeave = async () => {
    await leaveRoom();
    navigate('/');
  };

  const showCountdown = displayCountdown !== null && displayCountdown > 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Countdown overlay */}
      {showCountdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center select-none">
            <div
              key={displayCountdown}
              className="font-display leading-none text-primary animate-scale-in"
              style={{
                fontSize: 'clamp(8rem, 30vw, 14rem)',
                textShadow: '0 0 80px hsl(340 82% 52% / 0.7)',
              }}
            >
              {displayCountdown}
            </div>
            <p className="text-muted-foreground text-base sm:text-lg tracking-widest uppercase mt-4">
              Permainan Dimulai
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between animate-slide-down shrink-0">
        <button onClick={handleLeave} className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl uppercase tracking-widest text-foreground">
            WAITING <span className="text-primary">ROOM</span>
          </h1>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary border border-border px-3 py-1.5 rounded transition-all duration-300 hover:border-primary/50 group"
          >
            <span className="font-display text-lg tracking-[0.3em] text-primary">{room.code}</span>
            {copied
              ? <Check className="w-3.5 h-3.5 text-accent" />
              : <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />}
          </button>
        </div>
        <div className="w-8" />
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-5">

        {/* Player slots */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
          {[
            { name: room.player1_name, ready: room.player1_ready, online: room.player1_online, isMe: playerNumber === 1, label: 'Player 1' },
            { name: room.player2_name, ready: room.player2_ready, online: room.player2_online, isMe: playerNumber === 2, label: 'Player 2' },
          ].map((p, i) => (
            <div
              key={i}
              className={`clip-angle p-0.5 transition-all duration-500 ${
                p.ready ? 'bg-accent/70' : p.name ? 'bg-primary/40' : 'bg-border/40'
              }`}
            >
              <div className="clip-angle bg-card h-full flex flex-col items-center justify-center gap-1.5 py-5 px-3 relative">
                <span className={`absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full ${p.name ? (p.online ? 'bg-accent' : 'bg-muted-foreground/40') : 'bg-transparent'}`} />
                {p.isMe && (
                  <span className="absolute top-2 right-2 text-[8px] text-primary font-display uppercase tracking-widest bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                    KAMU
                  </span>
                )}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                  p.name ? 'border-primary/40 bg-primary/10' : 'border-border bg-secondary/50'
                }`}>
                  <Users className={`w-4 h-4 ${p.name ? 'text-primary' : 'text-muted-foreground/40'}`} />
                </div>
                <p className={`text-sm font-semibold truncate max-w-full ${p.name ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                  {p.name || 'Menunggu...'}
                </p>
                {p.ready && (
                  <span className="text-[9px] text-accent font-display uppercase tracking-widest flex items-center gap-1">
                    <Check className="w-3 h-3" /> Siap
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Section - Only Player 1 can edit */}
        {bothJoined && (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4 text-primary" />
              <span className="font-display text-base uppercase tracking-widest">Filter Member</span>
              {!isPlayer1 && <span className="text-[10px] text-muted-foreground/60 ml-1">(Hanya host yang bisa mengatur)</span>}
            </div>

            {/* Team Filter */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Tim</p>
              <div className="flex flex-wrap gap-2">
                {TEAMS.map(team => {
                  const isActive = filterTeams.includes(team);
                  const teamColor = TEAM_COLORS[team];
                  return (
                    <button
                      key={team}
                      disabled={!isPlayer1}
                      onClick={() => toggleFilter(filterTeams, team, setFilterTeams)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
                        isActive
                          ? 'border-transparent text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                      } ${!isPlayer1 ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                      style={isActive ? { backgroundColor: teamColor, boxShadow: `0 0 12px ${teamColor}60` } : {}}
                    >
                      {team === 'TRAINEE' ? 'Trainee' : `Team ${team.charAt(0) + team.slice(1).toLowerCase()}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generation Filter */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Generasi</p>
              <div className="flex flex-wrap gap-1.5">
                {GENERATIONS.map(gen => {
                  const isActive = filterGens.includes(gen);
                  return (
                    <button
                      key={gen}
                      disabled={!isPlayer1}
                      onClick={() => toggleFilter(filterGens, gen, setFilterGens)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-300 border ${
                        isActive
                          ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_12px_hsl(340_82%_52%/0.4)]'
                          : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                      } ${!isPlayer1 ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                    >
                      {gen}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(status => {
                  const isActive = filterStatuses.includes(status);
                  return (
                    <button
                      key={status}
                      disabled={!isPlayer1}
                      onClick={() => toggleFilter(filterStatuses, status, setFilterStatuses)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
                        isActive
                          ? 'bg-accent border-accent text-accent-foreground shadow-[0_0_12px_hsl(197_71%_52%/0.4)]'
                          : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                      } ${!isPlayer1 ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                    >
                      {status === 'MEMBER' ? 'Member Inti' : 'Trainee'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply filter / member count */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">
                {getItemsForMode(modeString).length} member cocok
              </p>
              {isPlayer1 && (
                <button
                  onClick={handleApplyFilter}
                  className="clip-angle-sm bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm uppercase tracking-widest px-5 py-2 transition-all duration-300 hover:shadow-[0_0_15px_hsl(340_82%_52%/0.4)] active:scale-[0.97]"
                >
                  Terapkan Filter
                </button>
              )}
            </div>

            {room.mode && (
              <div className="text-center text-xs text-accent border border-accent/20 bg-accent/5 rounded px-3 py-2">
                Filter diterapkan — {getItemsForMode(room.mode).length} member aktif
              </div>
            )}
          </div>
        )}

        {/* Secret Picker */}
        {room.mode && bothJoined && !myReady && (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <p className="font-display text-base uppercase tracking-widest text-foreground">
                Pilih <span className="text-primary">Member Rahasiamu</span>
              </p>
              {!showSecretPicker && (
                <button
                  onClick={() => setShowSecretPicker(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-md transition-all duration-300 hover:shadow-[0_0_15px_hsl(340_82%_52%/0.4)] active:scale-[0.97]"
                >
                  Pilih <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {showSecretPicker && (
              <div className="space-y-3 animate-scale-in">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-64 overflow-y-auto pr-1">
                  {getItemsForMode(room.mode).map(item => {
                    const isSelected = selectedSecret === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedSecret(item.id)}
                        className={`relative clip-angle-sm p-0.5 transition-all duration-300 group ${
                          isSelected ? 'bg-primary jkt-glow scale-[1.03]' : 'bg-border hover:bg-muted-foreground/30 hover:scale-[1.03]'
                        }`}
                      >
                        <div className="clip-angle-sm bg-card p-1 flex flex-col items-center gap-0.5 transition-all duration-300 group-hover:bg-secondary">
                          <div
                            className="w-full aspect-square rounded overflow-hidden"
                            style={{ backgroundColor: item.color + '15' }}
                          >
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" loading="lazy" />
                          </div>
                          <span className="text-[9px] font-semibold text-foreground truncate w-full text-center">{item.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedSecret && (
                  <div className="flex items-center gap-3 bg-secondary/50 rounded p-3 animate-scale-in">
                    <div className="w-12 h-12 rounded overflow-hidden border-2 border-primary flex-shrink-0" style={{ backgroundColor: secretItem?.color + '15' }}>
                      <img src={secretItem?.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{secretItem?.name}</p>
                      <p className="text-[10px] text-muted-foreground">{secretItem?.subtitle} · {secretItem?.detail}</p>
                    </div>
                    <button
                      onClick={handleLockSecret}
                      className="clip-angle-sm bg-primary text-primary-foreground font-display text-sm uppercase tracking-widest px-4 py-2 hover:bg-primary/90 transition-all"
                    >
                      Kunci
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* My secret display (locked) */}
        {myReady && secretItem && (
          <div className="animate-scale-in">
            <div className="flex items-center gap-3 bg-accent/10 border border-accent/30 rounded p-3">
              <div className="w-12 h-12 rounded overflow-hidden border-2 border-accent flex-shrink-0">
                <img src={secretItem.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-accent uppercase tracking-widest">Member Rahasiamu</p>
                <p className="text-sm font-semibold text-foreground">{secretItem.name}</p>
              </div>
              <button
                onClick={handleUnlockSecret}
                className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Ubah
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border p-4 shrink-0 animate-slide-up">
        <div className="max-w-2xl mx-auto">
          {isPlayer1 && bothReady ? (
            <button
              onClick={handleStart}
              className="w-full clip-angle bg-accent text-accent-foreground font-display text-xl uppercase tracking-widest py-4 hover:bg-accent/90 transition-all duration-300 hover:shadow-[0_0_25px_hsl(197_71%_52%/0.4)] active:scale-[0.97] flex items-center justify-center gap-3 animate-scale-in"
            >
              <Play className="w-5 h-5" />
              Mulai Permainan
            </button>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-2">
              {!bothJoined
                ? 'Menunggu pemain kedua bergabung...'
                : !room.mode
                ? 'Host sedang mengatur filter member...'
                : !myReady
                ? 'Pilih member rahasiamu untuk siap!'
                : 'Menunggu lawan siap...'}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default WaitingRoom;
