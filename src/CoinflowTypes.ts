import type {Connection} from '@solana/web3.js';
import {PublicKey, Signer, Transaction} from '@solana/web3.js';
import {WalletContextState} from '@solana/wallet-adapter-react';
import {Wallet} from '@near-wallet-selector/core';
import React from 'react';
import WebView from 'react-native-webview';
import {StyleProp, ViewStyle} from 'react-native';

/** Coinflow Types **/
export type CoinflowBlockchain = 'solana' | 'near' | 'eth' | 'polygon';
export type CoinflowEnvs = 'prod' | 'staging' | 'sandbox' | 'local';

export interface CoinflowTypes {
  merchantId: string;
  env?: CoinflowEnvs;
  loaderBackground?: string;
  blockchain: CoinflowBlockchain;
  onLoad?: () => void;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type OnSuccessMethod = (params: string) => void | Promise<void>;

export type CoinflowWebViewProps = Omit<CoinflowIFrameProps, 'IFrameRef'> & {
  publicKey: string | null | undefined;
  handleIframeMessages: ({data}: {data: string}) => Promise<void>;
  WebViewRef: React.RefObject<WebView>;
  onLoad?: () => void;
  bankAccountLinkRedirect?: string;
};

export type WithStyles = {style?: StyleProp<ViewStyle>};

/** Wallets **/
export type SolanaWallet = PartialBy<
  Pick<
    WalletContextState,
    'wallet' | 'signTransaction' | 'publicKey' | 'sendTransaction'
  >,
  'wallet' | 'signTransaction'
>;
export type NearWallet = {accountId: string} & Pick<
  Wallet,
  'signAndSendTransaction'
>;

type AccessList = Array<{address: string; storageKeys: Array<string>}>;
type AccessListish =
  | AccessList
  | Array<[string, Array<string>]>
  | Record<string, Array<string>>;

export type EthWallet = {
  address: string | null | undefined;
  sendTransaction: (transaction: {
    to: string;
    from?: string;
    nonce?: Bytes | bigint | string | number;

    gasLimit?: Bytes | bigint | string | number;
    gasPrice?: Bytes | bigint | string | number;

    data?: BytesLike;
    value?: Bytes | bigint | string | number;
    chainId?: number;

    type?: number;
    accessList?: AccessListish;

    maxPriorityFeePerGas?: Bytes | bigint | string | number;
    maxFeePerGas?: Bytes | bigint | string | number;

    customData?: Record<string, any>;
    ccipReadEnabled?: boolean;
  }) => Promise<{hash: string}>;
  signMessage: (message: string) => Promise<string>;
};

/** History **/
export interface CoinflowSolanaHistoryProps extends CoinflowTypes {
  wallet: Omit<SolanaWallet, 'signTransaction'>;
  connection: Connection;
  blockchain: 'solana';
}

export interface CoinflowNearHistoryProps extends CoinflowTypes {
  wallet: Omit<NearWallet, 'signAndSendTransaction'>;
  blockchain: 'near';
}

export interface CoinflowEthHistoryProps extends CoinflowTypes {
  wallet: Omit<EthWallet, 'sendTransaction' | 'signMessage'>;
  blockchain: 'eth';
}

export interface CoinflowPolygonHistoryProps extends CoinflowTypes {
  wallet: Omit<EthWallet, 'sendTransaction' | 'signMessage'>;
  blockchain: 'polygon';
}

export type CoinflowHistoryProps =
  | CoinflowSolanaHistoryProps
  | CoinflowNearHistoryProps
  | CoinflowPolygonHistoryProps;

export interface CoinflowIFrameProps {
  WebViewRef: React.RefObject<any | null>;
  route: string;
  amount?: number;
  transaction?: string;
  blockchain: CoinflowBlockchain;
  webhookInfo?: object;
  token?: string | PublicKey;
  email?: string;
  env?: CoinflowEnvs;
  loaderBackground?: string;
  supportsVersionedTransactions?: boolean;
  additionalWallets?: {
    wallet: string;
    blockchain: 'solana' | 'eth' | 'near' | 'polygon';
  }[];
}

/** Transactions **/

export type NearFtTransferCallAction = {
  methodName: 'ft_transfer_call';
  args: object;
  gas: string;
  deposit: string;
};

type BigNumberish = object | bigint | string | number;
type Bytes = ArrayLike<number>;
type BytesLike = Bytes | string;

export type EvmTransaction = {
  to: string;
  from?: string;
  nonce?: BigNumberish;

  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;

  data?: BytesLike;
  value?: BigNumberish;
  chainId?: number;

  type?: number;

  maxPriorityFeePerGas?: BigNumberish;
  maxFeePerGas?: BigNumberish;

  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
};

/** Purchase **/

export interface CoinflowCommonPurchaseProps extends CoinflowTypes {
  amount?: number;
  onSuccess?: OnSuccessMethod;
  webhookInfo?: object;
  email?: string;
}

export interface CoinflowSolanaPurchaseProps
  extends CoinflowCommonPurchaseProps {
  wallet: SolanaWallet;
  transaction?: Transaction;
  partialSigners?: Signer[];
  debugTx?: boolean;
  connection: Connection;
  blockchain: 'solana';
  token?: PublicKey | string;
  supportsVersionedTransactions?: boolean;
}

export interface CoinflowNearPurchaseProps extends CoinflowCommonPurchaseProps {
  wallet: NearWallet;
  blockchain: 'near';
  action?: NearFtTransferCallAction;
}

export interface CoinflowPolygonPurchaseProps
  extends CoinflowCommonPurchaseProps {
  transaction?: EvmTransaction;
  wallet: EthWallet;
  blockchain: 'polygon';
}

export type CoinflowPurchaseProps =
  | CoinflowSolanaPurchaseProps
  | CoinflowNearPurchaseProps
  | CoinflowPolygonPurchaseProps;

/** Withdraw **/

export interface CoinflowCommonWithdrawProps extends CoinflowTypes {
  onSuccess?: OnSuccessMethod;
  token?: string;
  amount?: number;
  email?: string;
  bankAccountLinkRedirect?: string;
  additionalWallets?: {
    wallet: string;
    blockchain: 'solana' | 'eth' | 'near' | 'polygon';
  }[];
}

export interface CoinflowSolanaWithdrawProps
  extends CoinflowCommonWithdrawProps {
  wallet: SolanaWallet;
  connection: Connection;
  blockchain: 'solana';
}

export interface CoinflowNearWithdrawProps extends CoinflowCommonWithdrawProps {
  wallet: NearWallet;
  blockchain: 'near';
}

export interface CoinflowEthWithdrawProps extends CoinflowCommonWithdrawProps {
  wallet: Omit<EthWallet, 'signMessage'>;
  blockchain: 'eth';
}

export interface CoinflowPolygonWithdrawProps
  extends CoinflowCommonWithdrawProps {
  wallet: Omit<EthWallet, 'signMessage'>;
  blockchain: 'polygon';
}

export type CoinflowWithdrawProps =
  | CoinflowSolanaWithdrawProps
  | CoinflowNearWithdrawProps
  | CoinflowEthWithdrawProps
  | CoinflowPolygonWithdrawProps;
