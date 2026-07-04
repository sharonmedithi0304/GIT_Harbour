/*
# Create Developer Tables for GitHarbor

1. New Tables
- `developer_profiles`: Stores GitHub user profile information
  - `id` (uuid, primary key, references auth.users)
  - `github_id` (integer, unique, NOT NULL) - GitHub's user ID
  - `username` (text, NOT NULL) - GitHub username
  - `name` (text, nullable) - Display name
  - `avatar_url` (text, NOT NULL) - Profile avatar
  - `bio` (text, nullable) - User bio
  - `company` (text, nullable)
  - `location` (text, nullable)
  - `blog` (text, nullable) - Personal website
  - `public_repos` (integer, default 0)
  - `followers` (integer, default 0)
  - `following` (integer, default 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- `repositories`: Stores GitHub repository data
  - `id` (uuid, primary key)
  - `developer_id` (uuid, NOT NULL, references developer_profiles, defaults to auth.uid())
  - `github_id` (integer, NOT NULL) - GitHub's repo ID
  - `name` (text, NOT NULL) - Repository name
  - `full_name` (text, NOT NULL) - owner/repo format
  - `description` (text, nullable)
  - `html_url` (text, NOT NULL) - GitHub URL
  - `homepage` (text, nullable) - Project website
  - `language` (text, nullable) - Primary language
  - `stars` (integer, default 0) - Stargazers count
  - `forks` (integer, default 0)
  - `watchers` (integer, default 0)
  - `size` (integer, default 0) - Repo size in KB
  - `topics` (text[], default '{}') - Repository topics
  - `is_fork` (boolean, default false)
  - `is_archived` (boolean, default false)
  - `visibility` (text, default 'public')
  - `license` (text, nullable)
  - `open_issues` (integer, default 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  - `pushed_at` (timestamp)

2. Security
- Enable RLS on both tables
- Owner-scoped CRUD policies: each authenticated user can only access their own data
- developer_profiles.id references auth.users and defaults to auth.uid()
- repositories.developer_id references developer_profiles and defaults to auth.uid()

3. Notes
- The `DEFAULT auth.uid()` ensures inserts work without client-side owner specification
- Separate policies for each CRUD operation (no FOR ALL)
- Indexes on frequently queried columns (github_id, stars, language)
*/

-- Create developer_profiles table
CREATE TABLE IF NOT EXISTS developer_profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  github_id integer UNIQUE NOT NULL,
  username text NOT NULL,
  name text,
  avatar_url text NOT NULL,
  bio text,
  company text,
  location text,
  blog text,
  public_repos integer NOT NULL DEFAULT 0,
  followers integer NOT NULL DEFAULT 0,
  following integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES developer_profiles(id) ON DELETE CASCADE,
  github_id integer NOT NULL,
  name text NOT NULL,
  full_name text NOT NULL,
  description text,
  html_url text NOT NULL,
  homepage text,
  language text,
  stars integer NOT NULL DEFAULT 0,
  forks integer NOT NULL DEFAULT 0,
  watchers integer NOT NULL DEFAULT 0,
  size integer NOT NULL DEFAULT 0,
  topics text[] NOT NULL DEFAULT '{}',
  is_fork boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  visibility text NOT NULL DEFAULT 'public',
  license text,
  open_issues integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  pushed_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_developer_profiles_github_id ON developer_profiles(github_id);
CREATE INDEX IF NOT EXISTS idx_repositories_developer_id ON repositories(developer_id);
CREATE INDEX IF NOT EXISTS idx_repositories_stars ON repositories(stars DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_language ON repositories(language);
CREATE INDEX IF NOT EXISTS idx_repositories_pushed_at ON repositories(pushed_at DESC);

-- Enable RLS
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- Policies for developer_profiles
DROP POLICY IF EXISTS "select_own_profile" ON developer_profiles;
CREATE POLICY "select_own_profile" ON developer_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON developer_profiles;
CREATE POLICY "insert_own_profile" ON developer_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON developer_profiles;
CREATE POLICY "update_own_profile" ON developer_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON developer_profiles;
CREATE POLICY "delete_own_profile" ON developer_profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Policies for repositories
DROP POLICY IF EXISTS "select_own_repositories" ON repositories;
CREATE POLICY "select_own_repositories" ON repositories FOR SELECT
  TO authenticated USING (auth.uid() = developer_id);

DROP POLICY IF EXISTS "insert_own_repositories" ON repositories;
CREATE POLICY "insert_own_repositories" ON repositories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = developer_id);

DROP POLICY IF EXISTS "update_own_repositories" ON repositories;
CREATE POLICY "update_own_repositories" ON repositories FOR UPDATE
  TO authenticated USING (auth.uid() = developer_id) WITH CHECK (auth.uid() = developer_id);

DROP POLICY IF EXISTS "delete_own_repositories" ON repositories;
CREATE POLICY "delete_own_repositories" ON repositories FOR DELETE
  TO authenticated USING (auth.uid() = developer_id);
