enum ITEM_ACTION {
  NONE = 0,
  SELL = 1,
  BUY = 2,
  PUBLISH = 3,
  /**
   * cancel sell - un-publish
   */
  CANCEL = 4,
  RECEIVE = 5
}

export  {ITEM_ACTION}