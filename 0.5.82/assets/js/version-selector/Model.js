const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

function ensureTrailingSlash(value) {
    return value.endsWith('/') ? value : `${value}/`;
}

function ensureLeadingSlash(value) {
    return value.startsWith('/') ? value : `/${value}`;
}

function normalizePathname(pathname) {
    const value = pathname || '/';
    const withoutIndex = value.endsWith('/index.html')
        ? value.slice(0, -'index.html'.length)
        : value;
    return ensureLeadingSlash(withoutIndex);
}

export function normalizeManifest(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.versions)) return payload.versions;
    return [];
}

export function normalizeBasePath(siteUrl) {
    if (!siteUrl) return '/';

    try {
        const pathname = new URL(siteUrl).pathname || '/';
        return ensureTrailingSlash(ensureLeadingSlash(pathname));
    } catch {
        return ensureTrailingSlash(ensureLeadingSlash(siteUrl));
    }
}

export function getManifestCandidates({ siteUrl, templateUrl, pathname }) {
    const basePath = normalizeBasePath(siteUrl);
    const currentPath = normalizePathname(pathname);
    const candidates = [];

    if (basePath === '/' || currentPath.startsWith(basePath)) {
        candidates.push(`${basePath}versions.json`);
    }

    if (templateUrl) candidates.push(templateUrl);
    candidates.push('/versions.json');

    return [...new Set(candidates)];
}

export function getKnownVersionTokens(versions) {
    const tokens = new Set();

    versions.forEach((entry) => {
        if (entry.version) tokens.add(entry.version);
        getAliases(entry).forEach((alias) => tokens.add(alias));
    });

    return tokens;
}

export function getAliases(versionEntry) {
    return Array.isArray(versionEntry?.aliases) ? versionEntry.aliases : [];
}

export function getLatestVersion(versions) {
    return versions.find((entry) => getAliases(entry).includes('latest')) || versions[0] || null;
}

export function resolveVersion(token, versions) {
    if (!token) return getLatestVersion(versions);

    return versions.find((entry) => (
        entry.version === token || getAliases(entry).includes(token)
    )) || null;
}

export function getPathContext({ pathname, siteUrl, versions }) {
    const basePath = normalizeBasePath(siteUrl);
    const normalizedPath = normalizePathname(pathname);
    const relativePath = normalizedPath.startsWith(basePath)
        ? normalizedPath.slice(basePath.length)
        : normalizedPath.replace(/^\/+/, '');
    const segments = relativePath.split('/').filter(Boolean);
    const tokens = getKnownVersionTokens(versions);
    const firstSegment = segments[0] || '';
    const isVersioned = tokens.has(firstSegment) || VERSION_PATTERN.test(firstSegment);
    const latest = getLatestVersion(versions);
    const currentToken = isVersioned ? firstSegment : (latest?.version || 'latest');
    const pageSegments = isVersioned ? segments.slice(1) : segments;

    return {
        basePath,
        currentToken,
        currentVersion: resolveVersion(currentToken, versions)?.version || currentToken,
        isVersioned,
        pagePath: pageSegments.length ? `${pageSegments.join('/')}/` : '',
    };
}

export function buildVersionUrl({ basePath, version, pagePath = '' }) {
    const root = ensureTrailingSlash(ensureLeadingSlash(basePath || '/'));
    const cleanVersion = String(version || '').replace(/^\/+|\/+$/g, '');
    const cleanPagePath = String(pagePath || '').replace(/^\/+/, '');
    return `${root}${cleanVersion}/${cleanPagePath}`;
}

export function buildVersionItems({ versions, context }) {
    return versions.map((entry) => {
        const aliases = getAliases(entry);
        const targetUrl = buildVersionUrl({
            basePath: context.basePath,
            version: entry.version,
            pagePath: context.pagePath,
        });

        return {
            version: entry.version,
            title: entry.title || entry.version,
            aliases,
            aliasLabel: aliases.length ? aliases.join(', ') : '',
            isActive: entry.version === context.currentVersion || aliases.includes(context.currentToken),
            targetUrl,
        };
    });
}

export async function fetchVersions(candidates, fetcher = window.fetch.bind(window)) {
    for (const url of candidates) {
        try {
            const response = await fetcher(url, {
                headers: { Accept: 'application/json' },
                cache: 'no-cache',
            });

            if (!response?.ok) continue;

            const versions = normalizeManifest(await response.json());
            if (versions.length) return { versions, url };
        } catch {
            // Try the next candidate; the view renders a quiet fallback if all fail.
        }
    }

    throw new Error('Version manifest unavailable');
}
