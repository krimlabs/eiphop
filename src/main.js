const getPrefix = (level) => `[${level}]`;

const getMsg = (level, msg, dump = {}) =>
    `${getPrefix(level)} ${msg} ${dump && Object.keys(dump).length > 0 ? ` - ${JSON.stringify(dump)}` : ''}`
;

const log = {
    error: (msg, dump = {}) => console.error(getMsg('ERROR', msg, dump)),
    warn: (msg, dump = {}) => console.warn(getMsg('WARN', msg, dump)),
    info: (msg, dump = {}) => console.log(getMsg('INFO', msg, dump)),
};

const isPromise = (obj) => {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

export const setupMainHandler = (electronModule, availableActions, enableLogs = false) => {
    enableLogs && log.info('Logs enabled !');
    electronModule.ipcMain.on('asyncRequest', (event, requestId, action, payload) => {
        enableLogs && log.info(`Got new request with id = ${requestId}, action = ${action}`, payload);

        const res = {
            send: (result) => event.sender.send('asyncResponse', requestId, result),
            error: (err) => event.sender.send('errorResponse', requestId, err)
        };

        const requestedAction = availableActions[action];

        if (!requestedAction) {
            const error = `Action "${action}" is not available. Did you forget to define it ?`;
            log.error(error);
            res.error({msg: error});
            return;
        }

        try {
            const promise = requestedAction({payload}, res);

            if (isPromise(promise)) {
                promise.catch((e) => {
                    //error in async code
                    res.error(e)
                })
            }
        } catch (e) {
            //error inside sync code
            res.error(e);
        }


    })
};
