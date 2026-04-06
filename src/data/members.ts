export interface Member {
  id: string;
  name: string;
  nickname: string;
  team: 'LOVE' | 'DREAM' | 'PASSION' | 'TRAINEE';
  generation: number;
  status: 'MEMBER' | 'TRAINEE';
  image: string;
  color: string;
}

export const members: Member[] = [
  // ═══ TEAM LOVE ═══
  // Gen 3
  { id: "feni", name: "Feni Fitriyanti", nickname: "Feni", team: "LOVE", generation: 3, status: "MEMBER", image: "/members/feni_fitriyanti.jpg", color: "#E91E63" },
  
  // Gen 8
  { id: "fiony", name: "Fiony Alveria", nickname: "Fiony", team: "LOVE", generation: 8, status: "MEMBER", image: "/members/fiony_alveria.jpg", color: "#E91E63" },

  // Gen 9
  { id: "indah", name: "Indah Cahya", nickname: "Indah", team: "LOVE", generation: 9, status: "MEMBER", image: "/members/indah_cahya.jpg", color: "#E91E63" },

  // Gen 10
  { id: "aurellia", name: "Aurellia", nickname: "Lia", team: "LOVE", generation: 10, status: "MEMBER", image: "/members/aurellia.jpg", color: "#E91E63" },

  // Gen 11
  { id: "alya", name: "Alya Amanda", nickname: "Alya", team: "LOVE", generation: 11, status: "MEMBER", image: "/members/alya_amanda.jpg", color: "#E91E63" },
  { id: "anindya", name: "Anindya Ramadhani", nickname: "Anindya", team: "LOVE", generation: 11, status: "MEMBER", image: "/members/anindya_ramadhani.jpg", color: "#E91E63" },
  { id: "cathleen", name: "Cathleen Nixie", nickname: "Cathy", team: "LOVE", generation: 11, status: "MEMBER", image: "/members/cathleen_nixie.jpg", color: "#E91E63" },
  { id: "celline", name: "Celline Thefani", nickname: "Elin", team: "LOVE", generation: 11, status: "MEMBER", image: "/members/celline_thefani.jpg", color: "#E91E63" },
  { id: "cynthia", name: "Cynthia Yaputera", nickname: "Cynthia", team: "LOVE", generation: 11, status: "MEMBER", image: "/members/cynthia_yaputera.jpg", color: "#E91E63" },
  { id: "grace", name: "Grace Octaviani", nickname: "Gracie", team: "LOVE", generation: 11, status: "MEMBER", image: "/members/grace_octaviani.jpg", color: "#E91E63" },
  { id: "michelle_a", name: "Michelle Alexandra", nickname: "Michie", team: "LOVE", generation: 11, status: "MEMBER", image: "/members/michelle_alexandra.jpg", color: "#E91E63" },

  // Gen 12
  { id: "aurhel", name: "Aurhel Alana", nickname: "Lana", team: "LOVE", generation: 12, status: "MEMBER", image: "/members/aurhel_alana.jpg", color: "#E91E63" },
  { id: "fritzy", name: "Fritzy Rosmerian", nickname: "Fritzy", team: "LOVE", generation: 12, status: "MEMBER", image: "/members/fritzy_rosmerian.jpg", color: "#E91E63" },
  { id: "hillary", name: "Hillary Abigail", nickname: "Lily", team: "LOVE", generation: 12, status: "MEMBER", image: "/members/hillary_abigail.jpg", color: "#E91E63" },
  { id: "jazzlyn", name: "Jazzlyn Trisha", nickname: "Trisha", team: "LOVE", generation: 12, status: "MEMBER", image: "/members/jazzlyn_trisha.jpg", color: "#E91E63" },
  { id: "nayla", name: "Nayla Suji", nickname: "Nayla", team: "LOVE", generation: 12, status: "MEMBER", image: "/members/nayla_suji.jpg", color: "#E91E63" },

  // ═══ TEAM DREAM ═══
  // Gen 6
  { id: "gita", name: "Gita Sekar Andarini", nickname: "Gita", team: "DREAM", generation: 6, status: "MEMBER", image: "/members/gita_sekar_andarini.jpg", color: "#2196F3" },

  // Gen 7
  { id: "febriola", name: "Febriola Sinambela", nickname: "Olla", team: "DREAM", generation: 7, status: "MEMBER", image: "/members/febriola_sinambela.jpg", color: "#2196F3" },
  { id: "freya", name: "Freya Jayawardana", nickname: "Freya", team: "DREAM", generation: 7, status: "MEMBER", image: "/members/freya_jayawardana.jpg", color: "#2196F3" },
  { id: "helisma", name: "Helisma Putri", nickname: "Eli", team: "DREAM", generation: 7, status: "MEMBER", image: "/members/helisma_putri.jpg", color: "#2196F3" },

  // Gen 9
  { id: "marsha", name: "Marsha Lenathea", nickname: "Marsha", team: "DREAM", generation: 9, status: "MEMBER", image: "/members/marsha_lenathea.jpg", color: "#2196F3" },

  // Gen 10
  { id: "gabriela", name: "Gabriela Abigail", nickname: "Ella", team: "DREAM", generation: 10, status: "MEMBER", image: "/members/gabriela_abigail.jpg", color: "#2196F3" },
  { id: "jesslyn", name: "Jesslyn Elly", nickname: "Lyn", team: "DREAM", generation: 10, status: "MEMBER", image: "/members/jesslyn_elly.jpg", color: "#2196F3" },

  // Gen 11
  { id: "chelsea", name: "Chelsea Davina", nickname: "Chelsea", team: "DREAM", generation: 11, status: "MEMBER", image: "/members/chelsea_davina.jpg", color: "#2196F3" },
  { id: "greesella", name: "Greesella Adhalia", nickname: "Greesel", team: "DREAM", generation: 11, status: "MEMBER", image: "/members/greesella_adhalia.jpg", color: "#2196F3" },

  // Gen 12
  { id: "adeline", name: "Adeline Wijaya", nickname: "Delynn", team: "DREAM", generation: 12, status: "MEMBER", image: "/members/adeline_wijaya.jpg", color: "#2196F3" },
  { id: "nina", name: "Nina Tutachia", nickname: "Nachia", team: "DREAM", generation: 12, status: "MEMBER", image: "/members/nina_tutachia.jpg", color: "#2196F3" },
  { id: "oline", name: "Oline Manuel", nickname: "Oline", team: "DREAM", generation: 12, status: "MEMBER", image: "/members/oline_manuel.jpg", color: "#2196F3" },
  { id: "shabilqis", name: "Shabilqis Naila", nickname: "Nala", team: "DREAM", generation: 12, status: "MEMBER", image: "/members/shabilqis_naila.jpg", color: "#2196F3" },

  // ═══ TEAM PASSION ═══
  // Gen 7
  { id: "angelina", name: "Angelina Christy", nickname: "Christy", team: "PASSION", generation: 7, status: "MEMBER", image: "/members/angelina_christy.jpg", color: "#FF5722" },
  { id: "jessica", name: "Jessica Chandra", nickname: "Jessi", team: "PASSION", generation: 7, status: "MEMBER", image: "/members/jessica_chandra.jpg", color: "#FF5722" },
  { id: "mutiara", name: "Mutiara Azzahra", nickname: "Muthe", team: "PASSION", generation: 7, status: "MEMBER", image: "/members/mutiara_azzahra.jpg", color: "#FF5722" },

  // Gen 8
  { id: "cornelia", name: "Cornelia Vanisa", nickname: "Oniel", team: "PASSION", generation: 8, status: "MEMBER", image: "/members/cornelia_vanisa.jpg", color: "#FF5722" },
  { id: "lulu", name: "Lulu Salsabila", nickname: "Lulu", team: "PASSION", generation: 8, status: "MEMBER", image: "/members/lulu_salsabila.jpg", color: "#FF5722" },

  // Gen 9
  { id: "kathrina", name: "Kathrina Irene", nickname: "Kathrina", team: "PASSION", generation: 9, status: "MEMBER", image: "/members/kathrina_irene.jpg", color: "#FF5722" },

  // Gen 10
  { id: "raisha", name: "Raisha Syifa", nickname: "Raisha", team: "PASSION", generation: 10, status: "MEMBER", image: "/members/raisha_syifa.jpg", color: "#FF5722" },

  // Gen 11
  { id: "dena", name: "Dena Natalia", nickname: "Danella", team: "PASSION", generation: 11, status: "MEMBER", image: "/members/dena_natalia.jpg", color: "#FF5722" },
  { id: "desy", name: "Desy Natalia", nickname: "Daisy", team: "PASSION", generation: 11, status: "MEMBER", image: "/members/desy_natalia.jpg", color: "#FF5722" },
  { id: "gendis", name: "Gendis Mayrannisa", nickname: "Gendis", team: "PASSION", generation: 11, status: "MEMBER", image: "/members/gendis_mayrannisa.jpg", color: "#FF5722" },

  // Gen 12
  { id: "abigail", name: "Abigail Rachel", nickname: "Aralie", team: "PASSION", generation: 12, status: "MEMBER", image: "/members/abigail_rachel.jpg", color: "#FF5722" },
  { id: "catherina", name: "Catherina Vallencia", nickname: "Erine", team: "PASSION", generation: 12, status: "MEMBER", image: "/members/catherina_vallencia.jpg", color: "#FF5722" },
  { id: "michelle_l", name: "Michelle Levia", nickname: "Levi", team: "PASSION", generation: 12, status: "MEMBER", image: "/members/michelle_levia.jpg", color: "#FF5722" },
  { id: "ribka", name: "Ribka Budiman", nickname: "Ribka", team: "PASSION", generation: 12, status: "MEMBER", image: "/members/ribka_budiman.jpg", color: "#FF5722" },
  { id: "victoria", name: "Victoria Kimberly", nickname: "Kimmy", team: "PASSION", generation: 12, status: "MEMBER", image: "/members/victoria_kimberly.jpg", color: "#FF5722" },

  // ═══ TRAINEE ═══
  // Gen 13
  { id: "astrella", name: "Astrella Virgiananda", nickname: "Virgi", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Astrella_Virgiananda.jpg", color: "#9C27B0" },
  { id: "aulia", name: "Aulia Riza", nickname: "Auwia", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Aulia_Riza.jpg", color: "#9C27B0" },
  { id: "bong", name: "Bong Aprilli", nickname: "Rilly", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Bong_Aprilli.jpg", color: "#9C27B0" },
  { id: "hagia", name: "Hagia Sopia", nickname: "Giaa", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Hagia_Sopia.jpg", color: "#9C27B0" },
  { id: "humaira", name: "Humaira Ramadhani", nickname: "Maira", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Humaira_Ramadhani.jpg", color: "#9C27B0" },
  { id: "jacqueline", name: "Jacqueline Immanuela", nickname: "Ekin", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Jacqueline_Immanuela.jpg", color: "#9C27B0" },
  { id: "jemima", name: "Jemima Evodie", nickname: "Jemima", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Jemima_Evodie.jpg", color: "#9C27B0" },
  { id: "mikaela", name: "Mikaela Kusjanto", nickname: "Mikaela", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Mikaela_Kusjanto.jpg", color: "#9C27B0" },
  { id: "nurintan", name: "Nur Intan", nickname: "Intan", team: "TRAINEE", generation: 13, status: "TRAINEE", image: "/members/Nur_Intan.jpg", color: "#9C27B0" },

  // Gen 14
  { id: "afera", name: "Afera Thalia", nickname: "Fera", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/afera_thalia.jpg", color: "#9C27B0" },
  { id: "carissa", name: "Carissa Dini", nickname: "Carissa", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/carissa_dini.jpg", color: "#9C27B0" },
  { id: "christabella", name: "Christabella Bonita", nickname: "Bella", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/christabella_bonita.jpg", color: "#9C27B0" },
  { id: "fahira", name: "Fahira Putri", nickname: "Fahira", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/fahira_putri.jpg", color: "#9C27B0" },
  { id: "fatimah", name: "Fatimah Azzahra", nickname: "Rara", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/fatimah_azzahra.jpg", color: "#9C27B0" },
  { id: "heidi", name: "Heidi Suyangga", nickname: "Heidi", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/heidi_suyangga.jpg", color: "#9C27B0" },
  { id: "maxine", name: "Maxine Faye", nickname: "Maxine", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/maxine_faye_lee.jpg", color: "#9C27B0" },
  { id: "putry", name: "Putry Jazyta", nickname: "Jazzy", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/putry_jazyta.jpg", color: "#9C27B0" },
  { id: "ralyne", name: "Ralyne Van Irwan", nickname: "Ralyne", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/ralyne_van_irwan.jpg", color: "#9C27B0" },
  { id: "sona", name: "Sona Kalyana", nickname: "Sona", team: "TRAINEE", generation: 14, status: "TRAINEE", image: "/members/sona_kalyana.jpg", color: "#9C27B0" },
];

// Filter types
export interface MemberFilter {
  teams: string[];
  generations: number[];
  statuses: string[];
}

export const TEAMS = ['LOVE', 'DREAM', 'PASSION', 'TRAINEE'] as const;
export const GENERATIONS = [3, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;
export const STATUSES = ['MEMBER', 'TRAINEE'] as const;

export const TEAM_COLORS: Record<string, string> = {
  LOVE: '#E91E63',
  DREAM: '#2196F3',
  PASSION: '#FF5722',
  TRAINEE: '#9C27B0',
};

export function filterMembers(filter: MemberFilter): Member[] {
  return members.filter(m => {
    const teamMatch = filter.teams.length === 0 || filter.teams.includes(m.team);
    const genMatch = filter.generations.length === 0 || filter.generations.includes(m.generation);
    const statusMatch = filter.statuses.length === 0 || filter.statuses.includes(m.status);
    return teamMatch && genMatch && statusMatch;
  });
}
