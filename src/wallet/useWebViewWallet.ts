import React, {useCallback} from 'react';
import {IFrameMessageHandlers, WalletCall} from './SolanaIFrameMessageHandlers';
import {OnSuccessMethod} from '../CoinflowTypes';

export function useWebViewWallet(
  {
    handleSignTransaction,
    handleSendTransaction,
    handleSignMessage,
  }: IFrameMessageHandlers,
  {
    onSuccess,
  }: {
    onSuccess?: OnSuccessMethod;
  }
) {
  const WebViewRef = React.useRef<any | null>(null);

  const sendIFrameMessage = useCallback(
    (message: string) => {
      if (!WebViewRef?.current) throw new Error('WebViewRef not defined');
      WebViewRef.current.postMessage(message);
    },
    [WebViewRef]
  );

  const handleIframeMessages = useCallback(
    async ({data}: {data: string}) => {
      try {
        const parsedData = parseJSON(data);
        if (!parsedData) return;

        switch (parsedData.method) {
          case 'sendTransaction': {
            const signature = await handleSendTransaction(parsedData);
            sendIFrameMessage(signature);
            break;
          }
          case 'success': {
            if (onSuccess) onSuccess(data);
            break;
          }
          case 'signTransaction': {
            if (!handleSignTransaction)
              throw new Error(
                `This wallet does not support method ${parsedData.method}`
              );

            const signedTransaction = await handleSignTransaction(parsedData);
            sendIFrameMessage(signedTransaction);
            break;
          }
          case 'signMessage': {
            if (!handleSignMessage)
              throw new Error(
                `This wallet does not support method ${parsedData.method}`
              );

            const signedMessage = await handleSignMessage(parsedData);
            sendIFrameMessage(signedMessage);
            break;
          }
          default: {
            console.error(`Unsupported Wallet Method ${parsedData.method}`);
            break;
          }
        }
      } catch (e) {
        console.error('handleIframeMessages', e);
        try {
          const message = e instanceof Error ? e.message : JSON.stringify(e);
          sendIFrameMessage('ERROR ' + message);
        } catch (e) {
          sendIFrameMessage('ERROR parsing error JSON');
        }
      }
    },
    [
      handleSendTransaction,
      sendIFrameMessage,
      onSuccess,
      handleSignTransaction,
      handleSignMessage,
    ]
  );

  return {WebViewRef, handleIframeMessages};
}

function parseJSON(data: string): WalletCall | null {
  try {
    const res = JSON.parse(data);
    if (!res.method) return null;
    if (!res.data) return null;
    return res;
  } catch (e) {
    return null;
  }
}
