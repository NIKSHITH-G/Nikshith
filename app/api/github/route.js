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

// The contribution calendar: GraphQL when there's a working token, otherwise GitHub's
// public contributions page (no token needed), so an expired token never blanks the graph.
// null means neither worked; {} means a genuinely empty year.
async function fetchContributions(headers) {
  return (await fetchContributionsGraphQL(headers)) ?? (await fetchContributionsPublic());
}

async function fetchContributionsGraphQL(headers) {
  if (!process.env.GITHUB_TOKEN) return null;
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
    if (!res.ok) return null;
    const json = await res.json();
    const weeks =
      json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!Array.isArray(weeks)) return null;

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
    return null;
  }
}

// github.com/users/<name>/contributions: each day is a <td data-date id> and its count
// is in a <tool-tip for="<that id>">"3 contributions on May 17th."</tool-tip>.
async function fetchContributionsPublic() {
  try {
    const res = await fetch(`https://github.com/users/${USERNAME}/contributions`, {
      headers: { "User-Agent": "nikshith.dev" },
      next: { revalidate: 3 * 3600 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const dateOf = {};
    for (const [td] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
      const date = td.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
      const id = td.match(/\bid="([^"]+)"/)?.[1];
      if (date && id) dateOf[id] = date;
    }
    if (!Object.keys(dateOf).length) return null; // page layout changed
    const commitMap = {};
    for (const [, id, n] of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>\s*([\d,]+) contributions? on/g)) {
      if (dateOf[id]) commitMap[dateOf[id]] = Number(n.replace(/,/g, ""));
    }
    return commitMap;
  } catch {
    return null;
  }
}

export async function GET() {
  const headers = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};

  try {
    // Next caches these fetches and revalidates once per day — survives cold starts,
    // unlike a module-level variable, and avoids burning the rate limit on every hit.
    const get = (url, h) => fetch(url, { headers: h, next: { revalidate: ONE_DAY } });
    let [userRes, reposRes, commitMap] = await Promise.all([
      get(`https://api.github.com/users/${USERNAME}`, headers),
      get(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`, headers),
      fetchContributions(headers),
    ]);

    // A bad or expired token makes GitHub reject even public data — retry
    // anonymously so the profile and repos still show (just no contribution graph).
    if (headers.Authorization && (userRes.status === 401 || reposRes.status === 401)) {
      [userRes, reposRes] = await Promise.all([
        get(`https://api.github.com/users/${USERNAME}`, {}),
        get(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`, {}),
      ]);
    }

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
