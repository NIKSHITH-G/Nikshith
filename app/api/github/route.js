let cache = null;
let lastFetch = 0;

const ONE_DAY = 1000 * 60 * 60 * 24;

export async function GET() {
  const now = Date.now();

  // ✅ RETURN CACHE IF FRESH
  if (cache && now - lastFetch < ONE_DAY) {
    return Response.json(cache);
  }

  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  const username = "NIKSHITH-G";

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers }),
    ]);

    const user = await userRes.json();
    const repos = await reposRes.json();

    const totalStars = repos.reduce(
      (acc, r) => acc + (r.stargazers_count || 0),
      0
    );

    const topRepos = repos.filter((r) => !r.fork).slice(0, 3);

    /* -------------------------
       COMMITS
    ------------------------- */

    const since = new Date();
    since.setDate(since.getDate() - 371);

    const commitMap = {};

    for (const repo of repos.slice(0, 10)) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&since=${since.toISOString()}`,
          { headers }
        );

        const commits = await res.json();

        commits.forEach((c) => {
          const date = c.commit?.author?.date?.slice(0, 10);
          if (date) {
            commitMap[date] = (commitMap[date] || 0) + 1;
          }
        });
      } catch {}
    }

    const result = {
      stats: {
        followers: user.followers,
        publicRepos: user.public_repos,
        totalStars,
      },
      repos: topRepos,
      commitMap,
    };

    // ✅ SAVE CACHE
    cache = result;
    lastFetch = now;

    return Response.json(result);

  } catch {
    return Response.json({ error: "Failed to fetch GitHub data" }, { status: 500 });
  }
}