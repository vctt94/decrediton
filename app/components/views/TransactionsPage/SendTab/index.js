import { service, send } from "connectors";
import SendPage from "./Page";
import ErrorScreen from "ErrorScreen";
import { FormattedMessage as T } from "react-intl";
import { spring, presets } from "react-motion";
import OutputRow from "./OutputRow";
import { DescriptionHeader } from "layout";

export const SendTabHeader = service(({ isTestNet }) =>
  <DescriptionHeader
    description={isTestNet
      ? <T id="transactions.description.send.testnet" m={"Testnet Decred addresses always begin with letter T and contain 26-35 alphanumeric characters\n(e.g. TxxXXXXXxXXXxXXXXxxx0XxXXXxxXxXxX0)."} />
      : <T id="transactions.description.send.mainnet" m={"Mainnet Decred addresses always begin with letter D and contain 26-35 alphanumeric characters\n(e.g. DxxXXXXXxXXXxXXXXxxx0XxXXXxxXxXxX0X)."} />}
  />);

@autobind
class Send extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowingConfirm: false,
      isSendAll: false,
      isSendSelf: false,
      outputs: [ { key: "output_0", data: this.getBaseOutput() } ],
      sendAllAmount: this.props.totalSpent,
      unsignedRawTx: null,
      account: this.props.defaultSpendingAccount,
      insuficientFunds: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { constructTxLowBalance, unsignedRawTx, isWatchingOnly, nextAddress, publishTxResponse } = this.props;
    const { isSendSelf, outputs } = this.state;
    if (publishTxResponse && publishTxResponse !== prevProps.publishTxResponse) {
      this.setState({ outputs: [ { key: "output_0", data: this.getBaseOutput() } ] });
    }
    if (isSendSelf && (prevProps.nextAddress != nextAddress)) {
      let newOutputs = outputs.map(o => ({ ...o, data:{ ...o.data, destination: nextAddress } }));
      this.setState({ outputs: newOutputs }, this.onAttemptConstructTransaction);
    }
    if (constructTxLowBalance !== prevProps.constructTxLowBalance) {
      if (constructTxLowBalance) {
        this.setState({ insuficientFunds: true });
      } else {
        this.setState({ insuficientFunds: false });
      }
    }
    if (unsignedRawTx !== prevProps.unsignedRawTx && isWatchingOnly) {
      this.setState({ unsignedRawTx });
    }
  }

  render() {
    if (!this.props.walletService) {
      return  <ErrorScreen />;
    }

    const {
      onChangeAccount,
      onShowConfirm,
      onShowSendAll,
      onHideSendAll,
      onShowSendSelf,
      onShowSendOthers,
      onAttemptConstructTransaction,
      onAddOutput,
      onValidateAmount,
      willEnter,
      willLeave,
      getStyles,
      getDefaultStyles,
      onKeyDown,
      resetShowPassphraseModal,
    } = this;
    const isValid = this.getIsValid();
    const showPassphraseModal = this.getShowPassphraseModal();

    return (
      <SendPage
        {...{ ...this.props, ...this.state }}
        {...{
          isValid,
          onKeyDown,
          onChangeAccount,
          onShowConfirm,
          onShowSendAll,
          onHideSendAll,
          onShowSendSelf,
          onShowSendOthers,
          onAttemptConstructTransaction,
          onAddOutput,
          onValidateAmount,
          willEnter,
          willLeave,
          getStyles,
          getDefaultStyles,
          showPassphraseModal,
          resetShowPassphraseModal,
        }}
      />
    );
  }

  getBaseOutput() {
    return { destination: "", amount: null, value: null, error: { address: null, amount: null } };
  }

  getDefaultStyles() {
    return this.state.outputs.map(output => ({ ...output, style: { height: 0, opacity: 1 } }));
  }

  getStyles() {
    const { outputs, isSendAll, sendAllAmount, isSendSelf } = this.state;
    const { totalSpent } = this.props;
    const {
      onValidateAddress, onValidateAmount, onRemoveOutput, onShowSendAll, onHideSendAll,
    } = this;
    return outputs.map((output, index) => ({
      data: <OutputRow
        {...{ ...this.props, index, outputs, ...output.data, isSendAll, isSendSelf, totalSpent, sendAllAmount,
          onValidateAddress, onValidateAmount, onShowSendAll, onHideSendAll, onRemoveOutput }}
        onAddOutput={this.onAddOutput}
        onKeyDown={this.onKeyDown}
      />,
      key: "output_" + index,
      style: {
        opacity: spring(1, presets.gentle),
      }
    }));
  }

  willEnter() {
    return {
      opacity: 0,
    };
  }

  willLeave() {
    return {
      opacity: spring(0, { stiffness: 210, damping: 20 }),
    };
  }

  onChangeAccount(account) {
    this.setState({ account }, this.onAttemptConstructTransaction);
  }

  onClearTransaction() {
    this.props.onClearTransaction();
  }
  onShowSendAll() {
    const { account, outputs } = this.state;
    const newOutputs = [ { ...outputs[0], data:{ ...outputs[0].data, amount: account.spendable } } ];
    this.setState({ isSendAll: true, outputs: newOutputs }, this.onAttemptConstructTransaction);
  }
  onHideSendAll() {
    const { outputs } = this.state;
    const newOutputs = [ { ...outputs[0], data:{ ...outputs[0].data, amount: null } } ];
    this.setState({ isSendAll: false, outputs: newOutputs }, this.onAttemptConstructTransaction);
  }
  onShowConfirm() {
    if (!this.getIsValid()) return;
    this.setState({ isShowingConfirm: true });
  }
  onShowSendSelf() {
    const { outputs } = this.state;
    let newOutputs = [ { ...outputs[0], data: this.getBaseOutput() } ];
    this.setState({ isSendSelf: true, outputs: newOutputs }, this.onAttemptConstructTransaction);
  }
  onShowSendOthers() {
    const { outputs } = this.state;
    let newOutputs = [ { ...outputs[0], data: this.getBaseOutput() } ];
    this.setState({ isSendSelf: false, outputs: newOutputs }, this.onAttemptConstructTransaction);
  }

  onAttemptConstructTransaction() {
    const { onAttemptConstructTransaction } = this.props;
    const { isSendAll, outputs, account } = this.state;
    const confirmations = 0;

    this.setState({ sendAllAmount: account.spendable });

    if (this.getIsInvalid()) return;

    if (!isSendAll) {
      onAttemptConstructTransaction && onAttemptConstructTransaction(
        account.value,
        confirmations,
        outputs.map(({ data }) =>
          ({ amount: data.amount, destination: data.destination })
        )
      );
    } else {
      onAttemptConstructTransaction && onAttemptConstructTransaction(
        account.value,
        confirmations,
        outputs,
        true
      );
    }
  }

  onAddOutput() {
    const { outputs, isSendSelf } = this.state;
    if (isSendSelf) return;
    outputs.push({ key: "output_"+outputs.length, data: this.getBaseOutput() });
    this.setState({ outputs });
  }

  onRemoveOutput(index) {
    const { outputs } = this.state;
    outputs.splice(index, 1);
    this.setState({ outputs }, this.onAttemptConstructTransaction);
  }

  onKeyDown(e) {
    if (e.keyCode === 13 && this.getIsValid()) {
      this.setState({ showPassphraseModal: true });
    }
  }

  getShowPassphraseModal() {
    return this.state.showPassphraseModal;
  }

  resetShowPassphraseModal() {
    this.setState({ showPassphraseModal: false });
  }

  onValidateAmount(data) {
    // value represents the value to be showed on the component and amount
    // represents its value in atoms so we can calculate transaction data.
    const { value, atomValue, index } = data;
    let error;
    if (!value || isNaN(value)) {
      error = <T id="send.errors.invalidAmount" m="Please enter a valid amount" />;
    }
    if (value <= 0) {
      error = <T id="send.errors.negativeAmount" m="Please enter a valid amount (> 0)" />;
    }
    const ref = this.state.outputs[index];
    ref.data.value = value;
    ref.data.amount = atomValue;

    ref.data.error.amount = error;

    this.setState({ [ref]: ref }, this.onAttemptConstructTransaction());
  }

  async onValidateAddress(data) {
    const { address, index } = data;
    let error;
    const ref = this.state.outputs[index];
    ref.data.destination = address;
    if (!address) {
      error = <T id="send.errors.invalidAddress" m="Please enter a valid address" />;
    }
    try {
      const validated = await this.props.validateAddress(address);
      if(!validated.getIsValid()) {
        error = <T id="send.errors.invalidAddress" m="Please enter a valid address" />;
      }
      ref.data.error.address = error;

      this.setState({ [ref]: ref }, this.onAttemptConstructTransaction());
    } catch (err) {
      this.setState({ [ref]: ref });
      return err;
    }
  }

  getIsInvalid() {
    let hasError = false;
    this.state.outputs.forEach( o => {
      if (!o.data.amount || o.data.destination.length === 0 ||
          o.data.error.amount || o.data.error.address) {
        hasError = true;
        return;
      }
    });

    return hasError;
  }

  getIsValid() {
    return !!(
      !this.getIsInvalid() &&
      this.props.unsignedTransaction &&
      !this.props.isConstructingTransaction
    );
  }
}

export default service(send(Send));
