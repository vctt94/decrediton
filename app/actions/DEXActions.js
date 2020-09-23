
import * as dex from "middleware/dcrdexapi";
import fs from "fs";
import * as sel from "selectors";

const { DCRDEX_URL_HOST } = dex;

export const getUser = () => (dispatch, getState) => new Promise((resolve, reject) => {
  const dURL = sel.dexURL(getState());
  dex.getUser(dURL)
    .then(response => {
      const { data } = response;
      resolve(data);
    })
    .catch(err => reject(err));
});

export const register = () => (dispatch, getState) => new Promise((resolve, reject) => {
  const dURL = sel.dexURL(getState());
  const request = {
    // addr: 
    // Addr    string           `json:"url"`
    // AppPass encode.PassBytes `json:"appPass"`
    // Fee     uint64           `json:"fee"`
    // Cert    string           `json:"cert"`
  }
  dex.register(dURL, request)
    .then(response => {
      console.log(response)
    })
    .catch(err => reject(err));
});

export const getFee = (addr, cert) => (dispatch, getState) => new Promise((resolve, reject) => {
  const dURL = sel.dexURL(getState());
  dex.getFee(dURL, { addr, cert })
    .then(response => resolve(response.data))
    .catch(err => reject(err));
});

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
