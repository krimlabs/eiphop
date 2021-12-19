import "electron";

declare namespace EipHop {
  export interface RequestObject<Payload> {
    payload: Payload;
  }

  export interface ResponseObject<Response, Error> {
    send: (response?: Response) => void;
    notify: (response?: Response) => void;
    error: (error?: Error) => void;
  }

  export interface Action<Payload = any, Response = any, Error = any> {
    (
      request: RequestObject<Payload>,
      response: ResponseObject<Response, Error>
    ): void;
  }

  export interface Actions {
    [x: string]: Action;
  }
}

export const setupMainHandler: (
  electronModule: { ipcMain: typeof Electron.ipcMain },
  actions: EipHop.Actions,
  enableLogs?: boolean
) => void;

export const setupFrontendListener: (electronModule: { 
  ipcRenderer: {
    send: typeof Electron.ipcRenderer.send,
    on: typeof Electron.ipcRenderer.on 
  }
}) => void;

export const emit: <Response = any>(
  action: string,
  payload?: any,
  notify?: any,
) => Promise<Response>;
