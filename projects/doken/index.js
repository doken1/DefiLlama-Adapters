const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const DOKEN_TOKEN_CONTRACT = '0xf9a2d40589271be17612a3f57a9028a568f56e3d';
const DOKEN_BOND_CONTRACT = '';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'bsc',
    target: DOKEN_TOKEN_CONTRACT,
    params: [DOKEN_BOND_CONTRACT],
    block: chainBlocks['bsc'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(DOKEN_TOKEN_CONTRACT), collateralBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of DOKEN tokens in the Club Bonding contract.'
  start: 1000235,
  bsc: {
    tvl,
  }
}; 
