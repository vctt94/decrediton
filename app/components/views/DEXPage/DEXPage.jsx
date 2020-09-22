
import { TabbedPage, TabbedPageTab as Tab, TitleHeader } from "layout";
import { FormattedMessage as T } from "react-intl";
import { Switch, Redirect } from "react-router-dom";
import DEXConfig from "./DEXConfig/DEXConfig";
import { useDEXPage } from "./hooks";
import { useMountEffect } from "hooks";
import { useState } from "react";
import HomeTab from "./HomeTab"
// import LNConnectPage from "./ConnectPage";
// import { default as WalletTab, WalletTabHeader } from "./WalletTab";
// import { default as ChannelsTab, ChannelsTabHeader } from "./ChannelsTab";
// import { default as InvoicesTab, InvoicesTabHeader } from "./InvoicesTab";
// import { default as PaymentsTab, PaymentsTabHeader } from "./PaymentsTab";
// import NetworkTabHeader from "./NetworkTab/NetworkTabHeader";
// import NetworkTab from "./NetworkTab/NetworkTab";

const LNPageHeader = () => (
  <TitleHeader
    iconClassName="ln"DEXPage
    title={<T id="ln.title" m="Lightning Network" />}
  />
);

const LNActivePage = () => (
  <TabbedPage header={<LNPageHeader />}>
    <Switch>
      <Redirect from="/dex" exact to="/dex/overview" />
    </Switch>
    {/* <Tab
      path="/dex/overview"
      component={WalletTab}
      header={WalletTabHeader}
      link={<T id="ln.tab.wallet" m="Wallet" />}
    />
    <Tab
      path="/ln/channels"
      component={ChannelsTab}
      header={ChannelsTabHeader}
      link={<T id="ln.tab.channels" m="Channels" />}
    />
    <Tab
      path="/ln/invoices"
      component={InvoicesTab}
      header={InvoicesTabHeader}
      link={<T id="ln.tab.invoices" m="Invoices" />}
    />
    <Tab
      path="/ln/payments"
      component={PaymentsTab}
      header={PaymentsTabHeader}
      link={<T id="ln.tab.payments" m="Payments" />}
    />
    <Tab
      path="/ln/network"
      component={NetworkTab}
      header={NetworkTabHeader}
      link={<T id="ln.tab.network" m="Network" />}
    /> */}
  </TabbedPage>
);

const DEXPage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { onGetUser } = useDEXPage();
  // The "user" is a large data structure that contains nearly all state
  // information, including exchanges, markets, wallets, and orders. It must
  // be loaded immediately.
  useMountEffect(() => {
    onGetUser().then(user => setUser(user)).catch(err => setError(err))
  });

  // if there is no exchanges registered at dex, we need to config them.
  if (!user) {
    // TODO add loading here
    return <></>
  }
  // check if we have any configured exchanges, otherwise we need to configure
  // them.
  if (Object.keys(user.exchanges).length === 0) {
    return <DEXConfig {...{ user }} />
  }
  console.log(user)
  return <HomeTab />;
}

export default DEXPage;
