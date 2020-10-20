import { FormattedMessage as T } from "react-intl";
import { PassphraseModalField, VSPSelect, AccountsSelect } from "inputs";
import { PassphraseModal } from "modals";

const SyncVSPFailedTickets = ({
  account,
  setVSP,
  setAccount,
  onSubmit,
  show,
  props
}) => (
  <PassphraseModal {...{ show, onSubmit, ...props }}>
    <PassphraseModalField
      label={
        <T
          id="addMixerAccountModal.mixedAccountName"
          m="Mixed Account Name"
        />
      }>
      <VSPSelect
      className="stakepool-purchase-ticket-input-select"
      {...{ account, onChange: setVSP }}
      />

    </PassphraseModalField>
    <PassphraseModalField
      label={
        <T
          id="addMixerAccountModal.changeAccountName"
          m="Account"
        />
      }>
      <AccountsSelect
      className="stakepool-purchase-ticket-input-select"
      {...{ account, onChange: setAccount }}
      />
    </PassphraseModalField>
  </PassphraseModal>
);

export default SyncVSPFailedTickets;
