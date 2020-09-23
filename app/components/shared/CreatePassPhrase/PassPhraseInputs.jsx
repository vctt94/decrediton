import { FormattedMessage as T, injectIntl, defineMessages } from "react-intl";
import { PasswordInput } from "inputs";
import { InfoDocFieldModalButton } from "buttons";
import { classNames } from "pi-ui";
import styles from "./CreatePassPhrase.module.css";

const messages = defineMessages({
  passphrasePlaceholder: {
    id: "createWallet.passphrasePlaceholder",
    defaultMessage: "Private Passphrase"
  },
  verifyPassphrasePlaceholder: {
    id: "createWallet.verifyPassphrasePlaceholder",
    defaultMessage: "Confirm Private Passphrase"
  }
});
const passPhraseLabel = <T
  id="createWallet.passhraseInput.label"
  m="Private passphrase"
  />;

const passPhraseVerificationLabel = <T
    id="createWallet.passphraseInput.verifyLabel"
    m="Repeat Private Passphrase"
  />;
const blankPassPhraseError = <T
    id="createWallet.passphraseInput.errors.noPassPhrase"
    m="*Please enter your private passphrase"
  />;
const passPhraseVerificationError = <T
    id="createWallet.passphraseInput.errors.noMatch"
    m="*Passphrases do not match"
  />;

const PassPhraseInputs = ({
  newPassphrase,
  passphraseConfirm,
  setNewpassphrase,
  setPassphrase,
  setPassphraseConfirm,
  intl,
  onKeyDown,
  hasFailedAttempt,
  isValid
}) => (
  <>
    <div className={classNames("is-row", styles.passphraseRow)}>
      <div
        className={classNames(
          "is-row",
          styles.confirmSeedLabel,
          styles.passphraseRow
        )}>
        <InfoDocFieldModalButton document="PassphraseInfo" />
        <div>{passPhraseLabel}</div>
      </div>
      <form>
        <PasswordInput
          required
          className={styles.inputPrivatePassword}
          placeholder={intl.formatMessage(messages.passphrasePlaceholder)}
          value={newPassphrase}
          onKeyDown={onKeyDown}
          onChange={(e) => setNewpassphrase(e.target.value)}
          showErrors={newPassphrase !== null && !isValid}
          requiredMessage={blankPassPhraseError}
        />
      </form>
    </div>
    <div className={classNames("is-row", styles.passphraseRow)}>
      <div
        className={classNames(styles.confirmSeedLabel, styles.passphraseRow)}>
        {passPhraseVerificationLabel}
      </div>
      <form>
        <PasswordInput
          className={styles.inputPrivatePassword}
          invalid={!isValid}
          invalidMessage={passPhraseVerificationError}
          placeholder={intl.formatMessage(messages.verifyPassphrasePlaceholder)}
          value={passphraseConfirm}
          onKeyDown={onKeyDown}
          onChange={(e) => setPassphraseConfirm(e.target.value)}
          showErrors={passphraseConfirm !== null && !isValid}
        />
      </form>
    </div>
  </>
);

export default injectIntl(PassPhraseInputs);
