import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Flag, Check, X, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { useRoom } from '@/contexts/RoomContext';
import { GameState, LastGuessAction, TurnAction } from '@/lib/supabase';
import { getItemsForMode, getModeImageMode } from '@/lib/gameUtils';

const MAX_GUESSES = 1;

/* ── SVG Icons ─────────────────────────────────────────────────── */
const IconWin = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 mx-auto" stroke="currentColor" strokeWidth={1.3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);
const IconLose = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 mx-auto" stroke="currentColor" strokeWidth={1.3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
  </svg>
);
const IconDraw = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 mx-auto" stroke="currentColor" strokeWidth={1.3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);
const IconDisconnect = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 mx-auto" stroke="currentColor" strokeWidth={1.3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.181 8.68a4.503 4.503 0 011.903 6.405m-9.768-3.782a4.5 4.5 0 016.072-1.505m-.182 7.276l.497.755a4.5 4.5 0 006.843.445l.765-.765m-6.105 2.07a4.5 4.5 0 01-6.843-.445l-.765-.765m0 0a48.667 48.667 0 01-3.064-8.512c-.581-2.738 1.502-5.237 4.195-5.237H9M3 3l18 18" />
  </svg>
);

const RestoreScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-muted-foreground text-sm uppercase tracking-widest font-display">Memulihkan sesi...</p>
  </div>
);

/* ── Alert Tebakan ───────────────────────────────────────────────── */
interface GuessAlertProps {
  action: LastGuessAction;
  myPlayerKey: 'player1' | 'player2';
  imageMode: 'contain' | 'cover';
  guesserName: string;
  onClose: () => void;
}
const GuessAlert = ({ action, myPlayerKey, imageMode, guesserName, onClose }: GuessAlertProps) => {
  const isMine = action.by === myPlayerKey;
  const isCorrect = action.is_correct;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 bg-background/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-sm animate-scale-in clip-angle border-2 ${isCorrect ? 'border-accent/60 bg-card' : 'border-destructive/60 bg-card'}`}>
        <div className={`px-5 pt-5 pb-3 text-center border-b ${isCorrect ? 'border-accent/20' : 'border-destructive/20'}`}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1">
            {isMine ? 'Tebakanmu' : `Tebakan ${guesserName}`}
          </p>
          <p className={`font-display text-4xl sm:text-5xl uppercase tracking-wider ${isCorrect ? 'text-accent' : 'text-destructive'}`}
            style={{ textShadow: isCorrect ? '0 0 24px hsl(197 71% 52% / 0.6)' : '0 0 24px hsl(0 84% 60% / 0.5)' }}>
            {isCorrect ? 'BENAR' : 'SALAH'}
          </p>
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="shrink-0 overflow-hidden flex items-center justify-center"
            style={{ width: 72, height: 72, background: `radial-gradient(circle, ${action.item_color}35 0%, ${action.item_color}08 100%)`, border: `2px solid ${action.item_color}60`, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
            <img src={action.item_image} alt={action.item_name} className={`w-full h-full ${imageMode === 'contain' ? 'object-contain p-2' : 'object-cover'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">{isMine ? 'Kamu menebak' : `${guesserName} menebak`}</p>
            <p className="font-display text-xl sm:text-2xl uppercase leading-tight" style={{ color: action.item_color }}>{action.item_name}</p>
            {isCorrect
              ? <p className="text-[10px] text-accent mt-1">Tebakan tepat sasaran!</p>
              : <p className="text-[10px] text-destructive mt-1">Tebakan meleset.</p>}
          </div>
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose} className={`w-full clip-angle font-display text-base uppercase tracking-widest py-3 transition-all duration-300 active:scale-[0.97] ${isCorrect ? 'bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-[0_0_20px_hsl(174_72%_46%/0.4)]' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'}`}>OK</button>
        </div>
      </div>
    </div>
  );
};

