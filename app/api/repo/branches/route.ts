import { NextRequest, NextResponse } from 'next/server';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const REPO_CACHE_DIR = path.join(tmpdir(), 'warlanguage-repos');
const ALLOWED_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org'];

function validateRepositoryUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_HOSTS.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!validateRepositoryUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid repository URL or unsupported host' },
        { status: 400 }
      );
    }

    await ensureDirectoryExists(REPO_CACHE_DIR);

    const repoName = url.split('/').slice(-2).join('-').replace('.git', '');
    const repoPath = path.join(REPO_CACHE_DIR, `${repoName}-temp`);

    const git = simpleGit();

    try {
      try {
        await fs.rm(repoPath, { recursive: true, force: true });
      } catch {
      }

      await git.clone(url, repoPath, ['--bare']);
      
      const repoGit = simpleGit(repoPath);
      const branches = await repoGit.branch(['-r']);
      
      const branchList = branches.all
        .filter(branch => branch.startsWith('origin/') && !branch.includes('HEAD'))
        .map(branch => branch.replace('origin/', ''));

      await fs.rm(repoPath, { recursive: true, force: true });

      return NextResponse.json({ 
        branches: branchList,
        default: branchList.includes('main') ? 'main' : branchList.includes('master') ? 'master' : branchList[0]
      });

    } catch (gitError) {
      try {
        await fs.rm(repoPath, { recursive: true, force: true });
      } catch {
      }

      return NextResponse.json(
        { error: `Failed to fetch branches: ${gitError instanceof Error ? gitError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Branches API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}