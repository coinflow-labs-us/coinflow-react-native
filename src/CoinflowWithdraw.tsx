import {CoinflowWebView} from './CoinflowWebView';
import React from 'react';
import {
  CoinflowNearWithdrawProps,
  CoinflowPolygonWithdrawProps,
  CoinflowSolanaWithdrawProps,
  CoinflowWithdrawProps,
  WithStyles,
} from './CoinflowTypes';
import {useSolanaIFrameMessageHandlers} from './wallet/SolanaIFrameMessageHandlers';
import {useWebViewWallet} from './wallet/useWebViewWallet';
import {useEthIFrameMessageHandlers} from './wallet/EthIFrameMessageHandlers';
import {useNearIFrameMessageHandlers} from './wallet/NearIFrameMessageHandlers';

export function CoinflowWithdraw(props: CoinflowWithdrawProps & WithStyles) {
  switch (props.blockchain) {
    case 'solana':
      return <SolanaPurchase {...props} />;
    case 'polygon':
      return <PolygonPurchase {...props} />;
    case 'near':
      return <NearPurchase {...props} />;
    default:
      return null;
  }
}

function SolanaPurchase(props: CoinflowSolanaWithdrawProps & WithStyles) {
  const handlers = useSolanaIFrameMessageHandlers(props);
  const {WebViewRef, handleIframeMessages} = useWebViewWallet(handlers, props);

  return (
    <CoinflowWebView
      publicKey={props.wallet.publicKey?.toString()}
      WebViewRef={WebViewRef}
      route={`/withdraw/${props.merchantId}`}
      {...props}
      handleIframeMessages={handleIframeMessages}
    />
  );
}

function PolygonPurchase(props: CoinflowPolygonWithdrawProps & WithStyles) {
  const handlers = useEthIFrameMessageHandlers(props);
  const {WebViewRef, handleIframeMessages} = useWebViewWallet(handlers, props);

  return (
    <CoinflowWebView
      publicKey={props.wallet.address}
      WebViewRef={WebViewRef}
      route={`/withdraw/${props.merchantId}`}
      {...props}
      handleIframeMessages={handleIframeMessages}
    />
  );
}

function NearPurchase(props: CoinflowNearWithdrawProps & WithStyles) {
  const handlers = useNearIFrameMessageHandlers(props);
  const {WebViewRef, handleIframeMessages} = useWebViewWallet(handlers, props);

  return (
    <CoinflowWebView
      publicKey={props.wallet.accountId}
      WebViewRef={WebViewRef}
      route={`/withdraw/${props.merchantId}`}
      {...props}
      handleIframeMessages={handleIframeMessages}
    />
  );
}
