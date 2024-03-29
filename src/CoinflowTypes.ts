import type {Connection} from '@solana/web3.js';
import {PublicKey, Signer, Transaction} from '@solana/web3.js';
import {WalletContextState} from '@solana/wallet-adapter-react';
import {Wallet} from '@near-wallet-selector/core';
import React from 'react';
import WebView from 'react-native-webview';
import {StyleProp, ViewStyle} from 'react-native';

enum SettlementType {
  Credits = 'Credits',
  USDC = 'USDC',
  Bank = 'Bank',
}

enum MerchantStyle {
  Rounded = 'rounded',
  Sharp = 'sharp',
  Pill = 'pill',
}

type MerchantTheme = {
  primary?: string;
  background?: string;
  backgroundAccent?: string;
  backgroundAccent2?: string;
  textColor?: string;
  textColorAccent?: string;
  textColorAction?: string;
  font?: string;
  style?: MerchantStyle;
};

interface CustomerInfo {
  name?: string;
  verificationId?: string;
  displayName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  ip?: string;
  lat?: string;
  lng?: string;
}

/** Coinflow Types **/
export type CoinflowBlockchain = 'solana' | 'near' | 'eth' | 'polygon' | 'base';
export type CoinflowEnvs = 'prod' | 'staging' | 'sandbox' | 'local';

export type ChargebackProtectionData = ChargebackProtectionItem[];

export interface ChargebackProtectionItem {
  /**
   * The name of the product
   */
  productName: string;
  /**
   * The product type. Possible values include: inGameProduct, gameOfSkill, dataStorage, computingResources, sportsTicket, eSportsTicket, musicTicket, conferenceTicket, virtualSportsTicket, virtualESportsTicket, virtualMusicTicket, virtualConferenceTicket, alcohol, DLC, subscription, fundACause, realEstate, computingContract, digitalArt, topUp
   */
  productType:
    | 'inGameProduct'
    | 'gameOfSkill'
    | 'dataStorage'
    | 'computingResources'
    | 'sportsTicket'
    | 'eSportsTicket'
    | 'musicTicket'
    | 'conferenceTicket'
    | 'virtualSportsTicket'
    | 'virtualESportsTicket'
    | 'virtualMusicTicket'
    | 'virtualConferenceTicket'
    | 'alcohol'
    | 'DLC'
    | 'subscription'
    | 'fundACause'
    | 'realEstate'
    | 'computingContract'
    | 'digitalArt'
    | 'topUp'
    | 'ownershipContract';
  /**
   * The item's list price
   */
  /**
   * The number of units sold
   */
  quantity: number;
  /**
   * Any additional data that the store can provide on the product, e.g. description, link to image, etc.
   */
  rawProductData?: {[key: string]: any};
}

