// Specifically request an abstraction for MetaCoin
const IGVCore = artifacts.require('IGVCore');

contract('IGVCore', (accounts) => {
  it('Has a founder address ', async () => {
    const instance = await IGVCore.deployed();
    const founderAddress = await instance.founderAddress();

    assert.equal(founderAddress, accounts[0]);
  });
  it('Has an owner address ', async () => {
    const instance = await IGVCore.deployed();
    const founderAddress = await instance.founderAddress();

    assert.equal(founderAddress, accounts[0]);
  });
  it('Has a campaign escrow amount 10e16', async () => {
    const instance = await IGVCore.deployed();
    const campaignEscrowAmount = await instance.campaignEscrowAmount();

    assert.equal(campaignEscrowAmount.toNumber(), 10e16);
  });
  it('Can change the escrow amount : 10e10', async () => {
    const instance = await IGVCore.deployed();
    await instance.changeEscrowAmount(
      10e10,
      {from: accounts[0]}
    );

    const campaignEscrowAmount = await instance.campaignEscrowAmount();
    assert.equal(campaignEscrowAmount.toNumber(), 10e10);
  });
  it('Has has a campaign block delay 1000', async () => {
    const instance = await IGVCore.deployed();
    const campaignBlockDelay = await instance.campaignBlockDelay();

    assert.equal(campaignBlockDelay.toNumber(), 1000);
  });
  it('Can change the block delay to 2000', async () => {
    const instance = await IGVCore.deployed();
    await instance.changeBlockDelay(
      2000,
      {from: accounts[0]}
    );
    const campaignBlockDelay = await instance.campaignBlockDelay();

    assert.equal(campaignBlockDelay.toNumber(), 2000);
  });
  it('Has a Genesis Campaign', async () => {
    const instance = await IGVCore.deployed();
    const campaign = await instance.getCampaign(0);

    assert.equal(campaign[0].toNumber(), 0);
    assert.equal(campaign[1].toNumber(), 0);
    assert.equal(campaign[2], '0x0000000000000000000000000000000000000000');
    assert.equal(campaign[3], 'Genesis Campaign');
  });

  it('Has a Genesis Token', async () => {
    const instance = await IGVCore.deployed();
    const token = await instance.getToken(0, 0);

    assert.equal(token[3], 'Genesis Token');
  });
  it('Has a Genesis Certificate', async () => {
    const instance = await IGVCore.deployed();
    const certificate = await instance.getCertificate(0);

    assert.equal(certificate[0].toNumber(), 0);
    assert.equal(certificate[1].toNumber(), 0);
  });

  it('Creates a new Campaign', async () => {
    const instance = await IGVCore.deployed();
    await instance.createCampaign(
      10000,
      20000,
      'Test Campaign',
      '501c-here',
      { from: accounts[0], value: 100000000000 }
    );

    const campaign = await instance.getCampaign(1);

    assert.equal(campaign[0].toNumber(), 10000);
    assert.equal(campaign[1].toNumber(), 20000);
    assert.equal(campaign[2], accounts[0]);
    assert.equal(campaign[3], 'Test Campaign');
  });
  it('Checks the escrow balance', async () => {
    const instance = await IGVCore.deployed();
    const balance = await instance.getEscrowBalance(1);

    assert.equal(balance.toNumber(), 100000000000);
  })
  it('Adds tokens to the campaign', async () => {
    const instance = await IGVCore.deployed();
    await instance.createToken(
      1,
      10,
      'Test Token',
      1
    );
  });

  it('Looks up the token', async () => {
    const instance = await IGVCore.deployed();
    const token = await instance.getToken(1, 0);

    assert.equal(token[3], 'Test Token');
  });
  it('Buys the certificate', async () => {
    const instance = await IGVCore.deployed();
    await instance.createCertificate(1,0,
      { from: accounts[0], value: 1 })

  });
  it('Token supply goes down by 1', async () => {
    const instance = await IGVCore.deployed();
    const token = await instance.getToken(1, 0);

    assert.equal(token[2].toNumber(), token[1].toNumber()-1);
  });
  it('Certificate purchaser is sender', async () => {
    const instance = await IGVCore.deployed();
    const cert = await instance.getCertificate(1);

    assert.equal(cert[3], web3.eth.accounts[0]);
  });


  it('Creates a silly Campaign', async () => {
    const instance = await IGVCore.deployed();
    await instance.createCampaign(
      10000,
      20000,
      'Silly Campaign',
      '501c-here',
      { from: accounts[0], value: 100000000000 }
    );

    const campaign = await instance.getCampaign(2);

    assert.equal(campaign[0].toNumber(), 10000);
    assert.equal(campaign[1].toNumber(), 20000);
    assert.equal(campaign[2], accounts[0]);
    assert.equal(campaign[3], 'Silly Campaign');
  });
  it('Adds tokens to the silly campaign', async () => {
    const instance = await IGVCore.deployed();
    await instance.createToken(
      2,
      10,
      'Silly Token',
      1
    );
  });
  it('Vetoes the silly campaign', async () => {
    const instance = await IGVCore.deployed();
    await instance.vetoCampaign(2);
  });
  it('Fails to veto from the wrong account', async () => {
    const instance = await IGVCore.deployed();
    let error;
    try {
      await instance.vetoCampaign(2, {from: web3.eth.accounts[1]});
    } catch (e) {
      error = e;
    }

    assert.isNotNull(error);
  });
  it('Checks the silly campaign and token', async () => {
    const instance = await IGVCore.deployed();
    const campaign = await instance.getCampaign(2);
    const token = await instance.getToken(2, 0);

    assert.equal(token[3], '');
    assert.equal(campaign[3], '');
  });
  it('Takes the silly campaign escrow', async () => {
    const instance = await IGVCore.deployed();

    await instance.claimEscrow(2);
  });
});

