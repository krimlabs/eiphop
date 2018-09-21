const getPrefix = (level) => `[${level}]`;

const getMsg = (level, msg, dump={}) => 
  `${getPrefix(level)} ${msg} ${dump && Object.keys(dump).length > 0 ? ` - ${JSON.stringify(dump)}` : ''}`
;

const log = {
  error: (msg, dump={}) => console.error(getMsg('ERROR', msg, dump)),
  warn: (msg, dump={}) => console.warn(getMsg('WARN', msg, dump)),
  info: (msg, dump={}) => console.log(getMsg('INFO', msg, dump)),
};

export const setupMainHandler = (electronModule, availableActions, enableLogs=false) => {
  enableLogs && log.info('Logs enabled !');
  electronModule.ipcMain.on('asyncRequest', (event, requestId, action, payload) => {
    enableLogs && log.info(`Got new request with id = ${requestId}, action = ${action}`, payload);
    const requestedAction = availableActions[action];
    if (!requestedAction) {
      const error = `Action "${action}" is not available. Did you forget to define it ?`;
      log.error(error)
      event.sender.send('errorResponse', {msg: error});
      return;
    }

    requestedAction({payload}, {
      send: (res) => event.sender.send('asyncResponse', requestId, res),
      error: (err) => event.sender.send('errorResponse', requestId, err)
    });

    return;
  })
};
