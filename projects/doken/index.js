const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const { addTokensAndLPs } = require("../helper/unwrapLPs");
const erc20 = require("../helper/abis/erc20.json");

const CHEFS = {
  "bsc": "0xf9a2d40589271be17612a3f57a9028a568f56e3d"
}

async function chainTvl(timestamp, block, chainBlocks, chain) {
  const chef = CHEFS[chain];
  const poolLength = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: chef,
        chain: chain,
        block: chainBlocks[chain],
      })
    ).output
  );
  const poolIds = Array.from(Array(poolLength).keys());

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.poolInfo,
      calls: poolIds.map((pid) => ({
        target: chef,
        params: pid,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((lp) => ({ output: lp.output[0].toLowerCase() }));

  const amounts = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: lpTokens.map((lp) => ({
        target: lp.output,
        params: chef,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  )

  const balances = {};
  const tokens = { output: lpTokens };
  const transformAddress = addr => `${chain}:${addr}`;
  await addTokensAndLPs(
    balances,
    tokens,
    amounts,
    chainBlocks[chain],
    chain,
    transformAddress
  );

  return balances;
}

async function bscTvl(timestamp, block, chainBlocks) {
  return await chainTvl(timestamp, block, chainBlocks, "bsc")
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  bsc: {
    tvl: bscTvl,
  },
}
