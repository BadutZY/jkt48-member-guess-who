export interface GameItem {
  id: string;
  name: string;
  image: string;
  subtitle: string;
  subtitleIcon?: string;
  detail?: string;
  color: string;
}

export type GameMode = "member";
