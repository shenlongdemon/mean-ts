import {UserInfo} from "./userinfo";

enum TransactionAction {
  CREATE = 0,
  SELL = 1,
  BUY = 2,
}

interface Transaction extends UserInfo {
  action: TransactionAction;
}

export {Transaction, TransactionAction};