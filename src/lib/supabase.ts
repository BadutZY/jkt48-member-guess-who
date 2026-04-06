import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Room {
  id: string;
  code: string;
  player1_id: string;
  player1_name: string;
  player1_secret: string | null;
  player1_ready: boolean;
  player1_online: boolean;
  player2_id: string | null;
  player2_name: string | null;
  player2_secret: string | null;
  player2_ready: boolean;
  player2_online: boolean;
  mode: string | null;
  status: 'waiting' | 'selecting' | 'playing' | 'finished';
  countdown_started_at: string | null;
  game_state: GameState | null;
  created_at: string;
}

export interface GameState {
  mode: string;
  player1_guesses: number;
  player2_guesses: number;
  player1_eliminated: string[];
  player2_eliminated: string[];
  player1_correct: boolean;
  player2_correct: boolean;
  winner: 'player1' | 'player2' | 'draw' | null;
  surrendered: string | null;
  turn_actions: TurnAction[];
  last_guess_action: LastGuessAction | null;
  current_turn: 'player1' | 'player2';
  turn_changed_at: string | null;
}

export interface LastGuessAction {
  by: 'player1' | 'player2';
  item_id: string;
  item_name: string;
  item_image: string;
  item_color: string;
  is_correct: boolean;
  timestamp: string;
}

export interface TurnAction {
  type: 'guess' | 'correct' | 'wrong' | 'surrender' | 'disconnect';
  player: 'player1' | 'player2';
  item_id?: string;
  item_name?: string;
  timestamp: string;
}
