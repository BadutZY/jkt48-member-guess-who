import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Plus, LogIn, User, Check, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRoom } from '@/contexts/RoomContext';
import { toast } from 'sonner';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const Lobby = () => {
  const navigate  = useNavigate();
  const { playerId, playerName, setPlayerName, setRoom, room, isRestoring } = useRoom();
  const [joinCode, setJoinCode] = useState('');
  const [loading,  setLoading]  = useState<'create' | 'join' | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    if (isRestoring) return;
    if (!room) return;
    if (room.status === 'playing') {
      navigate('/game');
    } else {
      navigate('/room');
    }
  }, [room, isRestoring, navigate]);

  const handleCreate = async () => {
    if (!playerName.trim()) { toast.error('Masukkan nama kamu dulu!'); return; }
    setLoading('create');
    try {
      const code = generateRoomCode();
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          code,
          player1_id: playerId,     player1_name: playerName.trim(),
          player1_secret: null,     player1_ready: false, player1_online: true,
          player2_id: null,         player2_name: null,
          player2_secret: null,     player2_ready: false, player2_online: false,
          mode: null, status: 'waiting', game_state: null, countdown_started_at: null,
        })
        .select().single();
      if (error) throw error;
      setRoom(data);
      navigate('/room');
    } catch {
      toast.error('Gagal membuat room. Coba lagi.');
    } finally {
      setLoading(null);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) { toast.error('Masukkan nama kamu dulu!'); return; }
    if (joinCode.trim().length < 4) { toast.error('Masukkan kode room yang valid!'); return; }
    setLoading('join');
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('rooms').select().eq('code', joinCode.toUpperCase().trim()).single();
      if (fetchErr || !existing) { toast.error('Room tidak ditemukan!'); return; }
      if (existing.player2_id && existing.player2_id !== playerId) { toast.error('Room sudah penuh!'); return; }
      if (existing.player1_id === playerId) { setRoom(existing); navigate('/room'); return; }

      const { data, error } = await supabase
        .from('rooms')
        .update({ player2_id: playerId, player2_name: playerName.trim(), player2_online: true, status: 'selecting' })
        .eq('id', existing.id).select().single();
      if (error) throw error;
      setRoom(data);
      navigate('/room');
    } catch {
      toast.error('Gagal bergabung ke room. Coba lagi.');
    } finally {
      setLoading(null);
    }
  };

  if (isRestoring) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-display">Memulihkan sesi...</p>
      </div>
    );
  }

  if (room) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated bg */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary" />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
        <div className="absolute top-1/4 left-10 w-64 h-64 border border-primary/20 rotate-45 animate-[spin_60s_linear_infinite]" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 border border-accent/20 rotate-12 animate-[spin_45s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10 animate-[spin_90s_linear_infinite]" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full py-8">
        <div className="mb-2 animate-slide-up">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-float" />
          <h1 className="font-display text-6xl sm:text-7xl uppercase tracking-wider text-foreground">
            JKT48<span className="text-primary">GUESS</span>
          </h1>
          <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mt-1">
            Tebak Member · Guess Who · Online
          </p>
        </div>

        <div className="flex items-center gap-3 my-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
          <div className="flex-1 h-px bg-border" />
          <div className="w-2 h-2 bg-primary rotate-45 animate-glow-pulse" />
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Name input */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block text-left">
            Nama Pemain
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value.slice(0, 20))}
              placeholder="Masukkan nama kamu..."
              maxLength={20}
              className="w-full bg-secondary border border-border rounded px-10 py-3 text-foreground font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-300 text-sm"
            />
            {playerName && (
              <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                <Check className="w-4 h-4 text-accent animate-fade-in" />
              </span>
            )}
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-3 mb-5">
          {[
            { Icon: Users,  text: 'Dua pemain, masing-masing di device sendiri' },
            { Icon: Shield, text: 'Pilih member rahasia, tebak milik lawan' },
            { Icon: Heart,  text: 'Max 1 tebakan per giliran — hati-hati!' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-left p-2.5 rounded bg-secondary/50 animate-slide-in-left hover:bg-secondary/80 transition-all duration-300 hover:translate-x-1"
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <item.Icon className="w-4 h-4 text-accent shrink-0" />
              <p className="text-xs text-secondary-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Note */}
        <div
          className="mb-6 rounded border border-accent/20 bg-accent/5 px-4 py-3 animate-slide-up"
          style={{ animationDelay: '480ms' }}
        >
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-accent uppercase tracking-widest font-semibold mb-1">Cara Berinteraksi</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Game ini berbasis giliran bergantian. Untuk komunikasi dengan lawan, gunakan{' '}
                <span className="text-foreground font-medium">Discord</span>,{' '}
                <span className="text-foreground font-medium">WhatsApp</span>, atau platform lainnya secara bersamaan.
                Kamu juga bisa bermain <span className="text-foreground font-medium">secara langsung</span> di satu tempat.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <button
            onClick={handleCreate}
            disabled={loading !== null}
            className="w-full clip-angle bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xl uppercase tracking-widest py-4 transition-all duration-300 hover:shadow-[0_0_30px_hsl(340_82%_52%/0.4)] active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading === 'create'
              ? <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin inline-block" />
              : <Plus className="w-5 h-5" />}
            Buat Room
          </button>

          {!showJoin ? (
            <button
              onClick={() => setShowJoin(true)}
              className="w-full clip-angle bg-secondary hover:bg-secondary/80 text-secondary-foreground font-display text-xl uppercase tracking-widest py-4 transition-all duration-300 hover:shadow-[0_0_20px_hsl(197_71%_52%/0.3)] active:scale-[0.97] flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              Gabung Room
            </button>
          ) : (
            <div className="flex gap-2 animate-scale-in">
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
                placeholder="KODE"
                maxLength={5}
                className="flex-1 bg-secondary border border-border rounded px-4 py-3 text-foreground font-display text-xl tracking-[0.3em] text-center uppercase placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleJoin}
                disabled={loading !== null}
                className="clip-angle bg-accent hover:bg-accent/90 text-accent-foreground font-display text-lg uppercase tracking-widest px-6 py-3 transition-all duration-300 hover:shadow-[0_0_20px_hsl(197_71%_52%/0.4)] active:scale-[0.97] disabled:opacity-50"
              >
                {loading === 'join'
                  ? <span className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin inline-block" />
                  : 'GO'}
              </button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground/50 mt-8 tracking-widest uppercase animate-slide-up" style={{ animationDelay: '700ms' }}>
          JKT48 Guess Who · Online Edition
        </p>
      </div>
    </div>
  );
};

export default Lobby;
