export class View {
    constructor(root) {
        this.root = root;
        this.button = root.querySelector('.md-version__current');
        this.label = root.querySelector('.md-version__label');
        this.list = root.querySelector('.md-version__list');
    }

    bindToggle() {
        if (!this.button || this.root.dataset.versionToggleBound === 'true') return;

        this.root.dataset.versionToggleBound = 'true';
        this.button.addEventListener('click', (event) => {
            event.stopPropagation();
            this.setOpen(!this.root.classList.contains('md-version--active'));
        });

        this.button.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') this.setOpen(false);
        });

        document.addEventListener('click', (event) => {
            if (!this.root.contains(event.target)) this.setOpen(false);
        });
    }

    setOpen(isOpen) {
        this.root.classList.toggle('md-version--active', isOpen);
        this.button?.setAttribute('aria-expanded', String(isOpen));
    }

    setLabel(value) {
        if (this.label) this.label.textContent = value || 'Version';
    }

    setLoading() {
        this.root.dataset.state = 'loading';
        this.setLabel('Version');
        this.renderMessage('Loading...');
    }

    setUnavailable() {
        this.root.dataset.state = 'error';
        this.setLabel(this.root.dataset.currentVersion || 'Version');
        this.renderMessage('Unavailable');
    }

    renderMessage(message) {
        if (!this.list) return;

        this.list.replaceChildren();
        const item = document.createElement('li');
        item.className = 'md-version__item';

        const text = document.createElement('span');
        text.className = 'md-version__link';
        text.textContent = message;

        item.append(text);
        this.list.append(item);
    }

    renderVersions(items) {
        if (!this.list) return;

        this.root.dataset.state = 'ready';
        this.list.replaceChildren();

        items.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.className = `md-version__item${item.isActive ? ' md-version__item--active' : ''}`;

            const link = document.createElement('a');
            link.className = 'md-version__link';
            link.href = item.targetUrl;
            link.dataset.targetUrl = item.targetUrl;
            link.textContent = item.title;

            if (item.aliasLabel) {
                const alias = document.createElement('span');
                alias.className = 'md-version__alias';
                alias.textContent = ` (${item.aliasLabel})`;
                link.append(alias);
            }

            link.addEventListener('click', () => this.setOpen(false));
            listItem.append(link);
            this.list.append(listItem);
        });
    }

    renderOutdatedBanner({ currentVersion, latestVersion, latestUrl }) {
        this.removeOutdatedBanner();

        const content = document.querySelector('.md-content');
        if (!content || !currentVersion || currentVersion === latestVersion) return;

        const banner = document.createElement('div');
        banner.className = 'mlad-version-banner';

        const prefix = document.createTextNode('You are viewing version ');
        const current = document.createElement('strong');
        current.textContent = currentVersion;
        const middle = document.createTextNode('. The latest version is ');
        const latest = document.createElement('a');
        latest.href = latestUrl;
        latest.textContent = latestVersion;
        const suffix = document.createTextNode('.');

        banner.append(prefix, current, middle, latest, suffix);
        content.insertBefore(banner, content.firstChild);
    }

    removeOutdatedBanner() {
        document.querySelectorAll('.mlad-version-banner').forEach((banner) => banner.remove());
    }
}
