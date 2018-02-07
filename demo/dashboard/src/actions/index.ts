import { Contracts } from "@src/contracts";
import { Action, ActionTypes, GetSupportAction } from "@src/types";
import { Dispatch } from "redux";

export const increment = (value: number = 1) => ({
  type: ActionTypes.INCREMENT,
  value
});

export const decrement = (value: number = 1) => ({
  type: ActionTypes.DECREMENT,
  value
});

const logError = err => {
  console.error(err); // tslint:disable-line
};

export const incrementAsync = (value: number = 1, delay: number = 1000) => (
  dispatch: Dispatch<Action>
) => setTimeout(() => dispatch(increment(value)), delay);

export const reportBenign = () => (dispatch: Dispatch<Action>) =>
  dispatch({ type: ActionTypes.REPORT_BENIGN, address: "what" });

export const getInnerSetAddress = () => (dispatch: Dispatch<Action>) =>
  Contracts.OuterSet.get()
    .methods.innerSet()
    .call()
    .then((result: any) => {
      Contracts.InnerMajoritySet.address = result; // TODO: move into state?

      dispatch({
        address: result,
        type: ActionTypes.GET_INNER_SET_ADDRESS
      });
    });

export const getValidators = () => (dispatch: Dispatch<Action>) =>
  Contracts.OuterSet.get()
    .methods.getValidators()
    .call()
    .then((result: any) => {
      dispatch({
        addresses: result,
        type: ActionTypes.GET_VALIDATORS
      });
      return result;
    })
    .catch(logError);

export const getSupport = (validatorAddress: string) => (
  dispatch: Dispatch<GetSupportAction>
) =>
  Contracts.InnerMajoritySet.get()
    .methods.getSupport(validatorAddress)
    .call()
    .then((result: any) => {
      dispatch({
        address: validatorAddress,
        support: result,
        type: ActionTypes.GET_SUPPORT
      });
      return result;
    })
    .catch(logError);

export const addSupport = (validatorAddress: string) => (
  dispatch: Dispatch<Action>
) => {
  Contracts.InnerMajoritySet.get()
    .methods.addSupport(validatorAddress)
    .call()
    .catch(logError);
};

export const reportMalicious = (validatorAddress: string) => (
  dispatch: Dispatch<Action>
) => {
  window.w3.eth
    .getBlockNumber()
    .then(num =>
      Contracts.InnerMajoritySet.get()
        .methods.reportMalicious(
          validatorAddress,
          num,
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
        .call()
        .catch(logError)
    )
    .catch(logError);
};

// FIXME: Assuming first account
export const getAccount = () => (dispatch: Dispatch<Action>) => {
  window.w3.eth.getAccounts().then(accounts => {
    dispatch({
      account: accounts[0],
      type: ActionTypes.GET_ACCOUNT
    });
  });
};

export const updateBlock = b => ({
  hash: b.hash,
  number: b.number,
  timestamp: b.timestamp,
  type: ActionTypes.GET_BLOCK
});

export const getValidatorsWithSupport = () => (dispatch: Dispatch<Action>) =>
  getValidators()(dispatch).then(validatorAddresses =>
    Promise.all(validatorAddresses.map(va => getSupport(va)(dispatch)))
  );
