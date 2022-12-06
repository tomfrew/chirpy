interface Tracker {
    event(label: string): Promise<void>
}

const createTrackingEventBackendUrl = "http://localhost:8000/Tracker/createTrackingEvent"
// const createTrackingEventBackendUrl = "https://staging--hack-preprep-JTRtt0.keelapps.xyz/Tracker/createTrackingEvent"

export function tracker(projectId: string): Tracker {
    if (!projectId || typeof projectId !== "string") {
        console.error("Wrong project id provided to tracker. Events won't be tracked");
        return {
            event() {
                return Promise.resolve()
            }
        }
    }

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

    // TODO can we subscribe to browser events whenever the url changes?
    // are there other interesting events?

    return {
        event(label: string): Promise<void> {
            if (!label || typeof label !== "string") {
                console.error("Wrong label type provided for event tracker submitted event");
                return Promise.resolve()
            }

            return fetch(createTrackingEventBackendUrl, {
                method: "POST",
                body: JSON.stringify({
                    name: label,
                    metadata: currentPagePath,
                    projectId: projectId,
                    host: window.location.hostname,
                }),
            }).catch(reason => {
                console.error("Couldn't track event of page being opened due to ", reason);
            }).then(() => {})
        },
    }
}

