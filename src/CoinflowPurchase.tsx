import React, {useMemo} from 'react';
import {CoinflowWebView} from './CoinflowWebView';
import {
  CoinflowEthPurchaseProps,
  CoinflowNearPurchaseProps,
  CoinflowPolygonPurchaseProps,
  CoinflowPurchaseProps,
  CoinflowSolanaPurchaseProps,
  WithStyles,
} from './CoinflowTypes';
import {useWebViewWallet} from './wallet/useWebViewWallet';
import {useSolanaIFrameMessageHandlers} from './wallet/SolanaIFrameMessageHandlers';
import base58 from 'bs58';
import {useEthIFrameMessageHandlers} from './wallet/EthIFrameMessageHandlers';
import {useNearIFrameMessageHandlers} from './wallet/NearIFrameMessageHandlers';

export function CoinflowPurchase(props: CoinflowPurchaseProps & WithStyles) {
  switch (props.blockchain) {
    case 'solana':
      return <SolanaPurchase {...props} />;
    case 'polygon':
      return <EvmPurchase {...props} />;
    case 'eth':
      return <EvmPurchase {...props} />;
    case 'near':
      return <NearPurchase {...props} />;
    default:
      return null;
  }
}

function SolanaPurchase(props: CoinflowSolanaPurchaseProps & WithStyles) {
  const handlers = useSolanaIFrameMessageHandlers(props);
  const {WebViewRef, handleIframeMessages} = useWebViewWallet(handlers, props);

  const transaction = useMemo(() => {
    if (!props.transaction) return undefined;
    return base58.encode(
      props.transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
    );
  }, []);

  return (
    <CoinflowWebView
      publicKey={props.wallet.publicKey?.toString()}
      WebViewRef={WebViewRef}
      route={`/purchase/${props.merchantId}`}
      {...props}
      transaction={transaction}
      handleIframeMessages={handleIframeMessages}
    />
  );
}

function EvmPurchase(
  props: (CoinflowPolygonPurchaseProps | CoinflowEthPurchaseProps) & WithStyles
) {
  const handlers = useEthIFrameMessageHandlers(props);
  const {WebViewRef, handleIframeMessages} = useWebViewWallet(handlers, props);

  const transaction = useMemo(() => {
    if (!props.transaction) return undefined;
    return Buffer.from(JSON.stringify(props.transaction)).toString('base64');
  }, [props.transaction]);

  return (
    <CoinflowWebView
      publicKey={props.wallet.address}
      WebViewRef={WebViewRef}
      route={`/purchase/${props.merchantId}`}
      {...props}
      transaction={transaction}
      handleIframeMessages={handleIframeMessages}
    />
  );
}

function NearPurchase(props: CoinflowNearPurchaseProps & WithStyles) {
  const handlers = useNearIFrameMessageHandlers(props);
  const {WebViewRef, handleIframeMessages} = useWebViewWallet(handlers, props);

  const transaction = useMemo(
    () =>
      props.action
        ? Buffer.from(JSON.stringify(props.action)).toString('base64')
        : undefined,
    [props.action]
  );

  return (
    <CoinflowWebView
      publicKey={props.wallet.accountId}
      WebViewRef={WebViewRef}
      route={`/purchase/${props.merchantId}`}
      {...props}
      transaction={transaction}
      handleIframeMessages={handleIframeMessages}
    />
  );
}
