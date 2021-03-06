import { service, settings } from "connectors";
import ErrorScreen from "ErrorScreen";
import SettingsPage from "./Page";

@autobind
class Settings extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      onAttemptChangePassphrase,
      onSaveSettings,
      onCloseWallet,
    } = this;

    return !this.props.walletService ? <ErrorScreen /> : (
      <SettingsPage
        {...{
          ...this.props, ...this.state }}
        {...{
          onAttemptChangePassphrase,
          onSaveSettings,
          onCloseWallet
        }}
      />
    );
  }

  onAttemptChangePassphrase(oldPass, newPass, priv) {
    const { onAttemptChangePassphrase } = this.props;
    onAttemptChangePassphrase && onAttemptChangePassphrase(oldPass, newPass, priv);
  }

  onSaveSettings() {
    const { onSaveSettings, tempSettings } = this.props;
    onSaveSettings && onSaveSettings(tempSettings);
  }

  onCloseWallet() {
    this.props.onCloseWallet();
  }
}

export default settings(service(Settings));
