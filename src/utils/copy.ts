const copyToClipboard = (copyValue: string) => {
  const oInput = document.createElement("input");
  oInput.value = copyValue;
  document.body.appendChild(oInput);
  oInput.select();
  document.execCommand("Copy");
  document.body.removeChild(oInput);
};

export { copyToClipboard };
