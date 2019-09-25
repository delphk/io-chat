const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const users = [];
const connections = [];

server.listen(process.env.PORT || 3001);
console.log("Server running");

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

io.sockets.on("connection", socket => {
  connections.push(socket);
  console.log("Connected: %s sockets connected", connections.length);

  socket.on("disconnect", () => {
    users.splice(users.indexOf(socket.username), 1);
    connections.splice(connections.indexOf(socket), 1);
    console.log("Disconnected: %s sockets connected", connections.length);
  });

  socket.on("typing message", () => {
    io.sockets.emit("typing", { user: socket.username, id: socket.id });
  });

  socket.on("send message", data => {
    io.sockets.emit("new message", { msg: data, user: socket.username });
  });

  socket.on("new user", (data, cb) => {
    cb(true);
    socket.username = data;
    users.push(socket.username);
    updateUsername();
  });

  function updateUsername() {
    io.sockets.emit("get users", users);
  }
});
