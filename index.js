const { faker } = require("@faker-js/faker");

const WebSocket = require("ws");
const { WebSocketServer } = WebSocket;
const wss = new WebSocketServer({ port: 8080 });

const rand = (array) => array[parseInt(Math.random() * array.length)];

const createUser = () => ({
  _id: faker.datatype.uuid(),
  name: faker.internet.userName(),
  email: faker.internet.email(),
  color: faker.color.human(),
});

const createMessage = () => ({
  body: faker.random.words(Math.random() * 20),
  user: createUser(),
  createdAt: new Date().toISOString(),
});

const createRaid = () => ({
  user: createUser(),
});

const createJoined = () => ({
  user: createUser(),
});

const createValue = (type) => {
  switch (type) {
    case "user-joined":
      return createJoined();
    case "raid":
      return createRaid();
    case "chat-message":
      return createMessage();
    default:
      throw new Error(`${type} not supported`);
  }
};

const types = ["user-joined", "raid", "chat-message"];

wss.on("connection", (ws) => {
  ws.on("message", function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });

  setInterval(() => {
    const type = rand(types);

    wss.clients.forEach((client) =>
      client.send(
        JSON.stringify({
          type,
          ...createValue(type),
        })
      )
    );
  }, 2000);
});
