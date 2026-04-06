import { GameItem } from '@/types/game';
import { members, filterMembers, MemberFilter, TEAM_COLORS } from '@/data/members';

export function getItemsForMode(mode: string): GameItem[] {
  // mode is a JSON string with filter config, or "all" for all members
  let filteredMembers = members;

  if (mode && mode !== 'all') {
    try {
      const filter: MemberFilter = JSON.parse(mode);
      filteredMembers = filterMembers(filter);
    } catch {
      // fallback to all members
      filteredMembers = members;
    }
  }

  return filteredMembers.map(m => ({
    id: m.id,
    name: m.nickname,
    image: m.image,
    subtitle: m.team === 'TRAINEE' ? 'Trainee' : `Team ${m.team.charAt(0) + m.team.slice(1).toLowerCase()}`,
    detail: `Gen ${m.generation}`,
    color: TEAM_COLORS[m.team] || '#E91E63',
  }));
}

export function getModeImageMode(_mode: string): 'contain' | 'cover' {
  return 'cover';
}
