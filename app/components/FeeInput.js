import React from "react";
import DecredInput from "./DecredInput";
import { FormattedMessage as T } from "react-intl";

const FeeInput = ({
  showErrors,
  invalidMessage,
  requiredMessage,
  required,
  invalid,
  fee,
  placeholder,
  disabled,
  readOnly,
  onChangeFee,
}) => {
  return (
    <div className="input-wrapper">
      <div className="stakepool-purchase-ticket-label">
        <T id="purchaseTickets.ticketFee" m="Ticket Fee (DCR/kB)" />
        :</div>
      <DecredInput
        showErrors={showErrors}
        invalidMessage={invalidMessage}
        requiredMessage={requiredMessage}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        required={required}
        invalid={invalid}
        value={fee}
        onChange={onChangeFee}
      />
    </div>
  );
};

export default FeeInput;
