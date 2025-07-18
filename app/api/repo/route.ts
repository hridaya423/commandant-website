import { NextRequest, NextResponse } from 'next/server';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const REPO_CACHE_DIR = path.join(tmpdir(), 'warlanguage-repos');
const MAX_REPO_SIZE = 100 * 1024 * 1024; 
const ALLOWED_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org'];

const contentCache = new Map<string, { content: string; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; 

interface RepoRequest {
  url: string;
  branch?: string;
  file?: string;
}

function validateRepositoryUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_HOSTS.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

function getCacheKey(url: string, branch: string, file: string): string {
  return `${url}:${branch}:${file}`;
}

function getCachedContent(key: string): string | null {
  const cached = contentCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.content;
  }
  if (cached) {
    contentCache.delete(key);
  }
  return null;
}

function setCachedContent(key: string, content: string): void {
  contentCache.set(key, {
    content,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function getRepositorySize(repoPath: string): Promise<number> {
  try {
    const stats = await fs.stat(repoPath);
    if (!stats.isDirectory()) return 0;
    
    let totalSize = 0;
    const files = await fs.readdir(repoPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(repoPath, file.name);
      if (file.isDirectory()) {
        totalSize += await getRepositorySize(filePath);
      } else {
        const fileStats = await fs.stat(filePath);
        totalSize += fileStats.size;
      }
    }
    
    return totalSize;
  } catch {
    return 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RepoRequest = await request.json();
    const { url, branch = 'master', file = 'index.js' } = body;

    if (!validateRepositoryUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid repository URL or unsupported host' },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(url, branch, file);
    
    const cachedContent = getCachedContent(cacheKey);
    if (cachedContent) {
      return NextResponse.json({ content: cachedContent, cached: true });
    }

    await ensureDirectoryExists(REPO_CACHE_DIR);

    const repoName = url.split('/').slice(-2).join('-').replace('.git', '');
    const repoPath = path.join(REPO_CACHE_DIR, `${repoName}-${branch}`);

    const git = simpleGit();

    try {
      let repoExists = false;
      try {
        await fs.access(repoPath);
        repoExists = true;
      } catch {
      }

      if (repoExists) {
        const repoGit = simpleGit(repoPath);
        await repoGit.fetch();
        await repoGit.checkout(branch);
        await repoGit.pull('origin', branch);
      } else {
        await git.clone(url, repoPath, ['--depth', '1', '--branch', branch]);
      }

      const repoSize = await getRepositorySize(repoPath);
      if (repoSize > MAX_REPO_SIZE) {
        await fs.rm(repoPath, { recursive: true, force: true });
        return NextResponse.json(
          { error: 'Repository size exceeds 100MB limit' },
          { status: 413 }
        );
      }

      const filePath = path.join(repoPath, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        setCachedContent(cacheKey, content);
        
        return NextResponse.json({ content, cached: false });
      } catch (fileError) {
        return NextResponse.json(
          { error: `File '${file}' not found in repository` },
          { status: 404 }
        );
      }

    } catch (gitError) {
      return NextResponse.json(
        { error: `Git operation failed: ${gitError instanceof Error ? gitError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Repository API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const branch = searchParams.get('branch') || 'master';
  const file = searchParams.get('file') || 'index.js';

  if (!url) {
    return NextResponse.json(
      { error: 'Repository URL is required' },
      { status: 400 }
    );
  }

  return POST(request);
}