// chain configurations
const chainConfigs = {
  100: {
    name: 'gnosis',
    invalidId: '110 ',
    incorrectId: '111000',
    toChainId: '137',
    toTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    toTokenName: 'USDC',
    incorrectToTokenAddress: '0x2791Bca1f2de4661ED88A30C99A719449Aa84174',
    invalidToTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa8417',
    tokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    tokenName: 'USDC',
    incorrectTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc19B60fb7A83',
    invalidTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A8',
    tokenAddressUsdt: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
    tokenNameUsdt: 'USDT',
    incorrectTokenAddressUsdt: '0xAECDBa5770353855a9F068104A40E0f32e2605C6',
    invalidTokenAddressUsdt: '0x4ECaBa5870353805a9F068101A40E0f32ed605C',
    providerNetwork: 'https://rpc.etherspot.io/gnosis',
    invalidProviderNetwork: 'http://rpc.etherspot.io/gnosis',
    otherProviderNetwork: 'https://rpc.etherspot.io/polygon',
  },
  137: {
    name: 'polygon',
    invalidId: '110 ',
    incorrectId: '1730',
    toChainId: '100',
    toTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    toTokenName: 'USDC',
    incorrectToTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc19B60fb7A83',
    invalidToTokenAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A8',
    tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    tokenName: 'USDC',
    incorrectTokenAddress: '0x2791Bca1f2de4661ED88A30C99A719449Aa84174',
    invalidTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa8417',
    tokenAddressUsdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    tokenNameUsdt: 'USDT',
    incorrectTokenAddressUsdt: '0xAECDBa5770353855a9F068104A40E0f32e2605C6',
    invalidTokenAddressUsdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8',
    providerNetwork: 'https://polygon-bundler.etherspot.io',
    invalidProviderNetwork: 'http://polygon-bundler.etherspot.io',
    otherProviderNetwork: 'https://arbitrum-bundler.etherspot.io',
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
