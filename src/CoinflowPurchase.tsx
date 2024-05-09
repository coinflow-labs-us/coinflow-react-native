import React, {useMemo} from 'react';
import {
  CoinflowWebView,
  CoinflowWebViewProps,
  WithOnLoad,
  WithStyles,
} from './CoinflowWebView';
import {
  CoinflowPurchaseProps,
  getWalletPubkey,
  getHandlers,
  IFrameMessageHandlers,
  CoinflowUtils,
} from './common';

export function CoinflowPurchase(
  purchaseProps: CoinflowPurchaseProps & WithStyles & WithOnLoad
) {
  const webviewProps = useMemo<CoinflowWebViewProps>(() => {
    const walletPubkey = getWalletPubkey(purchaseProps);
    return {
      ...purchaseProps,
      walletPubkey,
      route: `/purchase/${purchaseProps.merchantId}`,
      transaction: CoinflowUtils.getTransaction(purchaseProps),
      onLoad: purchaseProps.onLoad,
    };
  }, [purchaseProps]);

  const messageHandlers = useMemo<IFrameMessageHandlers>(() => {
    return {
      ...getHandlers(purchaseProps),
      handleHeightChange: purchaseProps.handleHeightChange,
    };
  }, [purchaseProps]);

  return <CoinflowWebView {...webviewProps} {...messageHandlers} />;
}
