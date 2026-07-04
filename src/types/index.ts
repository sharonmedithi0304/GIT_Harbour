export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  open_issues_count: number;
  license: { spdx_id: string } | null;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface DeveloperProfile {
  id: string;
  github_id: number;
  username: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface Repository {
  id: string;
  developer_id: string;
  github_id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  size: number;
  topics: string[];
  is_fork: boolean;
  is_archived: boolean;
  visibility: string;
  license: string | null;
  open_issues: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export type ShipPart =
  | 'hull'
  | 'bow'
  | 'stern'
  | 'deck'
  | 'mast'
  | 'sails'
  | 'rigging'
  | 'wheel'
  | 'anchor'
  | 'lanterns'
  | 'figurehead'
  | 'windows'
  | 'ornaments'
  | 'name';

export interface ShipAssemblyProgress {
  part: ShipPart;
  progress: number;
  isComplete: boolean;
}

export interface LegendAwakensState {
  phase: 'hidden' | 'approaching' | 'emerging' | 'assembling' | 'revealing' | 'complete';
  fog: number;
  shipOpacity: number;
  cameraPosition: [number, number, number];
  currentPart: ShipPart | null;
  assembledParts: ShipPart[];
  repositoriesLoaded: number;
  totalRepositories: number;
}
