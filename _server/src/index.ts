import url from "url";
import querystring from "querystring";
import { startServer } from "./startServer";

const server = Bun.serve<{ username: string }>({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      console.log(`upgrade!`);
      const username = getUsernameFromReq(req);
      const success = server.upgrade(req, { data: { username } });
      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }

    return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      //   const msg = `${ws.data.username} has entered the chat`;
      const msg = `Someone has entered the chat`;
      ws.subscribe("the-group-chat");
      ws.publish("the-group-chat", msg);
      console.log(msg);
    },
    message(ws, message) {
      // this is a group chat
      // so the server re-broadcasts incoming message to everyone
      ws.publish("the-group-chat", `Someone wrote: ${message}`);
      //   ws.publish("the-group-chat", `${ws.data.username}: ${message}`);
      console.log(`Someone wrote: ${message}`);
    },
    close(ws) {
      const msg = `Someone has left the chat`;
      //   const msg = `${ws.data.username} has left the chat`;
      ws.unsubscribe("the-group-chat");
      server.publish("the-group-chat", msg);
      console.log(msg);
    },
  },
});

setInterval(() => {
  server.publish("the-group-chat", "Ping!");
}, 3000);

console.log(`Listening on ${server.hostname}:${server.port}`);

const getUsernameFromReq = (req: any) => {
  const parsedUrl: any = url.parse(req.url);
  const queryParams = querystring.parse(parsedUrl.query);
  return queryParams;
};

startServer();
