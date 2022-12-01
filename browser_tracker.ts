interface Tracker {
    event(label: string): Promise<void>
}

function tracker(projectId: string): Tracker {
    if (!projectId || typeof projectId !== "string") {
        console.error("Wrong project id provided to tracker. Events won't be tracked");
        return {
            event() {
                return Promise.resolve()    
            }
        }
    }

    let currentPagePath = window.location.pathname

    //TODO will be relevant for allowed urls list
    let currentPageHost = window.location.hostname
    
    fetch("https://staging--hack-preprep-JTRtt0.keelapps.xyz/Tracker/createTrackingEvent", {
        method: "POST",
        body: JSON.stringify({
            name: "page-view",
            metadata: currentPagePath,
            projectId: projectId,
        }),
    }).catch(reason => {
        console.error("Couldn't track event of page being opened due to ", reason);
    });

    // TODO can we subscribe to browser events whenever the url changes?
    // are there other interesting events?

    return {
        event(label: string): Promise<void> {
            if (!label || typeof label !== "string") {
                console.error("Wrong label type provided for event tracker submitted event");
                return Promise.resolve()
            }

            return fetch("https://staging--hack-preprep-JTRtt0.keelapps.xyz/Tracker/createTrackingEvent", {
                method: "POST",
                body: JSON.stringify({
                    name: label,
                    metadata: currentPagePath,
                    projectId: projectId,
                }),
            }).catch(reason => {
                console.error("Couldn't track event of page being opened due to ", reason);
            }).then(() => {})
        },
    }
}

