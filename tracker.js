let exports = window.exports || {};
// const createTrackingEventBackendUrl = "http://localhost:8000/Tracker/createTrackingEvent"
const createTrackingEventBackendUrl = "https://f1ykfa3psh.execute-api.eu-west-2.amazonaws.com/Tracker/createTrackingEvent";
const locationChangeEvent = "locationchange";
export function chirpyClientTracker(projectId) {
    if (!isNonEmptyString(projectId)) {
        console.error("Wrong project id provided to tracker. Events won't be tracked");
        return noOpTracker();
    }
    // TODO can we subscribe to browser events whenever the url changes?
    // are there other interesting events?
    const t = createTracker(projectId);
    return t;
}
function isNonEmptyString(str) {
    return str && typeof str === "string";
}
function noOpTracker() {
    return {
        event() {
            return Promise.resolve();
        },
        processRegisteredWindowEvents() {
            return Promise.resolve();
        }
    };
}
function createTracker(projectId) {
    const eventFn = (name, metadata) => {
        var _a;
        if (!name || typeof name !== "string") {
            console.error("[CHIRPY] Wrong label type provided for event tracker submitted event");
            return Promise.resolve();
        }
        return fetch(createTrackingEventBackendUrl, {
            method: "POST",
            body: JSON.stringify({
                name: name,
                metadata: metadata,
                projectId: projectId,
                host: (_a = window.location) === null || _a === void 0 ? void 0 : _a.hostname,
            }),
        }).catch(reason => {
            console.error("[CHIRPY] Couldn't track event", name, "due to", reason);
        }).then(() => { });
    };
    return {
        event: eventFn,
        processRegisteredWindowEvents() {
            const windowChirpyData = globalThis.chirpyData;
            if (!Array.isArray(windowChirpyData)) {
                console.error("[CHIRPY] Global chirpyData should be an array");
                return Promise.resolve();
            }
            const promises = windowChirpyData.map((windowEvent) => {
                if (!windowEvent || typeof windowEvent !== "object") {
                    console.error("[CHIRPY] Only objects expected in global chirpyData");
                    return Promise.resolve();
                }
                const maybeName = windowEvent.name;
                if (!isNonEmptyString(maybeName)) {
                    console.error("[CHIRPY] Object in global chirpyData didn't have a name");
                    return Promise.resolve();
                }
                const name = maybeName;
                return eventFn(name, windowEvent.metadata);
            });
            globalThis.chirpyData = [];
            return Promise.all(promises).then(() => { });
        }
    };
}
function alterHistoryFunctionsToFireEvent() {
    const pushState = history.pushState;
    const replaceState = history.replaceState;
    history.pushState = function () {
        pushState.apply(history, arguments);
        window.dispatchEvent(new Event(locationChangeEvent));
    };
    history.replaceState = function () {
        replaceState.apply(history, arguments);
        window.dispatchEvent(new Event(locationChangeEvent));
    };
}
function init() {
    const projectId = globalThis.chirpyProjectId;
    if (!isNonEmptyString(projectId)) {
        return;
    }
    const client = createTracker(projectId);
    globalThis.chirpyClient = client;
    client.processRegisteredWindowEvents();
    alterHistoryFunctionsToFireEvent();
    window.addEventListener(locationChangeEvent, () => {
        client.event('Pageview', window.location.pathname);
    });
}
init();
