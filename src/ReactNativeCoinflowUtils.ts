import {Transaction} from '@solana/web3.js';
import base58 from 'bs58';

export type CoinflowEnvs = 'prod' | 'staging' | 'sandbox' | 'local';

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
    route,
    env,
    amount,
    publicKey,
    transaction,
  }: {
    route: string;
    publicKey: string;
    env?: CoinflowEnvs;
    amount?: number;
    transaction?: Transaction;
  }): string {
    const url = new URL(
      route,
      ReactNativeCoinflowUtils.getCoinflowBaseUrl(env)
    );
    url.searchParams.append('pubkey', publicKey);
    if (transaction) {
      const serializedTx = base58.encode(
        transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
      );
      url.searchParams.append('transaction', serializedTx);
    }
    if (amount) {
      url.searchParams.append('amount', amount.toString());
    }
    return url.toString();
  }
}
