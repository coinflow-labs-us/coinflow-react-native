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

function useCoinflowPurchase(
  purchaseProps: CoinflowPurchaseProps & WithStyles & WithOnLoad,
  version: string
) {
  const webviewProps = useMemo<CoinflowWebViewProps>(() => {
    const walletPubkey = getWalletPubkey(purchaseProps);
    return {
      ...purchaseProps,
      walletPubkey,
      route: `/purchase${version}/${purchaseProps.merchantId}`,
      transaction: CoinflowUtils.getTransaction(purchaseProps),
      onLoad: purchaseProps.onLoad,
    };
  }, [purchaseProps, version]);

  const messageHandlers = useMemo<IFrameMessageHandlers>(() => {
    return {
      ...getHandlers(purchaseProps),
      handleHeightChange: purchaseProps.handleHeightChange,
    };
  }, [purchaseProps]);

  return {webviewProps, messageHandlers};
}

export function CoinflowPurchase(
  purchaseProps: CoinflowPurchaseProps & WithStyles & WithOnLoad
) {
  const {webviewProps, messageHandlers} = useCoinflowPurchase(
    purchaseProps,
    '-v2'
  );
  return <CoinflowWebView {...webviewProps} {...messageHandlers} />;
}
