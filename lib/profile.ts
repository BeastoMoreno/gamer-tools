export const gameOptions = [
  'VALORANT',
  'Counter-Strike 2',
  'Apex Legends',
  'PUBG PC',
  'Overwatch 2',
  'Fortnite',
  'Rainbow Six Siege',
  'Call of Duty / Warzone',
  'Other',
] as const;
export const avatarColors = ['violet', 'mint', 'blue', 'amber', 'pink', 'slate'] as const;
export type GamerProfile = {
  id: string;
  display_name: string;
  username: string | null;
  bio: string;
  region: string;
  platform: 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo' | 'Mobile';
  favorite_games: string[];
  mouse_dpi: number | null;
  main_game: string;
  sensitivity: number | null;
  avatar_color: string;
  updated_at?: string;
};
export function emptyProfile(id: string, name = ''): GamerProfile {
  return {
    id,
    display_name: name.slice(0, 40),
    username: '',
    bio: '',
    region: '',
    platform: 'PC',
    favorite_games: [],
    mouse_dpi: null,
    main_game: '',
    sensitivity: null,
    avatar_color: 'violet',
  };
}
export function profileError(profile: GamerProfile): string | null {
  if (!profile.display_name.trim() || profile.display_name.trim().length > 40)
    return 'Use a display name between 1 and 40 characters.';
  if (profile.username && !/^[a-z0-9_]{3,24}$/.test(profile.username))
    return 'Your handle needs 3–24 lowercase letters, numbers, or underscores.';
  if (profile.bio.length > 300 || profile.region.length > 40)
    return 'Keep your bio under 301 characters and your region under 41 characters.';
  if (
    profile.mouse_dpi !== null &&
    (!Number.isInteger(profile.mouse_dpi) || profile.mouse_dpi < 100 || profile.mouse_dpi > 100000)
  )
    return 'DPI must be a whole number between 100 and 100,000.';
  if (
    profile.sensitivity !== null &&
    (!Number.isFinite(profile.sensitivity) ||
      profile.sensitivity <= 0 ||
      profile.sensitivity > 1000)
  )
    return 'Sensitivity must be greater than 0 and no more than 1,000.';
  if (profile.favorite_games.length > 8) return 'Choose up to eight favorite games.';
  return null;
}
