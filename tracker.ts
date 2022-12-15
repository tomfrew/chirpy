//
// This file can both be used as an imported package from npm or as a browser drop-in analytics script.
//
// #############################
// # Importing the npm package #
// #############################
//
// Run `npm install chirpy` (TODO)
// 
// Then you can import it and use it (replacing PROJECT_ID):
//
// ```
// import { chirpyClientTracker } from "chirpy"
// 
// const chirpy = chirpyClientTracker(PROJECT_ID)
// chirpy.event("eventName");
// chirpy.event("eventName", "eventMetadata");
// ```
//
// ############################
// # Drop-in analytics script #
// ############################
//
// It can be done by pasting this snippet into a web page (replacing SCRIPT_SRC and PROJECT_ID):
//
// ```
// <!-- Chirpy analytics -->
// <script>
//   window.chirpyData = [];
//   window.chirpyProjectId = 'PROJECT_ID';
//   function chirpy(name,metadata){chirpyData.push({name:name,metadata:metadata});window.chirpyClient?.processRegisteredWindowEvents();}
//   chirpy('Pageview', window.location.pathname);
// </script>
// <script async type="module" src="SCRIPT_SRC"></script>
// ```
//
// Then you'll have the ability to invoke the chirpy function anywhere in your javascript:
//
// ```
// chirpy("eventName");
// chirpy("eventName", "eventMetadata");
// ```
//
interface Tracker {
    event(name: string, metadata: string | undefined): Promise<void>
    processRegisteredWindowEvents(): Promise<void>
}

// const createTrackingEventBackendUrl = "http://localhost:8000/Tracker/createTrackingEvent"
const createTrackingEventBackendUrl = "https://f1ykfa3psh.execute-api.eu-west-2.amazonaws.com/Tracker"

const locationChangeEvent = "locationchange"

export function chirpyClientTracker(projectId: string): Tracker {
    if (!isNonEmptyString(projectId)) {
        console.error("Wrong project id provided to tracker. Events won't be tracked");
        return noOpTracker();
    }

    // TODO can we subscribe to browser events whenever the url changes?
    // are there other interesting events?

    const t = createTracker(projectId);

    return t;
}

function isNonEmptyString(str: string) {
    return str && typeof str === "string"
}

function noOpTracker(): Tracker {
    return {
        event() {
            return Promise.resolve()
        },
        processRegisteredWindowEvents() {
            return Promise.resolve()
        }
    }
}

function createTracker(projectId: string): Tracker {
    const eventFn = (name: string, metadata: string | undefined): Promise<void> => {
        if (!name || typeof name !== "string") {
            console.error("[CHIRPY] Wrong label type provided for event tracker submitted event");
            return Promise.resolve()
        }

        return fetch(createTrackingEventBackendUrl, {
            method: "POST",
            body: JSON.stringify({
                name: name,
                metadata: metadata,
                projectId: projectId,
                host: window.location?.hostname,
            }),
        }).catch(reason => {
            console.error("[CHIRPY] Couldn't track event", name, "due to", reason);
        }).then(() => { })
    };

    return {
        event: eventFn,
        processRegisteredWindowEvents(): Promise<void> {
            const windowChirpyData = globalThis.chirpyData;
            if (!Array.isArray(windowChirpyData)) {
                console.error("[CHIRPY] Global chirpyData should be an array");
                return Promise.resolve();
            }

            const promises: Promise<void>[] = windowChirpyData.map(
                (windowEvent) => {
                    if (!windowEvent || typeof windowEvent !== "object") {
                        console.error("[CHIRPY] Only objects expected in global chirpyData");
                        return Promise.resolve();
                    }

                    const maybeName = windowEvent.name

                    if (!isNonEmptyString(maybeName)) {
                        console.error("[CHIRPY] Object in global chirpyData didn't have a name");
                        return Promise.resolve();
                    }

                    const name: string = maybeName

                    return eventFn(name, windowEvent.metadata);
                }
            );

            globalThis.chirpyData = [];

            return Promise.all(promises).then(() => { });
        }
    }
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
    const projectId = globalThis.chirpyProjectId
    if (!isNonEmptyString(projectId)) {
        return;
    }

    const client = createTracker(projectId);
    globalThis.chirpyClient = client

    client.processRegisteredWindowEvents();

    alterHistoryFunctionsToFireEvent();

    window.addEventListener(locationChangeEvent, () => {
        client.event('Pageview', window.location.pathname);
    });
}

init();

