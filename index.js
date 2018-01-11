const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

const abi = require('./build/contracts/IGVCore.json');

const contract = web3.eth.contract(abi.abi).at("0x345ca3e014aaf5dca488057592ee47305d9b3e10");

contract.CreateCampaign({}, { fromBlock: 0, toBlock: 'latest' }).watch(function (error, result) {
  console.log(JSON.stringify(result));
});