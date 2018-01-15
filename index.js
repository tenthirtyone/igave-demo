const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
const express = require('express');
const app = express();
const helmet = require('helmet');

let cache = {};

console.log(web3.eth.accounts);
console.log(web3.eth.getBalance(web3.eth.accounts[0]).toNumber()/10e18);

app.use(helmet());

app.get('/faucet/:addr', (req, res) => {
  console.log('Faucet Sent to: ' + req.params.addr);
  if (typeof(req.params.addr) !== 'string') {
    res.send();
  } else {
    let addr = req.params.addr;
    if (!cache[addr]) {
      cache[addr] = true;
      web3.eth.sendTransaction({ to: addr, from: web3.eth.accounts[0], value: 1000000000000000000 })
      res.send(req.params.addr);
    }
  }
})

app.listen(4000, () => {
  console.log("faucet started");
})