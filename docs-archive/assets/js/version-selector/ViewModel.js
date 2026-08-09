import {
    buildVersionItems,
    buildVersionUrl,
    fetchVersions,
    getLatestVersion,
    getManifestCandidates,
    getPathContext,
} from './Model.js';
import { View } from './View.js';

export class ViewModel {
    constructor(root, options = {}) {
        this.root = root;
        this.view = new View(root);
        this.fetcher = options.fetcher || window.fetch.bind(window);
        this.location = options.location || window.location;
        this.versions = null;

        this.view.bindToggle();
    }

    async sync() {
        if (!this.root.isConnected) return;

        this.view.setLoading();

        try {
            const versions = await this.loadVersions();
            const context = getPathContext({
                pathname: this.location.pathname,
                siteUrl: this.root.dataset.siteUrl,
                versions,
            });
            const items = buildVersionItems({ versions, context });
            const latest = getLatestVersion(versions);

            this.root.dataset.currentVersion = context.currentVersion;
            this.view.setLabel(context.currentVersion);
            this.view.renderVersions(items);

            if (context.isVersioned && latest && context.currentVersion !== latest.version) {
                this.view.renderOutdatedBanner({
                    currentVersion: context.currentVersion,
                    latestVersion: latest.version,
                    latestUrl: buildVersionUrl({
                        basePath: context.basePath,
                        version: latest.version,
                        pagePath: context.pagePath,
                    }),
                });
            } else {
                this.view.removeOutdatedBanner();
            }
        } catch {
            this.view.setUnavailable();
            this.view.removeOutdatedBanner();
        }
    }

    async loadVersions() {
        if (this.versions) return this.versions;

        const candidates = getManifestCandidates({
            siteUrl: this.root.dataset.siteUrl,
            templateUrl: this.root.dataset.versionsUrl,
            pathname: this.location.pathname,
        });
        const result = await fetchVersions(candidates, this.fetcher);
        this.versions = result.versions;

        return this.versions;
    }
}
