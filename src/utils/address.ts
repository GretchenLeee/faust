const abbreviateAddress = (address: string, chars = 4) => {
  const prefix = address.slice(0, chars + 2);
  const suffix = address.slice(-chars);
  return `${prefix}...${suffix}`;
};

const getAddressFromPkh = (pkh: string) => {
  return pkh.slice(pkh.lastIndexOf(":") + 1);
}

export { abbreviateAddress, getAddressFromPkh };
