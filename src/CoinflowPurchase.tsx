import React, {useMemo} from 'react';
import {
  CoinflowWebView,
  CoinflowWebViewProps,
  useRandomHandleHeightChangeId,
  WithOnLoad,
  WithStyles,
} from './CoinflowWebView';
import {
  CoinflowPurchaseProps,
  CoinflowUtils,
  getHandlers,
  getWalletPubkey,
  IFrameMessageHandlers,
  WithGeo,
} from './common';

function useCoinflowPurchase(
  purchaseProps: CoinflowPurchaseProps & WithStyles & WithOnLoad & WithGeo,
  version: string
) {
  const handleHeightChangeId = useRandomHandleHeightChangeId();
  const webviewProps = useMemo<CoinflowWebViewProps>(() => {
    const walletPubkey = getWalletPubkey(purchaseProps);
    return {
      ...purchaseProps,
      walletPubkey,
      route: `/purchase${version}/${purchaseProps.merchantId}`,
      transaction: CoinflowUtils.getTransaction(purchaseProps),
      onLoad: purchaseProps.onLoad,
      handleHeightChangeId,
    };
  }, [handleHeightChangeId, purchaseProps, version]);

  const messageHandlers = useMemo<IFrameMessageHandlers>(() => {
    return {
      ...getHandlers(purchaseProps),
      handleHeightChange: purchaseProps.handleHeightChange,
    };
  }, [purchaseProps]);

  return {webviewProps, messageHandlers};
}

export function CoinflowPurchase(
  purchaseProps: CoinflowPurchaseProps & WithStyles & WithOnLoad & WithGeo
) {
  const {webviewProps, messageHandlers} = useCoinflowPurchase(
    purchaseProps,
    '-v2'
  );
  return (
    <CoinflowWebView
      {...webviewProps}
      {...messageHandlers}
      waitForWebviewLoadedMessage
    />
  );
}
