
import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { WindowRef } from '../window';

const Web3 = require('web3');

@Component({
  selector: 'app-mytokens',
  templateUrl: './faucet.component.html',
  styleUrls: ['./faucet.component.css']
})
export class EtherFaucetComponent {
  window;

  constructor(private winRef: WindowRef, http: Http) {
    this.window = winRef.nativeWindow;
    let addr = this.window.web3.eth.accounts[0];
    console.log(`http://45.76.250.111:4000/faucet/${addr}`);
    http.get(`http://45.76.250.111:4000/faucet/${addr}`).subscribe(data => {
      console.log(data);
    });
  }

  async init(igv) {

  }


}

