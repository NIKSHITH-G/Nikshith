const USERNAME = "NIKSHITH-G";
const ONE_DAY = 86400; // seconds

const CONTRIB_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

// Pull the full contribution calendar in a single GraphQL call. This matches the
// graph on github.com exactly, unlike scraping commits from a handful of repos.
async function fetchContributions(headers) {
  if (!process.env.GITHUB_TOKEN) return {};
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: CONTRIB_QUERY,
        variables: { login: USERNAME },
      }),
      next: { revalidate: ONE_DAY },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const weeks =
      json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!Array.isArray(weeks)) return {};

    const commitMap = {};
    for (const week of weeks) {
      for (const day of week.contributionDays || []) {
        if (day.contributionCount > 0) {
          commitMap[day.date] = day.contributionCount;
        }
      }
    }
    return commitMap;
  } catch {
    return {};
  }
}

export async function GET() {
  const headers = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};

  try {
    // Next caches these fetches and revalidates once per day — survives cold starts,
    // unlike a module-level variable, and avoids burning the rate limit on every hit.
    const [userRes, reposRes, commitMap] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, {
        headers,
        next: { revalidate: ONE_DAY },
      }),
      fetch(
        `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`,
        {
          headers,
          next: { revalidate: ONE_DAY },
        }
      ),
      fetchContributions(headers),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      throw new Error(`GitHub API error: ${userRes.status} / ${reposRes.status}`);
    }

    const user = await userRes.json();
    const repos = await reposRes.json();

    if (!Array.isArray(repos)) {
      throw new Error("Unexpected repos response");
    }

    const totalStars = repos.reduce(
      (acc, r) => acc + (r.stargazers_count || 0),
      0
    );

    // Recently pushed, own work only (skip forks), trimmed to what a card shows.
    const recentRepos = repos
      .filter((r) => !r.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        pushedAt: r.pushed_at,
        url: r.html_url,
      }));

    return Response.json({
      stats: {
        followers: user.followers,
        publicRepos: user.public_repos,
        totalStars,
      },
      repos: recentRepos,
      commitMap,
    });
  } catch {
    return Response.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
