class Monday implements WebToolIntegration {

    showIssueId = false;

    matchUrl = 'https://*.monday.com/*';

    issueElementSelector = [
        '.slide-panel-content',
        '.pulse-card-dialog-component',
        '.modal-slide-panel .pulse-values-and-header-wrapper',
        '.pulse-component-wrapper'
    ];

    private _latestPulseElement: HTMLElement;

    constructor() {
        document.addEventListener('click', event => {
            const element = event.target as HTMLElement;
            if (!element.matches) {
                return;
            }
            this._latestPulseElement = $$.closest('.pulse-component', element);
        });
    }

    getIssue(issueElement: HTMLElement, source: Source): WebToolIssue {

        let issueName: string;
        let issueId: string;
        let issueUrl: string;
        let projectName: string;

        if (issueElement.matches(this.issueElementSelector[0])) { // side panel on board page
            issueName = $$.try('.title-wrapper', issueElement).textContent;
            issueUrl = source.path;
            projectName = $$.try('.board-header-main .board-name').textContent;
        } else if (issueElement.matches(this.issueElementSelector[1])) { // my week page (legacy)
            issueName = $$.try('.pulse-name-value', issueElement).textContent;
            projectName = $$.try('.open-pulse-in-board-link').innerText;
        } else if (issueElement.matches(this.issueElementSelector[2])) { // my work page
            issueName = $$.try('.pulse-page-name-wrapper', issueElement).textContent;
            issueUrl = this._latestPulseElement &&
                $$.try<HTMLAnchorElement>('.board-cell-component a', this._latestPulseElement).href;
            projectName = $$.try('.open-pulse-in-board-link').innerText;
        } else if (issueElement.matches(this.issueElementSelector[3])) { // list item in My Work and Boards pages
            issueName = $$.try('div[data-walkthrough-id="item-name-text"]', issueElement).textContent;
            // find issue ulr on 'My Work' page
            issueUrl = $$.try<HTMLAnchorElement>('.pulse-component .board-cell-component a', issueElement).href;
            if (!issueUrl) { // if issue url didn't find, than parse id and create url manually
                let rowId = $$.try('.pulse-component', issueElement).id;
                let matches = rowId?.match(/row-pulse-+(\d+)-\w+/);
                issueUrl = matches ? `${source.path}/pulses/${matches[1]}` : null;
            }
            projectName = $$.try('.board-header-main .board-name').textContent // on boards page
                || $$.try('.pulse-component .board-cell-component a', issueElement).textContent; // on My Work page
        }

        const serviceUrl = source.protocol + source.host;

        if (issueUrl) {
            issueUrl = $$.getRelativeUrl(serviceUrl, issueUrl);
            const matches = issueUrl.match(/(\/pulses\/(\d+))/);
            if (matches) {
                issueUrl = matches[0];
                issueId = matches[1];
            } else {
                issueUrl = undefined;
            }
        }

        return { issueId, issueName, issueUrl, projectName, serviceUrl, serviceType: 'Monday' };
    }

    render(issueElement: HTMLElement, linkElement: HTMLElement) {
        let isListPage = false;

        if (issueElement.matches(this.issueElementSelector[0])) { // side panel on board page
            const hostElement = $$('.pulse_title', issueElement);
            if (hostElement) {
                hostElement.appendChild(linkElement);
            }
        } else if (issueElement.matches(this.issueElementSelector[1])) { // my week page (legacy)
            const hostElement = $$('.link-to-pulse');
            if (hostElement) {
                linkElement.style.marginLeft = '10px';
                hostElement.appendChild(linkElement);
            }
        } else if (issueElement.matches(this.issueElementSelector[2])) { // my work page
            const hostElement = $$('.link-to-pulse');
            if (hostElement) {
                linkElement.style.marginLeft = '10px';
                hostElement.appendChild(linkElement);
            }
        } else if (issueElement.matches(this.issueElementSelector[3])) { // in list in dashboards or My Work pages
            isListPage = true;
            const hostElement = $$('.name-cell-component-side-cell', issueElement);
            if (hostElement) {
                linkElement.classList.add('devart-timer-link-monday');
                hostElement.insertBefore(linkElement, hostElement.firstChild);
            }
        }

        if (!linkElement.parentElement && !isListPage) { // fallback - add as first element
            linkElement.style.paddingLeft = '10px';
            issueElement.insertBefore(linkElement, issueElement.firstChild);
        }
    }
}

IntegrationService.register(new Monday());