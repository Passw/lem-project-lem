"use strict";

const {
  JSONRPCServerAndClient,
  JSONRPCServer,
  JSONRPCClient,
} = require("json-rpc-2.0");

function connect(webSocket) {
  const serverAndClient = new JSONRPCServerAndClient(
    new JSONRPCServer(),
    new JSONRPCClient((request) => {
      try {
        webSocket.send(JSON.stringify(request));
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }),
  );

  webSocket.onmessage = (event) => {
    console.log(event);
    serverAndClient.receiveAndSend(JSON.parse(event.data.toString()));
  };

  webSocket.onclose = (event) => {
    serverAndClient.rejectAllPendingRequests(
      `Connection is closed (${event.reason}).`,
    );
  };

  webSocket.onopen = () => {
    console.log("WebSocket connection established");
  };

  webSocket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return serverAndClient;
}

class JSONRPC {
  constructor(webSocket) {
    this.webSocket = webSocket;
    this.serverAndClient = connect(webSocket);
  }

  on(method, handler) {
    this.serverAndClient.addMethod(method, handler);
  }

  request(method, arg) {
    // TODO
    setTimeout(() => {
      return this.serverAndClient.request(method, arg).then((result) => console.log(result));
    }, 1000);
  }

  notify(method, arg) {
    return this.serverAndClient.notify(method, arg);
  }
}

exports.JSONRPC = JSONRPC;
