import UnsignedTickets from "../UnsignedTickets";
import StakeInfo from "../StakeInfo";
import PurchaseTickets from "./form";
import { ShowWarning, Subtitle } from "shared";
import { InfoDocModalButton } from "buttons";
import { FormattedMessage as T } from "react-intl";

const getTitleIcon = () => (
  <InfoDocModalButton
    document="PurchaseTicketsInfo"
    modalClassName="info-modal-fields"
    className="info-title-icon"
    draggable
  />
);

export function PurchasePage({
  spvMode,
  blocksNumberToNextTicket,
  sidebarOnBottom,
  isWatchingOnly,
  ...props
}) {
  return (
    <div className="purchase-ticket-area">
      <Subtitle
        title={<T id="purchase.subtitle" m="Purchase Tickets" />}
        children={getTitleIcon()}
        className="is-row"
      />
      <StakeInfo {...{ sidebarOnBottom }} />
      {spvMode && blocksNumberToNextTicket === 2 ? (
        <ShowWarning
          warn={
            <T
              id="spv.purchase.warn"
              m="Purchase Tickets is not available right now, because we are at the end of a ticket interval. After one block it will be available again."
            />
          }
        />
      ) : (
          <PurchaseTickets />
        )}
      {isWatchingOnly && <UnsignedTickets {...{ ...props }} />}
    </div>
  )
}