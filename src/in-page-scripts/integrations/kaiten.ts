class Kaiten implements WebToolIntegration {
    /**
     * The array of URLs (with wildcards) that are used to identify
     * pages as those that belong to the service.
     */
    matchUrl = [
        '*://*.kaiten.*/space/*'
    ];

    /**
     * If the service may be on a custom domain implement this method
     * to identify pages of the service by other features (e.g. meta-tags).
     */
    match(source: Source) {
        return $$.getAttribute('meta[name=application-name]', 'content') == 'Kaiten';
    }

    /**
     * The identifier of the element, which contains the task details
     * and inside which the button will be rendered.
     */
    issueElementSelector = [
        '.ticket'
    ];

    /**
     * Extracts information about the issue (ticket or task) from a Web
     * page by querying the DOM model.
     */
    getIssue(issueElement: HTMLElement, source: Source): WebToolIssue {
        const issueId = $$.try('.ticket-id', issueElement).textContent;
        const issueName = $$.try('.ticket-name', issueElement).textContent;
        const serviceUrl = source.protocol + source.host;
        const issueUrl = source.path;
        const projectName = $$.try('.project-name', issueElement).textContent;
        const tagNames = $$.all('.labels', issueElement).map(label => label.textContent);
        const serviceType = 'BigIssueTrac'

        return { issueId, issueName, issueUrl, projectName, serviceUrl, serviceType, tagNames };
    }

    /**
     * Inserts the timer button for the identified issue into a Web page.
     */
    render(issueElement: HTMLElement, linkElement: HTMLElement) {
        const host = $$('.link-list', issueElement);

        if (host) {
            const container = $$.create('li');
            container.appendChild(linkElement);
            host.appendChild(container);
        }
    }
}

IntegrationService.register(new Kaiten());