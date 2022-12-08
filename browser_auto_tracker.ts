//
// This file enables automatic tracking just by adding it to a script tag.
//
// It can be done by pasting this snippet into a web page:
// ```
// <script src="browser_auto_tracker.js" id="PROJECT_ID"></script>
// ```
// and replacing:
// * `browser_auto_tracker.js` with the link to the hosted version
// * `PROJECT_ID` with the id of the Chirpy project
//
function scriptTagAutoTracker() {
    const scriptTagIdAttribute = document.currentScript?.getAttribute('id')
    if (scriptTagIdAttribute === null || scriptTagIdAttribute === undefined) {
        console.error("Project id not provided in the script tag");
        return
    }
    
    const projectId = scriptTagIdAttribute

    let currentPagePath = window.location.pathname

    fetch(createTrackingEventBackendUrl, {
        method: "POST",
        body: JSON.stringify({
            name: "page-view",
            metadata: currentPagePath,
            projectId: projectId,
            host: window.location.hostname,
        }),
    }).catch(reason => {
        console.error("Couldn't track event of page being opened due to ", reason);
    });
}

scriptTagAutoTracker();