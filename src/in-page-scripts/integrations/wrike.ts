class Wrike implements WebToolIntegration {

    showIssueId = false;

    matchUrl = '*://*.wrike.com/workspace.htm*';

    issueElementSelector = '.wspace-task-view, .task-view';

    render(issueElement: HTMLElement, linkElement: HTMLElement) {
        const host = $$('.task-view-header__actions', issueElement);
        if (host) {
            linkElement.classList.add('devart-timer-link-wrike');
            host.insertBefore(linkElement, host.firstElementChild);
        }
    }

    getIssue(issueElement: HTMLElement, source: Source): WebToolIssue {

        const issueName = $$.try<HTMLTextAreaElement>('textarea.title-field, textarea.title__field', issueElement).value;
        if (!issueName) {
            return;
        }

        const issueTags = $$.all('.wspace-task-widgets-tags-dataview > div, .task-tags .tag-text', issueElement);
        const projectName = issueTags.length == 1 ? issueTags[0].textContent : null;

        const params = $$.searchParams(document.location.hash);

        let issueId = params['t']                 // folder, My Work,
            || params['ot'];                      // modal

        const inboxMatch = document.location.hash && document.location.hash.match(/#\/inbox\/task\/(\d+)/);
        if (inboxMatch) {
            issueId = inboxMatch[1];
        }

        // get issue id from task in dashboard widgets
        const isOverview = params['path'] == 'overview';
        if (!issueId && isOverview) {

            // find issue identifier by name
            const foundIdentifiers = $$.all('wrike-task-list-task')
                .map(task => {
                    if ($$('.task-block wrike-task-title', task).textContent == issueName) {
                        return task.getAttribute('data-id');
                    }
                })
                .filter((item, index, array) =>
                    !!item && // filter out tasks without id
                    array.indexOf(item) == index // filter out task dulicates
                );

            if (foundIdentifiers.length == 1) {
                issueId = foundIdentifiers[0];
            }
        }

        let issueUrl: string;
        if (issueId) {
            issueUrl = '/open.htm?id=' + issueId;
            issueId = '#' + issueId;
        }

        const serviceType = 'Wrike';

        const serviceUrl = source.protocol + source.host;

        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}

IntegrationService.register(new Wrike());