let privateKey = null;
let modularAccountAddress = null;
let testnetModularSdk = null;

function setPrivateKey(privatekey) {
  privateKey = privatekey;
}
function getPrivateKey() {
  return privateKey;
}
function setModularAccountAddress(address) {
  modularAccountAddress = address;
}
function getModularAccountAddress() {
  return modularAccountAddress;
}
function setTestnetModularSdk(sdk) {
  testnetModularSdk = sdk;
}
function getTestnetModularSdk() {
  return testnetModularSdk;
}

export default {
  setModularAccountAddress,
  getModularAccountAddress,
  setTestnetModularSdk,
  getTestnetModularSdk,
  setPrivateKey,
  getPrivateKey,
};
