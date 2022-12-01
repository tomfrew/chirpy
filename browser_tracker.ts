interface Tracker {
    event(label: string): Promise<void>
}

function tracker(projectId: string): Tracker {
    if (!projectId || typeof projectId != "string") {
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
    
    // TODO api call for tracking event of this page being accessed
    fetch("", {
        method: "POST",
        body: JSON.stringify({
            name: "page-view",
            metadata: currentPagePath,
            projectId: projectId,
        }),
    })

    // TODO can we subscribe to browser events whenever the url changes?
    // are there other interesting events?

    return {
        event(label: string) {
            return new Promise(() => {
                if (!label) {
                    console.error("label undefined for event tracker submitted event");
                    return
                }

                // TODO api call for tracking event

            });
        },
    }
}

