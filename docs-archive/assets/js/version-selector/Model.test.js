import { describe, expect, test } from 'vitest';
import {
    buildVersionItems,
    fetchVersions,
    getManifestCandidates,
    getPathContext,
    normalizeManifest,
} from './Model.js';

const versions = [
    { version: '0.5.48', title: '0.5.48', aliases: ['latest'] },
    { version: '0.5.47', title: '0.5.47', aliases: [] },
];

describe('version selector model', () => {
    test('normalizes array and wrapped manifests', () => {
        expect(normalizeManifest(versions)).toBe(versions);
        expect(normalizeManifest({ versions })).toBe(versions);
        expect(normalizeManifest({})).toEqual([]);
    });

    test('prefers the project-root manifest when the page is under the site base path', () => {
        expect(getManifestCandidates({
            siteUrl: 'https://example.com/my-life-as-a-dev/',
            templateUrl: '../../versions.json',
            pathname: '/my-life-as-a-dev/latest/canvas/glacial-caverns/',
        })).toEqual([
            '/my-life-as-a-dev/versions.json',
            '../../versions.json',
            '/versions.json',
        ]);
    });

    test('does not request a production base path when served from localhost root', () => {
        expect(getManifestCandidates({
            siteUrl: 'https://example.com/my-life-as-a-dev/',
            templateUrl: './versions.json',
            pathname: '/canvas/glacial-caverns/',
        })).toEqual([
            './versions.json',
            '/versions.json',
        ]);
    });

    test('resolves versioned paths and preserves the current page target', () => {
        const context = getPathContext({
            pathname: '/my-life-as-a-dev/latest/canvas/glacial-caverns/',
            siteUrl: 'https://example.com/my-life-as-a-dev/',
            versions,
        });
        const items = buildVersionItems({ versions, context });

        expect(context).toMatchObject({
            basePath: '/my-life-as-a-dev/',
            currentToken: 'latest',
            currentVersion: '0.5.48',
            isVersioned: true,
            pagePath: 'canvas/glacial-caverns/',
        });
        expect(items[0]).toMatchObject({
            isActive: true,
            targetUrl: '/my-life-as-a-dev/0.5.48/canvas/glacial-caverns/',
        });
        expect(items[1].targetUrl).toBe('/my-life-as-a-dev/0.5.47/canvas/glacial-caverns/');
    });

    test('treats unversioned local pages as latest while keeping the page path', () => {
        const context = getPathContext({
            pathname: '/my-life-as-a-dev/canvas/glacial-caverns/',
            siteUrl: 'https://example.com/my-life-as-a-dev/',
            versions,
        });

        expect(context).toMatchObject({
            currentVersion: '0.5.48',
            isVersioned: false,
            pagePath: 'canvas/glacial-caverns/',
        });
    });

    test('tries manifest candidates until one returns valid JSON', async () => {
        const fetcher = async (url) => {
            if (url === '/bad.json') return { ok: false };
            return {
                ok: true,
                json: async () => ({ versions }),
            };
        };

        await expect(fetchVersions(['/bad.json', '/versions.json'], fetcher))
            .resolves.toEqual({ versions, url: '/versions.json' });
    });
});
