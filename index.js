const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://45.76.250.111:9546"));
const express = require('express');
const app = express();
const helmet = require('helmet');
const contract = require('truffle-contract');
const IGV = require('./build/contracts/IGVCore.json');

let cache = {};

app.use(helmet());

app.get('/faucet/:addr', (req, res) => {
  console.log('Faucet Sent to: ' + req.params.addr);
  if (typeof(req.params.addr) !== 'string') {
    res.send();
  } else {
    let addr = req.params.addr;
    if (!cache[addr]) {
      cache[addr] = true;
      web3.personal.unlockAccount(web3.eth.accounts[0], 'asdfQWER1234!@#$', 1)
      web3.eth.sendTransaction({ to: addr, from: web3.eth.accounts[0], value: 1000000000000000000 })
      res.send(req.params.addr);
    }
  }
})

app.listen(4000, () => {
  console.log("faucet started");
})

init()

async function init() {

  const igv = contract(IGV);
  igv.setProvider(web3.currentProvider);

  let instance = await igv.deployed();

  instance.Issue({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).watch(async (error, result) => {
      if (!error) {
        console.log(result.args)
      }
    });
}
