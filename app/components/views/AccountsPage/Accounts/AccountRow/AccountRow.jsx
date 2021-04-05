import Row from "./AccountRowContent";
import AccountDetails from "./AccountDetails";
import RenameAccount from "./RenameAccount";
import { useAccountRow } from "./hooks";

const AccountRow = ({
  account,
  mixedAccount,
  accountNumDetailsShown,
  renameAccount,
  showAccount,
  hideAccount,
  onGetAccountExtendedKey,
  accountExtendedKey,
  hasTickets
}) => {
  const {
    isShowingRenameAccount,
    renameAccountName,
    hidden,
    hasFailedAttempt,
    showPubKey,
    isShowingDetails,
    updateRenameAccountName,
    renameAccountCallback,
    showRenameAccount,
    hideRenameAccount,
    showAccountCallback,
    hideAccountCallback,
    onTogglePubkey,
    onToggleShowDetails,
    intl,
    onSetAccountPassphrase,
    changeAccount
  } = useAccountRow(
    account,
    accountNumDetailsShown,
    renameAccount,
    showAccount,
    hideAccount,
    onGetAccountExtendedKey
  );

  const getRenameAccountStyles = () => (
    <RenameAccount
      {...{
        account,
        updateRenameAccountName,
        renameAccountName,
        renameAccount: renameAccountCallback,
        hideRenameAccount,
        intl,
        hasFailedAttempt
      }}
    />
  );

  const getAccountDetailsStyles = () => (
    <AccountDetails
      {...{
        account,
        showRenameAccount,
        hidden,
        hideAccount: hideAccountCallback,
        showAccount: showAccountCallback,
        onTogglePubkey,
        showPubKey,
        accountExtendedKey,
        onSetAccountPassphrase,
        changeAccount
      }}
    />
  );

  return (
    <Row
      {...{
        account,
        mixedAccount,
        changeAccount,
        accountNumDetailsShown,
        isShowingRenameAccount,
        hidden,
        getRenameAccountStyles,
        getAccountDetailsStyles,
        onToggleShowDetails,
        isShowingDetails,
        hasTickets
      }}
    />
  );
};

export default AccountRow;
