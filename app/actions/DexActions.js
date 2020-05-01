
import * as dex from "middleware/dcrdexapi";
import * as sel from "selectors";

const { DCRDEX_URL_HOST } = dex;

export const GET_DEX_USER_SUCCESS = "GET_DEX_USER_SUCCESS";
export const getUser = () => (dispatch, getState) => {
  const treasuryAddress = sel.chainParams(getState()).TreasuryAddress;
  const dURL = sel.dexURL(getState());
  dex.getUser(dURL)
    .then(user => {
      console.log(user)
    });
};

const updateWalletRoute = 'update_wallet';
const notificationRoute = 'notify';

export const connectSocket = () => (dispatch, getState) => {
  dex.ws.connect(`ws://${DCRDEX_URL_HOST}/ws`);
  console.log(dex.ws.registerRoute)
  dex.ws.registerRoute(updateWalletRoute, wallet => {
    console.log("***************************************************")
    console.log(wallet);
    // this.assets[wallet.assetID].wallet = wallet
    // this.walletMap[wallet.assetID] = wallet
    // const balances = this.main.querySelectorAll(`[data-balance-target="${wallet.assetID}"]`)
    // balances.forEach(el => { el.textContent = (wallet.balance / 1e8).toFixed(8) })
  })
  dex.ws.registerRoute(notificationRoute, note => {
    this.notify(note)
  })
}
