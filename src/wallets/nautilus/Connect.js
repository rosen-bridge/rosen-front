export const connectNautilus = async() => {
  const granted = await window.ergoConnector?.nautilus?.connect({
    createErgoObject: false,
  });

  if(!granted) {
    alert('Failed to connect!');
    return false
  }
  return true;
}

export const checkNautilusConnected = async() => {
  return window.ergoConnector?.nautilus?.isConnected();
}
