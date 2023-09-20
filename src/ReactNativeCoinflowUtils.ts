import {CoinflowBlockchain, CoinflowEnvs} from './CoinflowTypes';
import {PublicKey} from '@solana/web3.js';

export class ReactNativeCoinflowUtils {
  env: CoinflowEnvs;
  url: string;

  constructor(env?: CoinflowEnvs) {
    this.env = env ?? 'prod';
    if (this.env === 'prod') this.url = 'https://api.coinflow.cash';
    else if (this.env === 'local') this.url = 'http://localhost:5000';
    else this.url = `https://api-${this.env}.coinflow.cash`;
  }

  static getCoinflowBaseUrl(env?: CoinflowEnvs): string {
    if (!env || env === 'prod') return 'https://coinflow.cash';
    if (env === 'local') return 'http://localhost:3000';

    return `https://${env}.coinflow.cash`;
  }

  static getCoinflowUrl({
    blockchain,
    route,
    env,
    amount,
    publicKey,
    transaction,
    bankAccountLinkRedirect,
    additionalWallets,
    token,
    webhookInfo,
  }: {
    blockchain: CoinflowBlockchain;
    token?: string | PublicKey;
    route: string;
    publicKey: string | null | undefined;
    env?: CoinflowEnvs;
    amount?: number;
    transaction?: string;
    bankAccountLinkRedirect?: string;
    additionalWallets?: {
      wallet: string;
      blockchain: 'solana' | 'eth' | 'near' | 'polygon';
    }[];
    webhookInfo?: object;
  }): string {
    if (!publicKey) return '';

    const url = new URL(
      `/${blockchain}` + route,
      ReactNativeCoinflowUtils.getCoinflowBaseUrl(env)
    );
    url.searchParams.append('pubkey', publicKey);

    if (transaction) {
      url.searchParams.append('transaction', transaction);
    }
    if (amount) {
      url.searchParams.append('amount', amount.toString());
    }
    if (bankAccountLinkRedirect) {
      url.searchParams.append(
        'bankAccountLinkRedirect',
        bankAccountLinkRedirect
      );
    }
    if (additionalWallets)
      url.searchParams.append(
        'additionalWallets',
        JSON.stringify(additionalWallets)
      );

    if (token) url.searchParams.append('token', token.toString());

    if (webhookInfo)
      url.searchParams.append(
        'webhookInfo',
        Buffer.from(JSON.stringify(webhookInfo)).toString('base64')
      );

    return url.toString();
  }
}
