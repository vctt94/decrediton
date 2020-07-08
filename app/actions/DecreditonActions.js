import { push as pushHistory, goBack } from "connected-react-router";



export const showTicketList = (status) => (dispatch) =>
  dispatch(pushHistory("/tickets/mytickets/" + status));

export const showPurchaseTicketsPage = () => (dispatch) =>
  dispatch(pushHistory("/tickets/purchase"));

export const goBackHistory = () => (dispatch) => dispatch(goBack());

export const goToTransactionHistory = () => (dispatch) => {
  dispatch(pushHistory("/transactions/history"));
};

export const goToMyTickets = () => (dispatch) => {
  dispatch(pushHistory("/tickets/mytickets"));
};

export const goToError = () => (dispatch) => {
  dispatch(pushHistory("/error"));
};

export const goToHomePage = () => (dispatch) =>
  dispatch(pushHistory("/home"));
