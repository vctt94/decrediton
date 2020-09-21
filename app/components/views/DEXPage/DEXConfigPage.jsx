import { StandalonePage, StandaloneHeader } from "layout";
import { FormattedMessage as T } from "react-intl";

const DEXPageHeader = ({
  onCloseWallet,
  walletName,
  isTicketAutoBuyerEnabled
}) => (
    <StandaloneHeader
      title={<T id="settings.title" m="Add DEX" />}
      iconClassName="dex"
      description={
        <T
          id="dex.add"
          m="Add new DEX configuration"
        />
      }
    />
  );

const DEXConfigPage = ({ user }) => {
  console.log(user)
  if (!user.authed) {
    // TODO add form to set app pass
  }
  return (
    <StandalonePage
      header={<DEXPageHeader />}
    >
      <div>
        config dex page
      </div>
    </StandalonePage>
  )
};

export default DEXConfigPage;
