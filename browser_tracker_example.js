//
// BEGIN TRANSPILED CODE
//
//const createTrackingEventBackendUrl = "http://localhost:8000/Tracker/createTrackingEvent";
const createTrackingEventBackendUrl = "https://staging--hack-preprep-JTRtt0.keelapps.xyz/Tracker/createTrackingEvent"
function tracker(projectId) {
    if (!projectId || typeof projectId !== "string") {
        console.error("Wrong project id provided to tracker. Events won't be tracked");
        return {
            event() {
                return Promise.resolve();
            }
        };
    }
    let currentPagePath = window.location.pathname;
    //TODO will be relevant for allowed urls list
    let currentPageHost = window.location.hostname;
    fetch(createTrackingEventBackendUrl, {
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
        event(label) {
            if (!label || typeof label !== "string") {
                console.error("Wrong label type provided for event tracker submitted event");
                return Promise.resolve();
            }
            return fetch(createTrackingEventBackendUrl, {
                method: "POST",
                body: JSON.stringify({
                    name: label,
                    metadata: currentPagePath,
                    projectId: projectId,
                }),
            }).catch(reason => {
                console.error("Couldn't track event of page being opened due to ", reason);
            }).then((result) => result.json())
            .then((result) => { console.log("tracked ", JSON.stringify(result)) });
        },
    };
}
//
// END TRANSPILED CODE
//

console.log("gonna make a tracker");

let t = tracker("2IMf2HoGXhZMn74kpqGX6aD2bPd");

function trackClick() {
    t.event("button-click").then(() => { console.log("button-click event tracked")});
}