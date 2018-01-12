import { Component, OnInit } from '@angular/core';
import { WindowRef } from '../window';

const Web3 = require('web3');
const contract = require('truffle-contract');
const IGVCore = require('../../../../build/contracts/IGVCore.json');

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  lastCampaigns = [];
  lastTokens = [];
  totalCampaigns = 0;
  totalSupply = 0;
  totalRaised = 0;
  instance;
  window;

  constructor(private winRef: WindowRef) {
    this.window = winRef.nativeWindow;
    const igv = contract(IGVCore);

    igv.setProvider(this.window.web3.currentProvider);

    this.init(igv);
  }

  async init(igv) {
    this.instance = await igv.deployed();

    console.log(this.instance);

    let totalCampaigns = await this.instance.totalCampaigns.call();
    let totalSupply = await this.instance.totalSupply.call();
    const totalRaised = await this.instance.totalRaised();

    this.totalSupply = totalSupply.toNumber();
    this.totalRaised = totalRaised.toNumber() / 10e17;
    this.totalCampaigns = totalCampaigns.toNumber();

    await this.getLastCampaigns();
    await this.getLastTokens();
  }

  async getLastCampaigns() {
    let total = 10;
    let campaignId = this.totalCampaigns;
    while (total > 0 && campaignId > 0) {
      let campaign = await this.instance.getCampaign(campaignId);

      this.lastCampaigns.push({
        id: campaignId,
        name: campaign[3],
        startBlock: campaign[0],
        endBlock: campaign[1]
      });

      total--;
      campaignId--;
    }
  }

  async getLastTokens() {
    let total = 10;
    let totalTokens = this.totalSupply;

    while (total > 0 && totalTokens > 0) {
      let certificate = await this.instance.getCertificate(totalTokens);

      let campaignId = certificate[0].toNumber();
      let tokenIdx = certificate[1].toNumber();

      let token = await this.instance.getToken(campaignId, tokenIdx);

      let tokenName = token[3];
      let issueNumber = certificate[2].toNumber();
      let remaining = token[2].toNumber();
      let price = token[4].toNumber() / 10e18;

      this.lastTokens.push({
        campaignId,
        tokenIdx,
        tokenName,
        issueNumber,
        remaining,
        price,
      });

      total--;
      totalTokens--;
    }
  }

  ngOnInit() {

  }

}