export interface CoinflowTypes {
  merchantId: string;
  env?: CoinflowEnvs;
  loaderBackground?: string;
  blockchain: CoinflowBlockchain;
  onLoad?: () => void;
  theme?: MerchantTheme;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type OnSuccessMethod = (params: string) => void | Promise<void>;

export type CoinflowWebViewProps = Omit<CoinflowIFrameProps, 'IFrameRef'> & {
  publicKey: string | null | undefined;
  handleIframeMessages: ({data}: {data: string}) => Promise<void>;
  WebViewRef: React.RefObject<WebView>;
  onLoad?: () => void;
  token?: string | PublicKey;
  tokens?: string[];
  bankAccountLinkRedirect?: string;
  lockDefaultToken?: boolean;
  supportsVersionedTransactions?: boolean;
  lockAmount?: boolean;
  theme?: MerchantTheme;
  usePermit?: boolean;
} & Pick<CoinflowCommonPurchaseProps, 'authOnly'>;

export type WithStyles = {style?: StyleProp<ViewStyle>};

/** Wallets **/
export type SolanaWallet = PartialBy<
  Pick<
    WalletContextState,
    | 'wallet'
    | 'signTransaction'
    | 'publicKey'
    | 'sendTransaction'
    | 'signMessage'
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

export interface CoinflowEvmHistoryProps extends CoinflowTypes {
  wallet: EthWallet;
}

export interface CoinflowEthHistoryProps extends CoinflowEvmHistoryProps {
  blockchain: 'eth';
}

export interface CoinflowPolygonHistoryProps extends CoinflowEvmHistoryProps {
  blockchain: 'polygon';
}

export interface CoinflowBaseHistoryProps extends CoinflowEvmHistoryProps {
  blockchain: 'base';
}

export type CoinflowHistoryProps =
  | CoinflowSolanaHistoryProps
  | CoinflowNearHistoryProps
  | CoinflowPolygonHistoryProps
  | CoinflowEthHistoryProps
  | CoinflowBaseHistoryProps;

export interface CoinflowIFrameProps
  extends Omit<CoinflowTypes, 'merchantId'>,
    Pick<
      CoinflowCommonPurchaseProps,
      | 'chargebackProtectionData'
      | 'webhookInfo'
      | 'amount'
      | 'customerInfo'
      | 'settlementType'
    >,
    Pick<
      CoinflowCommonWithdrawProps,
      | 'bankAccountLinkRedirect'
      | 'additionalWallets'
      | 'transactionSigner'
      | 'lockAmount'
    > {
  WebViewRef: React.RefObject<any | null>;
  route: string;
  amount?: number;
  transaction?: string;
  blockchain: CoinflowBlockchain;
  email?: string;
  env?: CoinflowEnvs;
  deviceId?: string;
  loaderBackground?: string;
  supportsVersionedTransactions?: boolean;
  rent?: {lamports: string | number};
  nativeSolToConvert?: {lamports: string | number};
  disableApplePay?: boolean;
  disableGooglePay?: boolean;
  planCode?: string;
  settlementType?: SettlementType;
  usePermit?: boolean;
}

/** Transactions **/

export type NearFtTransferCallAction = {
  methodName: 'ft_transfer_call';
  args: object;
  gas: string;
  deposit: string;
};

type Bytes = ArrayLike<number>;
type BytesLike = Bytes | string;

/** Purchase **/

export interface CoinflowCommonPurchaseProps extends CoinflowTypes {
  amount?: number;
  onSuccess?: OnSuccessMethod;
  webhookInfo?: object;
  customerInfo?: CustomerInfo;
  email?: string;
  deviceId?: string;
  chargebackProtectionData?: ChargebackProtectionData;
  disableApplePay?: boolean;
  disableGooglePay?: boolean;
  settlementType?: SettlementType;
  authOnly?: boolean;
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
  rent?: {lamports: string | number};
  nativeSolToConvert?: {lamports: string | number};
}

export interface CoinflowNearPurchaseProps extends CoinflowCommonPurchaseProps {
  wallet: NearWallet;
  blockchain: 'near';
  action?: NearFtTransferCallAction;
}

interface CoinflowEvmPurchaseProps extends CoinflowCommonPurchaseProps {
  transaction?: EvmTransactionData;
  token?: string;
  wallet: EthWallet;
}

export interface CoinflowPolygonPurchaseProps extends CoinflowEvmPurchaseProps {
  blockchain: 'polygon';
}

export interface CoinflowEthPurchaseProps extends CoinflowEvmPurchaseProps {
  blockchain: 'eth';
}

export interface CoinflowBasePurchaseProps extends CoinflowEvmPurchaseProps {
  blockchain: 'base';
}

export type CoinflowPurchaseProps =
  | CoinflowSolanaPurchaseProps
  | CoinflowNearPurchaseProps
  | CoinflowPolygonPurchaseProps
  | CoinflowEthPurchaseProps
  | CoinflowBasePurchaseProps;

/** Withdraw **/

export interface CoinflowCommonWithdrawProps extends CoinflowTypes {
  onSuccess?: OnSuccessMethod;
  tokens?: string[];
  lockDefaultToken?: boolean;
  amount?: number;
  email?: string;
  bankAccountLinkRedirect?: string;
  additionalWallets?: {
    wallet: string;
    blockchain: 'solana' | 'eth' | 'near' | 'polygon';
  }[];
  supportsVersionedTransactions?: boolean;
  lockAmount?: boolean;
  transactionSigner?: string;
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

export interface CoinflowEvmWithdrawProps extends CoinflowCommonWithdrawProps {
  wallet: EthWallet;
  usePermit?: boolean;
}

export interface CoinflowEthWithdrawProps extends CoinflowEvmWithdrawProps {
  blockchain: 'eth';
}

export interface CoinflowPolygonWithdrawProps extends CoinflowEvmWithdrawProps {
  blockchain: 'polygon';
}

export interface CoinflowBaseWithdrawProps extends CoinflowEvmWithdrawProps {
  blockchain: 'base';
}

export type CoinflowWithdrawProps =
  | CoinflowSolanaWithdrawProps
  | CoinflowNearWithdrawProps
  | CoinflowEthWithdrawProps
  | CoinflowPolygonWithdrawProps
  | CoinflowBaseWithdrawProps;

export interface CommonEvmRedeem {
  waitForHash?: boolean;
}

export interface NormalRedeem extends CommonEvmRedeem {
  transaction: {to: string; data: string};
}

export interface KnownTokenIdRedeem extends NormalRedeem {
  nftContract: string;
  nftId: string;
}

export interface SafeMintRedeem extends NormalRedeem {
  type: 'safeMint';
  nftContract?: string;
}

export interface ReturnedTokenIdRedeem extends NormalRedeem {
  type: 'returned';
  nftContract?: string;
}

type ReservoirNftIdItem = Omit<KnownTokenIdRedeem, keyof NormalRedeem>;

interface ReservoirOrderIdItem {
  orderId: string;
}

type ReservoirItem = ReservoirNftIdItem | ReservoirOrderIdItem;
type ReservoirItems = ReservoirItem | ReservoirItem[];

export interface ReservoirRedeem extends CommonEvmRedeem {
  type: 'reservoir';
  items: ReservoirItems;
}

export type EvmTransactionData =
  | SafeMintRedeem
  | ReturnedTokenIdRedeem
  | ReservoirRedeem
  | KnownTokenIdRedeem
  | NormalRedeem;