/* ── Alert Giliran ───────────────────────────────────────────────── */
interface TurnAlertProps { playerName: string; onClose: () => void; }
const TurnAlert = ({ playerName, onClose }: TurnAlertProps) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center px-4 bg-background/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xs animate-scale-in clip-angle border-2 border-primary/70 bg-card text-center px-8 py-8">
        <div className="mb-3 flex justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center animate-glow-pulse">
            <Heart className="w-7 h-7 text-primary" />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-1">{playerName}</p>
        <p className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-primary"
          style={{ textShadow: '0 0 24px hsl(340 82% 52% / 0.6)' }}>
          GILIRAN MU
        </p>
        <p className="text-xs text-muted-foreground mt-2">Menebak sekarang!</p>
        <div className="mt-4 h-0.5 bg-border rounded overflow-hidden">
          <div className="h-full bg-primary rounded" style={{ animation: 'shrinkBar 2.8s linear forwards' }} />
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full clip-angle bg-secondary border border-border text-secondary-foreground font-display text-sm uppercase tracking-widest py-2 hover:bg-muted-foreground/20 transition-all duration-200 active:scale-[0.97]"
        >
          OK
        </button>
      </div>
      <style>{`@keyframes shrinkBar { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────── */
const OnlineGameBoard = () => {
  const navigate = useNavigate();
  const { room, playerNumber, updateRoom, isRestoring } = useRoom();
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
  const [pendingGuess, setPendingGuess] = useState<string | null>(null);
  const [guessingMode, setGuessingMode] = useState(false);
  const [shownGuessAlert, setShownGuessAlert] = useState<LastGuessAction | null>(null);
  const lastAlertTimestamp = useRef<string | null>(null);
  const [showTurnAlert, setShowTurnAlert] = useState(false);
  const lastTurnChangedAt = useRef<string | null>(null);
  const pendingTurnAlert = useRef(false);

  // Mengukur tinggi footer secara dinamis agar main tidak tertutup
  const footerRef = useRef<HTMLElement>(null);
  const [footerHeight, setFooterHeight] = useState(72);
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setFooterHeight(e.borderBoxSize?.[0]?.blockSize ?? e.contentRect.height + 2);
    });
    obs.observe(el);
    setFooterHeight(el.getBoundingClientRect().height);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isRestoring) return;
    if (!room) { navigate('/'); return; }
    if (room.status === 'waiting' || room.status === 'selecting') navigate('/room');
  }, [room, isRestoring, navigate]);

  useEffect(() => {
    if (!room?.game_state?.last_guess_action) return;
    const lga = room.game_state.last_guess_action;
    if (lga.timestamp === lastAlertTimestamp.current) return;
    lastAlertTimestamp.current = lga.timestamp;
    setShownGuessAlert(lga);
  }, [room?.game_state?.last_guess_action?.timestamp]);

  useEffect(() => {
    if (!room?.game_state?.turn_changed_at) return;
    const gs = room.game_state as GameState;
    const tca = gs.turn_changed_at;
    if (tca === lastTurnChangedAt.current) return;
    lastTurnChangedAt.current = tca;
    const myKey: 'player1' | 'player2' = playerNumber === 1 ? 'player1' : 'player2';
    if (gs.current_turn === myKey) {
      if (gs.last_guess_action && gs.last_guess_action.timestamp === lastAlertTimestamp.current) {
        pendingTurnAlert.current = true;
      } else {
        setTimeout(() => setShowTurnAlert(true), 400);
      }
    }
  }, [room?.game_state?.turn_changed_at, playerNumber]);

  if (isRestoring) return <RestoreScreen />;
  if (!room || !room.game_state || !room.mode) return null;

  const gs        = room.game_state as GameState;
  const isP1      = playerNumber === 1;
  const myPlayer: 'player1' | 'player2' = isP1 ? 'player1' : 'player2';
  const items     = getItemsForMode(room.mode);
  const imageMode = getModeImageMode(room.mode);

  const myElimKey    = isP1 ? 'player1_eliminated' : 'player2_eliminated';
  const myGuessesKey = isP1 ? 'player1_guesses'    : 'player2_guesses';
  const myCorrectKey = isP1 ? 'player1_correct'     : 'player2_correct';

  const mySecret        = isP1 ? room.player1_secret : room.player2_secret;
  const secretItem      = items.find(i => i.id === mySecret);
  const myEliminated    = new Set(gs[myElimKey as keyof GameState] as string[]);
  const myGuesses       = gs[myGuessesKey as keyof GameState] as number;
  const myCorrect       = gs[myCorrectKey as keyof GameState] as boolean;
  const opponentGuesses = isP1 ? gs.player2_guesses : gs.player1_guesses;
  const opponentCorrect = isP1 ? gs.player2_correct : gs.player1_correct;
  const opponentName    = isP1 ? room.player2_name  : room.player1_name;

  const gameOver   = gs.winner !== null;
  const maxReached = myGuesses >= MAX_GUESSES;
  const remaining  = items.length - myEliminated.size;

  const opponentSecret     = isP1 ? room.player2_secret : room.player1_secret;
  const opponentSecretItem = items.find(i => i.id === opponentSecret);
  const pendingItem        = items.find(i => i.id === pendingGuess);

  const iWon          = gs.winner === myPlayer;
  const isDraw        = gs.winner === 'draw';
  const winnerName    = gs.winner === 'player1' ? room.player1_name : gs.winner === 'player2' ? room.player2_name : null;
  const wasDisconnect = gs.turn_actions?.some(a => a.type === 'disconnect');

  const currentTurn = (gs.current_turn ?? 'player1') as 'player1' | 'player2';
  const isMyTurn    = currentTurn === myPlayer;
  const myName      = isP1 ? room.player1_name : room.player2_name ?? 'Kamu';

  /* ── Handlers ── */
  const handleToggleEliminate = async (id: string) => {
    if (gameOver || !isMyTurn) return;
    if (guessingMode) { setPendingGuess(id); return; }
    if (maxReached || myCorrect) return;
    const next = new Set(myEliminated);
    if (next.has(id)) next.delete(id); else next.add(id);
    await updateRoom({ game_state: { ...gs, [myElimKey]: Array.from(next) } });
  };

  const handleStartGuess = () => {
    if (maxReached || gameOver || myCorrect || !isMyTurn) return;
    setPendingGuess(null);
    setGuessingMode(true);
  };

  const handleCancelGuess = () => {
    setGuessingMode(false);
    setPendingGuess(null);
  };

  // Reset pilihan tapi tetap di mode tebak supaya bisa pilih ulang
  const handleChangeGuess = () => {
    setPendingGuess(null);
    setGuessingMode(true);
  };

  const handleConfirmGuess = async () => {
    if (!pendingGuess) return;
    const guessedItem   = items.find(i => i.id === pendingGuess)!;
    const isCorrect     = pendingGuess === opponentSecret;
    const newGuessCount = myGuesses + 1;

    const action: TurnAction = { type: isCorrect ? 'correct' : 'wrong', player: myPlayer, item_id: pendingGuess, item_name: guessedItem.name, timestamp: new Date().toISOString() };
    const lga: LastGuessAction = { by: myPlayer, item_id: pendingGuess, item_name: guessedItem.name, item_image: guessedItem.image, item_color: guessedItem.color, is_correct: isCorrect, timestamp: new Date().toISOString() };

    const p1guesses = isP1 ? newGuessCount : gs.player1_guesses;
    const p2guesses = isP1 ? gs.player2_guesses : newGuessCount;
    const p1correct = isP1 ? isCorrect : gs.player1_correct;
    const p2correct = isP1 ? gs.player2_correct : isCorrect;

    let winner: GameState['winner'] = null;
    if (p1correct && p2correct)                                                                 winner = 'draw';
    else if (p1correct && p2guesses >= MAX_GUESSES && !p2correct)                               winner = 'player1';
    else if (p2correct && p1guesses >= MAX_GUESSES && !p1correct)                               winner = 'player2';
    else if (p1guesses >= MAX_GUESSES && p2guesses >= MAX_GUESSES && !p1correct && !p2correct)  winner = 'draw';

    const opponentKey: 'player1' | 'player2' = myPlayer === 'player1' ? 'player2' : 'player1';
    const opponentAlreadyLocked = myPlayer === 'player1'
      ? (p2guesses >= MAX_GUESSES || p2correct)
      : (p1guesses >= MAX_GUESSES || p1correct);
    const nextTurn = winner !== null ? currentTurn : opponentAlreadyLocked ? currentTurn : opponentKey;
    const turnChangedAt = winner !== null || opponentAlreadyLocked ? gs.turn_changed_at : new Date().toISOString();

    setPendingGuess(null);
    setGuessingMode(false);
    await updateRoom({ game_state: { ...gs, player1_guesses: p1guesses, player2_guesses: p2guesses, player1_correct: p1correct, player2_correct: p2correct, winner, current_turn: nextTurn, turn_changed_at: turnChangedAt, turn_actions: [...gs.turn_actions, action], last_guess_action: lga } });
  };

  const anyPlayerLocked = myCorrect || maxReached || opponentCorrect || opponentGuesses >= MAX_GUESSES;

  const handleSwitchTurn = async () => {
    if (gameOver || !isMyTurn) return;
    if (anyPlayerLocked) return;
    const nextTurn: 'player1' | 'player2' = currentTurn === 'player1' ? 'player2' : 'player1';
    await updateRoom({ game_state: { ...gs, current_turn: nextTurn, turn_changed_at: new Date().toISOString() } });
  };

  const handleSurrender = async () => {
    const action: TurnAction = { type: 'surrender', player: myPlayer, timestamp: new Date().toISOString() };
    await updateRoom({ game_state: { ...gs, winner: isP1 ? 'player2' : 'player1', surrendered: myPlayer, turn_actions: [...gs.turn_actions, action] } });
    setShowSurrenderConfirm(false);
  };

  const handleBackToRoom = async () => {
    await updateRoom({ status: 'selecting', player1_secret: null, player2_secret: null, player1_ready: false, player2_ready: false, game_state: null, countdown_started_at: null });
    navigate('/room');
  };

  const alertGuesserName = shownGuessAlert?.by === 'player1' ? room.player1_name : room.player2_name ?? '';
  const isInGuessFlow = guessingMode || !!pendingGuess;

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">

      {showTurnAlert && !gameOver && (
        <TurnAlert playerName={myName ?? 'Kamu'} onClose={() => setShowTurnAlert(false)} />
      )}

      {shownGuessAlert && !gameOver && (
        <GuessAlert action={shownGuessAlert} myPlayerKey={myPlayer} imageMode={imageMode} guesserName={alertGuesserName} onClose={() => {
          setShownGuessAlert(null);
          if (pendingTurnAlert.current) {
            pendingTurnAlert.current = false;
            setTimeout(() => setShowTurnAlert(true), 300);
          }
        }} />
      )}

      {showSurrenderConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in px-4">
          <div className="clip-angle bg-card border border-destructive/50 p-6 sm:p-8 max-w-sm w-full animate-scale-in text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Flag className="w-6 h-6 text-destructive" /></div>
            <h2 className="font-display text-3xl uppercase mb-2 text-foreground">Menyerah?</h2>
            <p className="text-muted-foreground text-sm mb-6">Lawan akan dinyatakan menang. Yakin?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSurrenderConfirm(false)} className="flex-1 py-3 border border-border rounded text-muted-foreground hover:text-foreground transition-colors text-sm">Batal</button>
              <button onClick={handleSurrender} className="flex-1 clip-angle bg-destructive text-destructive-foreground font-display text-lg uppercase tracking-wider py-3 hover:bg-destructive/90 transition-all">Menyerah</button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/85 backdrop-blur-sm animate-fade-in px-4">
          <div className="clip-angle bg-card border border-border p-6 sm:p-8 max-w-sm w-full animate-scale-in text-center">
            <div className={`mb-3 ${iWon ? 'text-accent' : isDraw ? 'text-primary' : 'text-muted-foreground'}`}>
              {wasDisconnect && !iWon ? <IconDisconnect /> : iWon ? <IconWin /> : isDraw ? <IconDraw /> : <IconLose />}
            </div>
            <h2 className={`font-display text-5xl sm:text-6xl uppercase tracking-wider mb-3 ${iWon ? 'text-accent' : isDraw ? 'text-primary' : 'text-destructive'}`}
              style={{ textShadow: iWon ? '0 0 30px hsl(197 71% 52% / 0.5)' : isDraw ? '0 0 30px hsl(340 82% 52% / 0.5)' : 'none' }}>
              {isDraw ? 'SERI' : iWon ? 'MENANG' : 'KALAH'}
            </h2>
            {wasDisconnect && <p className="text-muted-foreground text-xs mb-3">{iWon ? 'Lawan keluar dari permainan.' : 'Kamu keluar dari permainan.'}</p>}
            {gs.surrendered && !wasDisconnect && <p className="text-muted-foreground text-xs mb-3">{gs.surrendered === myPlayer ? 'Kamu menyerah.' : `${opponentName} menyerah.`}</p>}
            {!isDraw && winnerName && !gs.surrendered && !wasDisconnect && <p className="text-muted-foreground text-sm mb-3">Pemenang: <span className="text-accent font-semibold">{winnerName}</span></p>}
            <div className="grid grid-cols-2 gap-0 my-4 border border-border rounded overflow-hidden">
              <div className="text-center py-3 px-2 bg-secondary/30">
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1">Tebakanmu</p>
                <p className={`font-display text-2xl ${myCorrect ? 'text-accent' : 'text-destructive'}`}>{myCorrect ? 'BENAR' : 'SALAH'}</p>
              </div>
              <div className="text-center py-3 px-2 bg-secondary/10 border-l border-border">
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1">Tebakan Lawan</p>
                <p className={`font-display text-2xl ${opponentCorrect ? 'text-destructive' : 'text-accent'}`}>{opponentCorrect ? 'BENAR' : 'SALAH'}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-[0.15em]">Item rahasia lawan</p>
            {opponentSecretItem ? (
              <div className="flex items-center gap-3 justify-center mb-5 p-3 bg-secondary/20 rounded">
                <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center shrink-0" style={{ background: opponentSecretItem.color + '20', border: `1.5px solid ${opponentSecretItem.color}60` }}>
                  <img src={opponentSecretItem.image} alt={opponentSecretItem.name} className={`w-full h-full ${imageMode === 'contain' ? 'object-contain p-1.5' : 'object-cover'}`} />
                </div>
                <div className="text-left">
                  <p className="font-display text-xl text-foreground uppercase">{opponentSecretItem.name}</p>
                  <p className="text-xs text-muted-foreground">{opponentSecretItem.subtitle}</p>
                </div>
              </div>
            ) : <p className="text-muted-foreground text-xs mb-5">—</p>}
            <button onClick={handleBackToRoom} className="w-full clip-angle bg-primary text-primary-foreground font-display text-xl uppercase tracking-widest py-3 hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_25px_hsl(355_100%_63%/0.4)] active:scale-[0.97]">Main Lagi</button>
          </div>
        </div>
      )}

      <header className="border-b border-border px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0 animate-slide-down">
        <div className="flex items-center gap-2.5 text-xs min-w-0">
          <span className="text-muted-foreground whitespace-nowrap">Tersisa <span className="text-accent font-bold">{remaining}</span>/{items.length}</span>
          <span className="w-px h-3 bg-border shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Tebakan <span className={`font-bold ${myGuesses >= MAX_GUESSES ? 'text-destructive' : 'text-primary'}`}>{myGuesses}/{MAX_GUESSES}</span></span>
        </div>
        <div className="flex items-center gap-1.5 font-display text-[11px] tracking-wider shrink-0 mx-2">
          <div className="flex items-center gap-1">
            {currentTurn === 'player1' && !gameOver && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
            <span className={`truncate max-w-[70px] sm:max-w-none ${currentTurn === 'player1' && !gameOver ? 'text-primary' : 'text-muted-foreground'}`}>{room.player1_name}</span>
          </div>
          <span className="text-border text-[9px]">VS</span>
          <div className="flex items-center gap-1">
            <span className={`truncate max-w-[70px] sm:max-w-none ${currentTurn === 'player2' && !gameOver ? 'text-primary' : 'text-muted-foreground'}`}>{room.player2_name}</span>
            {currentTurn === 'player2' && !gameOver && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
          </div>
        </div>
        <button onClick={() => setShowSurrenderConfirm(true)} disabled={gameOver || maxReached || myCorrect} className="p-1.5 text-muted-foreground hover:text-destructive transition-all duration-300 disabled:opacity-30 hover:scale-110 shrink-0" title="Menyerah">
          <Flag className="w-4 h-4" />
        </button>
      </header>

      {!gameOver && (
        <div className={`px-4 py-2 text-center text-xs shrink-0 transition-all duration-500 ${isMyTurn ? 'bg-primary/15 border-b border-primary/40 text-primary font-semibold' : 'bg-secondary/30 border-b border-border text-muted-foreground'}`}>
          {isMyTurn ? 'Giliran kamu menebak' : `Giliran ${opponentName ?? 'lawan'} menebak`}
        </div>
      )}

      {secretItem && (
        <div className="border-b border-border shrink-0" style={{ background: `${secretItem.color}08` }}>
          <div className="flex sm:hidden items-center gap-3 px-3 py-2.5">
            <div className="shrink-0 flex items-center justify-center" style={{ width: 60, height: 60, background: `radial-gradient(circle, ${secretItem.color}30 0%, transparent 70%)`, border: `2px solid ${secretItem.color}60`, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <img src={secretItem.image} alt={secretItem.name} className={`w-full h-full ${imageMode === 'contain' ? 'object-contain p-1.5' : 'object-cover'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-0.5">Item Rahasiamu</p>
              <p className="font-display text-lg uppercase leading-tight truncate" style={{ color: secretItem.color }}>{secretItem.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{secretItem.subtitle}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Lawan</p>
              <p className={`font-display text-sm ${opponentCorrect ? 'text-destructive' : opponentGuesses >= MAX_GUESSES ? 'text-muted-foreground' : 'text-foreground'}`}>{opponentCorrect ? 'BENAR' : opponentGuesses >= MAX_GUESSES ? 'SALAH' : `${opponentGuesses}/${MAX_GUESSES}`}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-5 px-5 py-4 max-w-5xl mx-auto">
            <div className="shrink-0 relative overflow-hidden transition-all duration-500 hover:scale-105" style={{ width: 100, height: 100, background: `radial-gradient(circle, ${secretItem.color}30 0%, ${secretItem.color}05 100%)`, border: `2px solid ${secretItem.color}70`, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <img src={secretItem.image} alt={secretItem.name} className={`w-full h-full ${imageMode === 'contain' ? 'object-contain p-2.5' : 'object-cover'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Item Rahasiamu</p>
              <p className="font-display text-3xl uppercase leading-tight" style={{ color: secretItem.color }}>{secretItem.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{secretItem.subtitle}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Tebakan Lawan</p>
              <p className={`font-display text-2xl ${opponentCorrect ? 'text-destructive' : opponentGuesses >= MAX_GUESSES ? 'text-muted-foreground' : 'text-foreground'}`}>{opponentCorrect ? 'BENAR' : opponentGuesses >= MAX_GUESSES ? 'SALAH' : `${opponentGuesses}/${MAX_GUESSES}`}</p>
              {opponentCorrect && <p className="text-destructive text-[10px] font-semibold mt-0.5">Lawan sudah benar!</p>}
            </div>
          </div>
        </div>
      )}

      {/* Banner mode tebak */}
      {guessingMode && !pendingGuess && (
        <div className="bg-primary/10 border-b border-primary/30 px-4 py-2 text-center text-sm text-primary animate-slide-down shrink-0 flex items-center justify-center gap-3">
          <Heart className="w-4 h-4 shrink-0" />
          <span>Mode Tebak — Klik item yang kamu duga milik lawan</span>
        </div>
      )}

      {/* Preview item yang dipilih */}
      {pendingGuess && pendingItem && (
        <div className="border-b border-primary/30 bg-primary/5 animate-scale-in shrink-0">
          <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, background: pendingItem.color + '15', border: `2px solid ${pendingItem.color}60`, clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              <img src={pendingItem.image} alt={pendingItem.name} className={`w-full h-full ${imageMode === 'contain' ? 'object-contain p-1' : 'object-cover'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Item dipilih</p>
              <p className="font-display text-sm uppercase tracking-wider truncate text-primary">{pendingItem.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid — padding-bottom dinamis agar item paling bawah tidak tertutup footer */}
      <main
        className="flex-1 overflow-auto p-2 sm:p-3"
        style={{ paddingBottom: `${footerHeight + 16}px` }}
      >
        {!isMyTurn && !gameOver && (
          <div className="text-center mb-2">
            <p className="text-xs text-muted-foreground/50 italic">Card dinonaktifkan — tunggu giliranmu</p>
          </div>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2 max-w-5xl mx-auto">
          {items.map((item, index) => {
            const isEliminated = myEliminated.has(item.id);
            const isPending    = pendingGuess === item.id;
            const isDisabled   = !isMyTurn && !gameOver;
            return (
              <button
                key={item.id}
                onClick={() => handleToggleEliminate(item.id)}
                disabled={gameOver || (maxReached && !guessingMode && !pendingGuess) || (myCorrect && !guessingMode && !pendingGuess) || (!isMyTurn)}
                title={!isMyTurn ? `Giliran ${opponentName ?? 'lawan'}` : undefined}
                className={`relative clip-angle p-0.5 transition-all duration-300 group animate-slide-up
                  ${isPending    ? 'bg-primary jkt-glow ring-2 ring-primary scale-[1.03]'
                  : isEliminated ? 'bg-border/30 scale-[0.97]'
                  : isDisabled   ? 'bg-border/20 cursor-not-allowed'
                  : (guessingMode || pendingGuess) ? 'bg-border hover:bg-primary/40 hover:scale-[1.03]'
                                 : 'bg-border hover:bg-muted-foreground/30 hover:scale-[1.03]'}
                  disabled:cursor-not-allowed`}
                style={{ animationDelay: `${index * 7}ms` }}
              >
                <div className={`clip-angle bg-card p-1.5 sm:p-2 flex flex-col items-center gap-0.5 transition-all duration-500
                  ${isEliminated ? 'opacity-20 grayscale' : ''}
                  ${isDisabled && !isEliminated ? 'brightness-[0.4] saturate-0' : ''}`}>
                  <div className="w-full aspect-square rounded overflow-hidden flex items-center justify-center" style={{ backgroundColor: isEliminated ? 'hsl(230 10% 15%)' : item.color + '15' }}>
                    <img src={item.image} alt={item.name}
                      className={`${imageMode === 'contain' ? 'h-3/4 w-auto object-contain' : 'w-full h-full object-cover'} transition-all duration-500 ${isEliminated ? 'opacity-30 grayscale blur-[1px]' : !isDisabled ? 'group-hover:scale-110' : ''}`}
                      loading="lazy" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-foreground truncate w-full text-center leading-tight">{item.name}</span>
                  <span className="text-[7px] sm:text-[9px] text-muted-foreground truncate w-full text-center">{item.subtitle}</span>
                </div>

                {isEliminated && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-scale-in">
                    <span className="text-primary/60 text-3xl sm:text-4xl font-display drop-shadow-[0_0_8px_hsl(355_100%_63%/0.5)]">X</span>
                  </div>
                )}

                {isDisabled && !isEliminated && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-background/30 rounded-full p-1">
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-muted-foreground/40" stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </div>
                  </div>
                )}

                {(guessingMode || !!pendingGuess) && !isEliminated && !isDisabled && !isPending && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Heart className="w-5 h-5 text-primary drop-shadow-[0_0_6px_hsl(355_100%_63%/0.9)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* ── STICKY FOOTER ── */}
      <footer ref={footerRef} className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm px-3 py-3">
        <div className="max-w-5xl mx-auto space-y-2">

          {!gameOver && isMyTurn && !myCorrect && !maxReached && (
            <div className="flex gap-2">

              {/* State 1: Tebak Sekarang */}
              {!isInGuessFlow && (
                <button
                  onClick={handleStartGuess}
                  className="flex-1 clip-angle bg-primary text-primary-foreground font-display text-lg uppercase tracking-widest py-3 hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_25px_hsl(355_100%_63%/0.4)] active:scale-[0.97]"
                >
                  <Heart className="w-4 h-4" /> Tebak Sekarang
                </button>
              )}

              {/* State 2: Batal Tebak (belum pilih item) */}
              {isInGuessFlow && !pendingGuess && (
                <button
                  onClick={handleCancelGuess}
                  className="flex-1 clip-angle bg-secondary border border-border text-secondary-foreground font-display text-lg uppercase tracking-widest py-3 hover:bg-muted-foreground/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.97]"
                >
                  <X className="w-4 h-4" /> Batal Tebak
                </button>
              )}

              {/* State 3: Ubah Tebakkan + Kunci Tebakkan */}
              {isInGuessFlow && !!pendingGuess && (
                <>
                  <button
                    onClick={handleChangeGuess}
                    className="clip-angle bg-secondary border border-primary/40 text-primary font-display text-sm uppercase tracking-wider px-3 sm:px-4 py-3 hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-[0.97] shrink-0"
                    title="Ubah pilihan member tebakkan"
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden xs:inline sm:inline whitespace-nowrap">Ubah Tebakkan</span>
                  </button>
                  <button
                    onClick={handleConfirmGuess}
                    className="flex-1 clip-angle bg-primary text-primary-foreground font-display text-lg uppercase tracking-widest py-3 hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_25px_hsl(355_100%_63%/0.4)] active:scale-[0.97]"
                  >
                    <Check className="w-4 h-4" /> Kunci Tebakkan
                  </button>
                </>
              )}

              {/* Tombol Ganti Giliran */}
              <button
                onClick={handleSwitchTurn}
                disabled={anyPlayerLocked || isInGuessFlow}
                title={
                  isInGuessFlow
                    ? 'Tidak bisa ganti giliran saat mode tebak aktif'
                    : anyPlayerLocked
                    ? 'Tidak bisa ganti giliran — jawaban sudah dikunci'
                    : 'Serahkan giliran ke lawan'
                }
                className="clip-angle bg-secondary border border-border text-secondary-foreground font-display text-sm uppercase tracking-wider px-4 py-3 hover:bg-muted-foreground/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-secondary shrink-0"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span className="hidden sm:inline">Ganti</span>
              </button>
            </div>
          )}

          {!gameOver && isMyTurn && (myCorrect || maxReached) && (
            <div className="text-center py-3 text-muted-foreground font-display text-sm uppercase tracking-wider animate-scale-in border border-dashed border-border/30 rounded">
              {myCorrect ? 'Tebakan benar — menunggu lawan menebak' : 'Tebakan habis — menunggu lawan menebak'}
            </div>
          )}

          {!gameOver && !isMyTurn && (
            <div className="text-center py-3 text-muted-foreground font-display text-sm uppercase tracking-wider animate-scale-in border border-dashed border-border/30 rounded">
              Menunggu giliran {opponentName ?? 'lawan'}...
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default OnlineGameBoard;