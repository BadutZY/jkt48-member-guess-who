import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase, Room } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RoomContextType {
  room: Room | null;
  playerId: string;
  playerNumber: 1 | 2 | null;
  playerName: string;
  isRestoring: boolean;          // TRUE saat sedang fetch room dari DB setelah refresh
  setPlayerName: (name: string) => void;
  setRoom: (room: Room | null) => void;
  updateRoom: (updates: Partial<Room>) => Promise<void>;
  leaveRoom: () => Promise<void>;
}

const RoomContext = createContext<RoomContextType | null>(null);

function getPlayerId(): string {
  let id = localStorage.getItem('valoguess_player_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('valoguess_player_id', id);
  }
  return id;
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const [room, setRoomState] = useState<Room | null>(null);
  // isRestoring: true saat ada savedRoomId dan belum selesai di-fetch
  // Ini mencegah redirect prematur ke "/" sebelum restore selesai
  const [isRestoring, setIsRestoring] = useState<boolean>(() => {
    return !!localStorage.getItem('valoguess_room_id');
  });
  const [playerName, setPlayerNameState] = useState<string>(() => {
    return localStorage.getItem('valoguess_name') || '';
  });

  const playerId = getPlayerId();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const playerNumber: 1 | 2 | null = room
    ? room.player1_id === playerId ? 1
      : room.player2_id === playerId ? 2
      : null
    : null;

  const setRoom = (r: Room | null) => setRoomState(r);

  const setPlayerName = (name: string) => {
    setPlayerNameState(name);
    localStorage.setItem('valoguess_name', name);
  };

// ── Restore room setelah refresh ──────────────────────────────────────────
useEffect(() => {
  const restoreRoom = async () => {
    const savedRoomId = localStorage.getItem('valoguess_room_id');
    if (!savedRoomId) {
      setIsRestoring(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rooms')
        .select()
        .eq('id', savedRoomId)
        .single();

      if (error || !data) {
        localStorage.removeItem('valoguess_room_id');
        setIsRestoring(false);
        return;
      }

      const r = data as Room;
      if (r.player1_id === playerId || r.player2_id === playerId) {
        setRoomState(r);
      } else {
        localStorage.removeItem('valoguess_room_id');
      }

      setIsRestoring(false);
    } catch {
      localStorage.removeItem('valoguess_room_id');
      setIsRestoring(false);
    }
  };

  restoreRoom();
}, []);

  // ── Simpan room id ke localStorage ────────────────────────────────────────
  useEffect(() => {
    if (room) {
      localStorage.setItem('valoguess_room_id', room.id);
    } else {
      localStorage.removeItem('valoguess_room_id');
    }
  }, [room?.id]);

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!room) return;

    // Cleanup channel lama jika ada
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        (payload) => { setRoomState(payload.new as Room); }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        () => {
          setRoomState(null);
          localStorage.removeItem('valoguess_room_id');
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [room?.id]);

  // ── Heartbeat: tandai pemain online setiap 5 detik ────────────────────────
  useEffect(() => {
    if (!room || !playerNumber) return;

    const onlineKey = playerNumber === 1 ? 'player1_online' : 'player2_online';

    const beat = async () => {
      await supabase
        .from('rooms')
        .update({ [onlineKey]: true })
        .eq('id', room.id);
    };

    beat();
    heartbeatRef.current = setInterval(beat, 5000);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      // Tandai offline saat unmount (misal navigasi keluar)
      supabase.from('rooms').update({ [onlineKey]: false }).eq('id', room.id);
    };
  }, [room?.id, playerNumber]);

  // ── Deteksi lawan disconnect saat game berlangsung ────────────────────────
  useEffect(() => {
    if (!room || room.status !== 'playing' || !room.game_state) return;
    if (room.game_state.winner !== null) return;

    const opponentOnline = playerNumber === 1 ? room.player2_online : room.player1_online;

    if (opponentOnline === false) {
      const timer = setTimeout(async () => {
        const { data } = await supabase
          .from('rooms').select().eq('id', room.id).single();
        if (!data) return;
        const fresh = data as Room;
        const stillOffline = playerNumber === 1 ? !fresh.player2_online : !fresh.player1_online;
        if (stillOffline && fresh.game_state && !fresh.game_state.winner) {
          const winner = playerNumber === 1 ? 'player1' : 'player2';
          await supabase.from('rooms').update({
            game_state: {
              ...fresh.game_state,
              winner,
              surrendered: playerNumber === 1 ? 'player2' : 'player1',
              turn_actions: [
                ...fresh.game_state.turn_actions,
                {
                  type: 'disconnect',
                  player: playerNumber === 1 ? 'player2' : 'player1',
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          }).eq('id', room.id);
        }
      }, 15000); // 15 detik grace period (3 heartbeat)

      return () => clearTimeout(timer);
    }
  }, [room?.player1_online, room?.player2_online, room?.status, playerNumber]);

  // ── Update room ───────────────────────────────────────────────────────────
  const updateRoom = async (updates: Partial<Room>) => {
    if (!room) return;
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', room.id)
      .select()
      .single();
    if (!error && data) setRoomState(data as Room);
  };

  // ── Keluar room ───────────────────────────────────────────────────────────
  const leaveRoom = async () => {
    if (!room) return;
    if (playerNumber === 1) {
      await supabase.from('rooms').delete().eq('id', room.id);
    } else if (playerNumber === 2) {
      await supabase.from('rooms').update({
        player2_id: null,
        player2_name: null,
        player2_secret: null,
        player2_ready: false,
        player2_online: false,
        status: 'waiting',
      }).eq('id', room.id);
    }
    setRoomState(null);
  };

  return (
    <RoomContext.Provider value={{
      room, playerId, playerNumber, playerName,
      isRestoring,
      setPlayerName, setRoom, updateRoom, leaveRoom,
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within RoomProvider');
  return ctx;
}
