import { StandalonePage, StandaloneHeader } from "layout";
import { FormattedMessage as T, defineMessages, useIntl } from "react-intl";
import { TextInput, PasswordInput, PathBrowseInput, FeeInput, AccountsSelect } from "inputs";
import { CreatePassphrase } from "shared";
import styles from "../DEXPage.module.css";
import { error } from "xstate/lib/actionTypes";
import { useEffect, useState } from "react";

const messages = defineMessages({
  messageLoginPlaceholder: {
    id: "dex.form.rpcuser.placeholder",
    defaultMessage: "RPC Username"
  },
  passphraseFieldPlaceholder: {
    id: "dex.form.rpcpassword.placeholder",
    defaultMessage: "RPC Password"
  },
  certFieldPlaceholder: {
    id: "dex.form.rpccert.placeholder.",
    defaultMessage: "RPC Certificate path"
  },
  hostFieldPlaceholder: {
    id: "dex.form.rpchost.placeholder.",
    defaultMessage: "RPC Host"
  },
  portFieldPlaceholder: {
    id: "dex.form.rpcport.placeholder.",
    defaultMessage: "RPC Port"
  },
  feeInputPlaceholder: {
    id: "dex.form.feeinput.placeholder.",
    defaultMessage: "FeeInput"
  },
  dexCertFieldPlaceholder: {
    id: "dex.form.dexcert.placeholder.",
    defaultMessage: "DEX Certificate path"
  },
  dexAddressPlaceholder: {
    id: "dex.form.dexaddress.placeholder.",
    defaultMessage: "DEX Address"
  }
});

const DEXPageHeader = ({
  onCloseWallet,
  walletName,
  isTicketAutoBuyerEnabled
}) => (
    <StandaloneHeader
      title={<T id="dex.title" m="Add DEX" />}
      iconClassName="dex"
      description={
        <T
          id="dex.add"
          m="Add new DEX configuration"
        />
      }
    />
  );

const CreatePass = ({ onSubmit, onChange }) => (
  <div>
    <CreatePassphrase onSubmit={onSubmit} onChange={onChange} >
    </CreatePassphrase>
  </div>
);

const AddWallet = () => (
  <>
    <AccountsSelect
      className={styles.sendInput}
      {...{
        account,
        filterAccounts,
        onChange: onChangeAccount,
        accountsType: "visible",
        showAccountsButton: true
      }}
    />
    <div className={styles.daemonRow}>
      <div className={styles.daemonLabel}>
        <T id="dex.remote.rpcuser" m="RPC User" />
      </div>
      <div className={styles.daemonInput}>
        <TextInput
          required
          value={rpcUser}
          onChange={(e) => setRpcUser(e.target.value)}
          placeholder={intl.formatMessage(messages.messageLoginPlaceholder)}
          showErrors={formErrors.rpcUser}
        />
      </div>
    </div>
    <div className={styles.daemonRow}>
      <div className={styles.daemonLabel}>
        <T id="dex.remote.rpcpass" m="RPC Password" />
      </div>
      <div className={styles.daemonInput}>
        <PasswordInput
          required
          value={rpcPass}
          onChange={(e) => setRpcPass(e.target.value)}
          placeholder={intl.formatMessage(messages.passphraseFieldPlaceholder)}
          showErrors={formErrors.rpcPass}
        />
      </div>
    </div>
    <div className={styles.daemonRow}>
      <div className={styles.daemonLabel}>
        <T id="dex.remote.rpccert" m="dcrwallet TLS Path" />
      </div>
      <div className={styles.daemonInput}>
        <PathBrowseInput
          required
          type="file"
          value={dcrwalletRpcCert}
          onChange={(value) => setRpcCert(value)}
          placeholder={intl.formatMessage(messages.certFieldPlaceholder)}
          showErrors={formErrors.dcrwalletRpcCert}
        />
      </div>
    </div>
    <div className={styles.daemonRow}>
      <div className={styles.daemonLabel}>
        <T id="dex.remote.rpchost" m="RPC Host" />
      </div>
      <div className={styles.daemonInput}>
        <TextInput
          required
          value={rpcHost}
          onChange={(e) => setRpcHost(e.target.value)}
          placeholder={intl.formatMessage(messages.hostFieldPlaceholder)}
          showErrors={formErrors.rpcHost}
        />
      </div>
    </div>
    <div className={styles.daemonRow}>
      <div className={styles.daemonLabel}>
        <T id="dex.remote.rpcport" m="RPC Port" />
      </div>
      <div className={styles.daemonInput}>
        <TextInput
          required
          value={rpcPort}
          onChange={(e) => setRpcPort(e.target.value)}
          placeholder={intl.formatMessage(messages.portFieldPlaceholder)}
          showErrors={formErrors.rpcPort}
        />
      </div>
    </div>
    <div className={styles.daemonRow}>
      <div className={styles.daemonLabel}>
        <T id="dex.remote.feeinput" m="Fee Input" />
      </div>
      <FeeInput
        required
        value={feeInput}
        onChange={e => setFeeInput(e.target.value)}
        placeholder={intl.formatMessage(messages.feeInputPlaceholder)}
        showErrors={formErrors.feeInput}
      />
    </div>
  </>
);

const AddDex = ({ dexAddress, setDexAddress, dexCert, setDexCert }) => (
  <>
      <div className={styles.daemonRow}>
      <div className={styles.daemonLabel}>
        {intl.formatMessage(messages.dexAddressPlaceholder)}
      </div>
      <div className={styles.daemonInput}>
        <TextInput
          required
          value={dexAddress}
          onChange={(e) => setDexAddress(e.target.value)}
          placeholder={intl.formatMessage(messages.dexAddressPlaceholder)}
          showErrors={formErrors.dexAddress}
        />
      </div>
    </div>
    <div className={styles.daemonRow}>
      <div className={styles.daemonLabel}>
        {intl.formatMessage(messages.dexCertFieldPlaceholder)}
      </div>
      <div className={styles.daemonInput}>
        <PathBrowseInput
          required
          type="file"
          value={dexCert}
          onChange={(value) => setDexCert(value)}
          placeholder={intl.formatMessage(messages.dexCertFieldPlaceholder)}
          showErrors={formErrors.dexCert}
        />
      </div>
    </div>
  </>
);

const DEXConfigPage = ({
  user,
  rpcUser,
  rpcPass,
  dcrwalletRpcCert,
  rpcHost,
  rpcPort,
  feeInput,
  account,
  filterAccounts,
  onChangeAccount,
  accountsType,
  configStep,
  // error is an object which can contain multiple inputs errors.
  formErrors
}) => {
  const [contentComponent, setContentComp] = useState(null);
  const intl = useIntl();

  const getConfigStep = (step) => {
    let component;
    switch (step) {
      case 0:
        component = CreatePass({
          onSubmit: () => console.log("submit function"),
          onChange: () => console.log("on change")
        });
        setContentComp(component);
        break;
      case 1:
        component = AddWallet();
        break;
      case 2:
        component = AddDEX();
        break;
    }
  }

  useEffect(() => {
    getConfigStep(configStep);
  }, [configStep])

  return (
    <StandalonePage header={<DEXPageHeader />}>
      { contentComponent }
    </StandalonePage >
  )
};

export default DEXConfigPage;
