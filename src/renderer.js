/**
 * Some apps can require('electron'). React apps cannot.
 * hiphop doesn't assume how you'd be building your app,
 * and accepts electron as a dependancy.
 */
// singleton ipcRenderer
let ipcRenderer = null;

// singleton requests map
let pendingRequests = {};
export {pendingRequests};

const removePendingRequestId = (requestId) => {
    pendingRequests = Object.keys(pendingRequests)
        .filter(k => k !== requestId)
        .map(k => ({[k]: pendingRequests[k]}))
        .reduce((accumulator, current) => ({...accumulator, ...current}), {})
    ;
};

const randomId = () => `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;

// util method to resolve a promise from outside function scope
// https://stackoverflow.com/questions/26150232/resolve-javascript-promise-outside-function-scope
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        })
    }
}

export const emit = (action, payload, notifier) => {
    // create a request identifier
    const requestId = randomId();

    // send ipc call on asyncRequest channel
    ipcRenderer.send('asyncRequest', requestId, action, payload);

    // create a new deferred object and save it to pendingRequests
    // this allows us to resolve the promise from outside (giving a cleaner api to domain objects)
    const dfd = new Deferred();
    pendingRequests[requestId] = {dfd, action, payload, notifier};

    // return a promise which will resolve with res
    return dfd.promise;
};

export const setupFrontendListener = (electronModule) => {
    // setup global ipcRenderer
    ipcRenderer = electronModule.ipcRenderer;

    // expect all responses on asyncResponse channel

    ipcRenderer.on('asyncResponseNotify', (event, requestId, res) => {
        const {notifier, action} = pendingRequests[requestId];
        if (notifier) notifier(res);
    });

    ipcRenderer.on('asyncResponse', (event, requestId, res) => {
        const {dfd} = pendingRequests[requestId];
        removePendingRequestId(requestId);
        dfd.resolve(res);
    });

    ipcRenderer.on('errorResponse', (event, requestId, err) => {
        const {dfd} = pendingRequests[requestId];
        removePendingRequestId(requestId);
        dfd.reject(err);
    });
}
