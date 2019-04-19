import Electron from "electron";

declare namespace EipHop {
  export interface RequestObject<Payload> {
    payload: Payload;
  }

  export interface ResponseObject<Response, Error> {
    send: (response?: Response) => void;
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
  electronModule: typeof Electron,
  actions: EipHop.Actions,
  enableLogs?: boolean
) => void;

export const setupFrontendListener: (electronModule: typeof Electron) => void;

export const emit: <Response = any>(
  action: string,
  payload?: any
) => Promise<Response>;
