import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as sel from "selectors";
import * as da from "actions/DEXActions";

export function useDEXPage() {
  const dispatch = useDispatch();
  const onGetUser = () => dispatch(da.getUser());
  const onGetFee = (addr, cert) => dispatch(da.getFee(addr, cert));
  const isDEXEnabled = useSelector(sel.getDEXEnabled);
  return {
    onGetUser,
    onGetFee
  };
}
