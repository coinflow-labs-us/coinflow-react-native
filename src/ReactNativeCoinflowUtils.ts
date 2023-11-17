import {CoinflowEnvs, CoinflowWebViewProps} from './CoinflowTypes';

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
    deviceId,
    chargebackProtectionData,
    rent,
    lockDefaultToken,
    supportsVersionedTransactions,
  }: CoinflowWebViewProps): string {
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

    if (supportsVersionedTransactions) {
      url.searchParams.append('supportsVersionedTransactions', 'true');
    }

    if (webhookInfo)
      url.searchParams.append(
        'webhookInfo',
        Buffer.from(JSON.stringify(webhookInfo)).toString('base64')
      );

    if (deviceId) url.searchParams.append('deviceId', deviceId);
    if (chargebackProtectionData)
      url.searchParams.append(
        'chargebackProtectionData',
        JSON.stringify(chargebackProtectionData)
      );

    if (rent) url.searchParams.append('rent', rent.lamports.toString());
    if (lockDefaultToken) url.searchParams.append('lockDefaultToken', 'true');

    return url.toString();
  }
}
