import React from 'react';
import {
  CoinflowWebView,
  CoinflowWebViewProps,
  WithStyles,
} from './CoinflowWebView';
import {Signer, Transaction} from '@solana/web3.js';
import {CoinflowEnvs} from './ReactNativeCoinflowUtils';

type CoinflowPurchaseProps = {
  wallet: any;
  merchantId: string;
  amount?: number;
  env?: CoinflowEnvs;
  transaction?: Transaction;
  partialSigners?: Signer[];
  debugTx?: boolean;
  onLoad?: () => void;
} & CoinflowWebViewProps;

export function CoinflowPurchase({
  wallet,
  merchantId,
  env,
  transaction,
  amount,
  style,
  WebViewRef,
  handleIframeMessages,
  onLoad,
}: CoinflowPurchaseProps & WithStyles) {
  if (!wallet.publicKey || !wallet.connected) return null;

  return (
    <CoinflowWebView
      publicKey={wallet.publicKey.toString()}
      WebViewRef={WebViewRef}
      route={`/purchase/${merchantId}`}
      env={env}
      transaction={transaction}
      amount={amount}
      handleIframeMessages={handleIframeMessages}
      style={style}
      onLoad={onLoad}
    />
  );
}
