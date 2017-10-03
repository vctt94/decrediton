// @flow
import React from "react";
import ReactToolTip from "react-tooltip";
import rescan from "../../../connectors/rescan";
import home from "../../../connectors/home";
import DecredLoading from "../../DecredLoading";
import KeyBlueButton from "../../KeyBlueButton";
import PassphraseModal from "../../PassphraseModal";
import Balance from "../../Balance";
import SideBar from "../../SideBar";
import TxHistory from "../../TxHistory";
import Header from "../../Header";
import "../../../style/Layout.less";
import "../../../style/Fonts.less";
import "../../../style/HomePage.less";

const HomePage = ({
  synced,
  spendableTotalBalance,
  rescanAttempt,
  isRequestingPassphrase,
  passphraseCallback,
  hasTicketsToRevoke,
  revokeTicketsSuccess,
  revokeTicketsError,
  passphraseHeading,
  passphraseDescription,
  onCancelPassphraseRequest,
  onShowRevokeTicket,
  rescanRequest,
  transactions,
  getTransactionsRequestAttempt,
  getAccountsResponse,
  onClearRevokeTicketsError,
  onClearRevokeTicketsSuccess,
}) => (
  <div>
    <PassphraseModal
      hidden={!isRequestingPassphrase}
      submitPassphrase={passphraseCallback}
      cancelPassphrase={onCancelPassphraseRequest}
      heading={passphraseHeading}
      description={passphraseDescription}
    />
    <div className="page-body">
      <SideBar />
      <div className="page-view">
        <Header
          headerTop={[synced ? null : (
            <div key="notSynced" className="home-view-notification-not-synced">
              The wallet is not fully synced yet. Note: Balances will not be accurate until syncing is complete.
            </div>
            ),
            revokeTicketsError ? (
            <div key="revokeTicketsError" className="stakepool-view-notification-error">
              <div className="stakepool-content-nest-address-delete-icon" onClick={onClearRevokeTicketsError}/>
              {revokeTicketsError}
            </div>
          ) : null,
            revokeTicketsSuccess ? (
            <div key="revokeTicketsSuccess" className="stakepool-view-notification-success">
              <div className="stakepool-content-nest-address-delete-icon" onClick={onClearRevokeTicketsSuccess}/>
              {revokeTicketsSuccess}
            </div>
          ) : null,
          ]}
          headerTitleOverview="Available Balance"
          headerMetaOverview={
            <div>
              <Balance amount={spendableTotalBalance} />
              <div className="home-rescan-button-area" data-html={true} data-tip="Rescanning may help resolve some balance errors.<br><br><b>Note:</b> This scans the entire blockchain for transactions,<br>but does not re-download it.">
                <KeyBlueButton disabled={rescanRequest} onClick={() => rescanAttempt(0)}>Rescan Blockchain</KeyBlueButton>
              </div>
              <ReactToolTip disable={rescanRequest ? true : false} place="left" type="info" effect="solid"/>
            </div>
          }
        />
        {getTransactionsRequestAttempt ? (
          <div className="page-content"><DecredLoading/></div>
        ) : (
          <div>
            <div className="page-content">
            {hasTicketsToRevoke ? <div className="tickets-to-revoke-warning">
              You have outstanding missed or expired tickets, please revoke them to unlock your funds
              <KeyBlueButton
                className="stakepool-content-revoke-button"
                onClick={onShowRevokeTicket}
              >Revoke</KeyBlueButton>
              </div> : null}
              <div className="home-content-title">
                <div className="home-content-title-text">Recent Transactions</div>
              </div>
              <div className="home-content-nest">
                {(transactions.length > 0) ? (
                  <TxHistory {...{ getAccountsResponse, transactions }} />
                ) : (
                  <p>No transactions</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );

export default home(rescan(HomePage));

/*
  This is the transaction search button that needs to get implemented
  <div style={HomeStyles.contentTitleButtonSearch}></div>

*/
