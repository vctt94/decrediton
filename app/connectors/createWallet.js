import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { selectorMap } from "fp";
import * as sel from "selectors";
import * as da from "actions/DaemonActions";
import * as wla from "actions/WalletLoaderActions";
import * as ca from "actions/ClientActions";
import * as trza from "actions/TrezorActions";

const mapStateToProps = selectorMap({
  isTestNet: sel.isTestNet,
  isCreatingWatchingOnly: sel.isWatchingOnly,
  maxWalletCount: sel.maxWalletCount,
  trezorDeviceList: sel.trezorDeviceList,
  trezorDevice: sel.trezorDevice,
  isTrezor: sel.isTrezor
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      backToCredentials: da.backToCredentials,
      cancelCreateWallet: wla.cancelCreateWallet,
      createWalletRequest: wla.createWalletRequest,
      copySeedToClipboard: ca.copySeedToClipboard,
      createWatchOnlyWalletRequest: wla.createWatchOnlyWalletRequest,
      generateSeed: wla.generateSeed,
      decodeSeed: wla.decodeSeed,
      trezorEnable: trza.enableTrezor,
      trezorDisable: trza.disableTrezor,
      trezorAlertNoConnectedDevice: trza.alertNoConnectedDevice,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps);
