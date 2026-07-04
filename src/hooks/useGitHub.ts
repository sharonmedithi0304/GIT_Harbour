import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { GitHubUser, GitHubRepository, DeveloperProfile, Repository } from '../types';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useGitHub() {
  const [user, setUser] = useState<DeveloperProfile | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const fetchRepositories = useCallback(async (userId: string) => {
    try {
      const { data: repos } = await supabase
        .from('repositories')
        .select('*')
        .eq('developer_id', userId)
        .order('stars', { ascending: false });

      if (repos) {
        setRepositories(repos);
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('developer_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        setUser(profile);
        await fetchRepositories(authUser.id);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [fetchRepositories]);

  const saveToDatabase = useCallback(async (userData: GitHubUser, reposData: GitHubRepository[]) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: existingProfile } = await supabase
        .from('developer_profiles')
        .select('id')
        .eq('github_id', userData.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('developer_profiles')
          .update({
            name: userData.name,
            avatar_url: userData.avatar_url,
            bio: userData.bio,
            company: userData.company,
            location: userData.location,
            blog: userData.blog,
            public_repos: userData.public_repos,
            followers: userData.followers,
            following: userData.following,
            updated_at: new Date().toISOString(),
          })
          .eq('github_id', userData.id);
      } else {
        await supabase.from('developer_profiles').insert({
          id: authUser.id,
          github_id: userData.id,
          username: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          bio: userData.bio,
          company: userData.company,
          location: userData.location,
          blog: userData.blog,
          public_repos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
        });
      }

      await fetchProfile();

      const repoRecords = reposData.map((repo) => ({
        developer_id: authUser.id,
        github_id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        size: repo.size,
        topics: repo.topics || [],
        is_fork: repo.fork,
        is_archived: repo.archived,
        visibility: repo.visibility,
        license: repo.license?.spdx_id || null,
        open_issues: repo.open_issues_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
      }));

      await supabase.from('repositories').delete().eq('developer_id', authUser.id);

      for (let i = 0; i < repoRecords.length; i += 10) {
        const batch = repoRecords.slice(i, i + 10);
        await supabase.from('repositories').insert(batch);
      }

      await fetchRepositories(authUser.id);
    } catch (err) {
      console.error('Error saving to database:', err);
    }
  }, [fetchProfile, fetchRepositories]);

  const fetchGitHubData = useCallback(async (accessToken: string) => {
    try {
      setLoading(true);

      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData: GitHubUser = await userResponse.json();

      const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!reposResponse.ok) throw new Error('Failed to fetch repositories');
      const reposData: GitHubRepository[] = await reposResponse.json();

      await saveToDatabase(userData, reposData);

      return { user: userData, repos: reposData };
    } catch (err) {
      console.error('Error fetching GitHub data:', err);
      setError('Failed to fetch GitHub data');
      return null;
    } finally {
      setLoading(false);
    }
  }, [saveToDatabase]);

  const exchangeCodeForToken = useCallback(async (code: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/github-token-exchange`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ code, redirect_uri: redirectUrl }),
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('github_token', data.access_token);
        await fetchGitHubData(data.access_token);
      } else {
        throw new Error(data.error || 'No access token returned');
      }
    } catch (err) {
      console.error('Failed to exchange code for token:', err);
      setError('Failed to authenticate with GitHub');
    }
  }, [fetchGitHubData]);

  useEffect(() => {
    const checkSession = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile();
      }

      // Handle OAuth callback code in URL
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        window.history.replaceState({}, '', '/');
        await exchangeCodeForToken(code);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Wrap in async IIFE to avoid deadlock inside onAuthStateChange
      (async () => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRepositories([]);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, exchangeCodeForToken]);

  const signInWithGitHub = useCallback(() => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub Client ID is not configured. Add VITE_GITHUB_CLIENT_ID to your environment variables.');
      return;
    }

    const redirectUrl = `${window.location.origin}/auth/callback`;
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUrl);
    authUrl.searchParams.set('scope', 'read:user user:email repo');
    authUrl.searchParams.set('state', crypto.randomUUID());

    window.location.href = authUrl.toString();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('github_token');
    setUser(null);
    setRepositories([]);
  }, []);

  const refreshToken = useCallback(async () => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      window.history.replaceState({}, '', '/');
      await exchangeCodeForToken(code);
    }
  }, [exchangeCodeForToken]);

  return {
    user,
    repositories,
    loading,
    error,
    signInWithGitHub,
    signOut,
    refreshToken,
    fetchGitHubData,
    isAuthenticated: !!user,
  };
}
