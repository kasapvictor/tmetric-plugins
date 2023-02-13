class Kaiten implements WebToolIntegration {
    matchUrl = ['*://*.kaiten.ru/space/*/card/*'];

    issueElementSelector = [
        '#print-source',      // task
        '[data-test="checklist-item"]' // sub-task
    ];

    getIssue(issueElement: HTMLElement, source: Source): WebToolIssue {
        const root = $$('#print-source');
        const tagNames = [];
        const serviceType = 'Kaiten';
        const serviceUrl = source.protocol + source.host;
        const issueUrl = source.path;
        const projectNameTitleEl = $$('h6[title="Project Name"]');

        let tag = '';
        let projectName = '';
        let issueId = $$('[data-test="card-location"] a', root).textContent;
        let issueName = $$('#print-source p', root).textContent;
        let description = issueName;

        if (projectNameTitleEl) {
            const nextSibling = projectNameTitleEl.parentElement.nextElementSibling;
            const projectLabel = nextSibling.querySelector('.MuiChip-label');

            if (projectLabel) {
                projectName = projectLabel.textContent;
            }
        }

        const cardContent = $$('.cardContent', root);
        const positionName = cardContent.querySelector('a.MuiLink-root').textContent.toLowerCase();

        if (positionName.includes(' upstream ')) {
            tag = ' | Estimation';
        }

        if (positionName.includes(' qc ')) {
            tag = ' | Testing';
        }

        if (positionName.includes(' code review ')) {
            tag = ' | Code review';
        }

        if (positionName.includes(' rework ')) {
            tag = ' | Rework';
        }

        if (issueElement.matches(this.issueElementSelector[1])) {
            const checkListItem = ' | ' + $$('[role="presentation"] p', issueElement).textContent;

            description += checkListItem;
            issueName += checkListItem;
            issueId += checkListItem;
        }

        description += tag;
        issueName += tag;
        issueId += tag;

        return {issueId, issueName, projectName, serviceType, description, serviceUrl, issueUrl, tagNames};
    }

    render(issueElement: HTMLElement, linkElement: HTMLElement) {
        if (issueElement.matches(this.issueElementSelector[0])) {
            const linkContainer = $$.create('div', 'devart-timer-link-kaiten');
            const cardContent = $$('.cardContent', issueElement);

            linkContainer.appendChild(linkElement);

            if (cardContent) {
                cardContent.prepend(linkContainer);
            }
        }

        if (issueElement.matches(this.issueElementSelector[1])) {
            linkElement.classList.add('devart-timer-link-minimal', 'devart-timer-link-kaiten-subtask');
            issueElement.prepend(linkElement);
        }
    }
}

IntegrationService.register(new Kaiten());