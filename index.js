const express = require("express")
const app = express();
const http = require('http')
const server = http.createServer(app)
const socketIo = require('socket.io')
const io = socketIo(server)
const path = require("path")
//node index.js

var request = require('request');
const { token } = require('./loginDetails')
const users = require("./users.json")

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

var requestOptions = {
  'url': `https://api.tiingo.com/iex/?tickers=sony,tsla,amzn,wmt,dis&token=${token}`,
  'headers': {
    'Content-Type': 'application/json'
  }
};

let obj = [
  {
    id: 1,
    stockName: "Amazon",
    tag: "AMZN",
    currentPrice: 0
  },
  {
    id: 2,
    stockName: "Disney",
    tag: "DIS",
    currentPrice: 0
  },
  {
    id: 3,
    stockName: "Sony",
    tag: "SONY",
    currentPrice: 0
  },
  {
    id: 4,
    stockName: "Tesla",
    tag: "TSLA",
    currentPrice: 0
  },
  {
    id: 5,
    stockName: "Walmart",
    tag: "WMT",
    currentPrice: 0
  }
]

const findPrice = (item) => {
  obj.map(i => {
    if (i.tag === item.ticker)
      item.last !== 0 ? i.currentPrice = item.last : i.currentPrice = item.prevClose
  })
}

const int = () => {
  request(requestOptions,
    function (error, response, body) {
      JSON.parse(body).map(item => {
        if (item.askSize !== null) {
          findPrice(item)
        } else {
          findPrice(item)
          clearInterval(interval)
          io.emit("closedMarkets", "Markets closed for today! Last prices are below:")
        }
      })
      io.sockets.emit("updateStock", obj)
    })
}

io.on("connection", (socket) => {
  int()
  console.log("running!")
  io.emit("printUsers", users)
})

const interval = setInterval(() => {
  int()
}, 5000);

server.listen(3000, () => console.log("project listening!")).setMaxListeners(0)