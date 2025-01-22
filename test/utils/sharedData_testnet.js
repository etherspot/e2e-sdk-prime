// chain configurations
const chainConfigs = {
  11155111: {
    name: 'sepolia',
    invalidId: 11155122,
    incorrectId: 84555,
    toChainId: 80002,
    toTokenAddress: '0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904',
    toTokenName: 'USDC',
    incorrectToTokenAddress: '0x0Ad9e1d3aF1acee056EB9e502c3A765a667b1905',
    invalidToTokenAddress: '0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b190',
    tokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    tokenName: 'USDC',
    incorrectTokenAddress: '0x1a7D4A196Cb0C2B01d748Fbc6116a302379C7233',
    invalidTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C723',
    tokenAddressUsdt: '0xe90a57A45F1Eae578F5aec8eed5bA8Fc6F55eF65',
    tokenNameUsdt: 'USDT',
    incorrectTokenAddressUsdt: '0xe10b57A45A1Eae178F5aec8aed5bA8Fc6F55eF15',
    invalidTokenAddressUsdt: '0xe90a57A45F1Eae578F5aec8eed5bA8Fc6F55eF6',
    providerNetwork: 'https://testnet-rpc.etherspot.io/v1/11155111',
    invalidProviderNetwork: 'http://testnet-rpc.etherspot.io/v1/11155111',
    otherProviderNetwork: 'https://testnet-rpc.etherspot.io/v1/80002',
  },
};

// convert configurations to arrays for backward compatibility
const chainId = Object.keys(chainConfigs).map(Number);
const chainName = chainId.map((id) => chainConfigs[id].name);
const invalid_chainId = chainId.map((id) => Number(chainConfigs[id].invalidId));
const incorrect_chainId = chainId.map((id) =>
  Number(chainConfigs[id].incorrectId)
);
const toChainId = chainId.map((id) => chainConfigs[id].toChainId);
const toTokenAddress = chainId.map((id) => chainConfigs[id].toTokenAddress);
const toTokenName = chainId.map((id) => chainConfigs[id].toTokenName);
const invalid_toTokenAddress = chainId.map(
  (id) => chainConfigs[id].invalidToTokenAddress
);
const incorrect_toTokenAddress = chainId.map(
  (id) => chainConfigs[id].incorrectToTokenAddress
);

const tokenAddress = chainId.map((id) => chainConfigs[id].tokenAddress);
const tokenName = chainId.map((id) => chainConfigs[id].tokenName);
const invalid_tokenAddress = chainId.map(
  (id) => chainConfigs[id].invalidTokenAddress
);
const incorrect_tokenAddress = chainId.map(
  (id) => chainConfigs[id].incorrectTokenAddress
);
const tokenAddressUsdt = chainId.map((id) => chainConfigs[id].tokenAddressUsdt);
const tokenNameUsdt = chainId.map((id) => chainConfigs[id].tokenNameUsdt);
const invalid_tokenAddressUsdt = chainId.map(
  (id) => chainConfigs[id].invalidTokenAddressUsdt
);
const incorrect_tokenAddressUsdt = chainId.map(
  (id) => chainConfigs[id].incorrectTokenAddressUsdt
);
const providerNetwork = chainId.map((id) => chainConfigs[id].providerNetwork);
const invalidProviderNetwork = chainId.map(
  (id) => chainConfigs[id].invalidProviderNetwork
);
const otherProviderNetwork = chainId.map(
  (id) => chainConfigs[id].otherProviderNetwork
);

// Get chain ID from CLI or random selection
const getSelectedChain = () => {
  // Check for CLI parameter
  const args = process.argv.slice(2);
  const chainIdArg = args.find((arg) => arg.startsWith('--chainId='));

  if (chainIdArg) {
    const selectedChainId = Number(chainIdArg.split('=')[1]);

    // Validate the provided chain ID
    if (!chainConfigs[selectedChainId]) {
      throw new Error(
        `Invalid chainId: ${selectedChainId}. Supported chains: ${chainId.join(', ')}`
      );
    }

    return {
      chainId: selectedChainId,
      index: chainId.indexOf(selectedChainId),
    };
  }

  // Random selection if no chainId specified
  const randomIndex = Math.floor(Math.random() * chainId.length);
  return {
    chainId: chainId[randomIndex],
    index: randomIndex,
  };
};

// Get the selected or random chain
const { chainId: selectedChainId, index: selectedIndex } = getSelectedChain();

// Export the selected values
const randomChainId = selectedChainId;
const randomChainName = chainName[selectedIndex];
const randomInvalidChainId = invalid_chainId[selectedIndex];
const randomIncorrectChainId = incorrect_chainId[selectedIndex];
const randomToChainId = toChainId[selectedIndex];
const randomToTokenAddress = toTokenAddress[selectedIndex];
const randomToTokenName = toTokenName[selectedIndex];
const randomInvalidToTokenAddress = invalid_toTokenAddress[selectedIndex];
const randomIncorrectToTokenAddress = incorrect_toTokenAddress[selectedIndex];
const randomTokenAddress = tokenAddress[selectedIndex];
const randomTokenName = tokenName[selectedIndex];
const randomInvalidTokenAddress = invalid_tokenAddress[selectedIndex];
const randomIncorrectTokenAddress = incorrect_tokenAddress[selectedIndex];
const randomTokenAddressUsdt = tokenAddressUsdt[selectedIndex];
const randomTokenNameUsdt = tokenNameUsdt[selectedIndex];
const randomInvalidTokenAddressUsdt = invalid_tokenAddressUsdt[selectedIndex];
const randomIncorrectTokenAddressUsdt =
  incorrect_tokenAddressUsdt[selectedIndex];
const randomProviderNetwork = providerNetwork[selectedIndex];
const randomInvalidProviderNetwork = invalidProviderNetwork[selectedIndex];
const randomOtherProviderNetwork = otherProviderNetwork[selectedIndex];

export {
  randomChainId,
  randomChainName,
  randomInvalidChainId,
  randomIncorrectChainId,
  randomToChainId,
  randomToTokenAddress,
  randomToTokenName,
  randomInvalidToTokenAddress,
  randomIncorrectToTokenAddress,
  randomTokenAddress,
  randomTokenName,
  randomInvalidTokenAddress,
  randomIncorrectTokenAddress,
  randomTokenAddressUsdt,
  randomTokenNameUsdt,
  randomIncorrectTokenAddressUsdt,
  randomInvalidTokenAddressUsdt,
  randomProviderNetwork,
  randomInvalidProviderNetwork,
  randomOtherProviderNetwork,
};
