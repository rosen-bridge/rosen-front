import { checkNautilusConnected } from ".";
export const getBalance = async(token) => {
  if(!await checkNautilusConnected()){
    alert("Please connect to Nautilus first");
    return;
  }
  const context = await window.ergoConnector.nautilus.getContext();
  return context.get_balance(token);
}
