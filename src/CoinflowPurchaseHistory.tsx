import React from 'react';
import {CoinflowWebView, WithStyles} from './CoinflowWebView';
import {CoinflowHistoryProps} from './CoinflowWithdrawHistory';

export function CoinflowPurchaseHistory({
  wallet,
  merchantId,
  env,
  style,
  WebViewRef,
  handleIframeMessages,
}: CoinflowHistoryProps & WithStyles) {
  if (!wallet.publicKey || !wallet.connected) return null;

  return (
    <CoinflowWebView
      publicKey={wallet.publicKey.toString()}
      WebViewRef={WebViewRef}
      handleIframeMessages={handleIframeMessages}
      style={style}
      route={`/history/purchase/${merchantId}`}
      env={env}
    />
  );
}
