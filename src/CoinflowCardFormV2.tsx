import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated, Easing, StyleProp, View, ViewStyle} from 'react-native';
import WebView from 'react-native-webview';
import {WebViewMessageEvent} from 'react-native-webview/lib/WebViewTypes';
import LZString from 'lz-string';
import {
  CoinflowEnvs,
  CoinflowUtils,
  INLINE_SKELETON_HEIGHT_PX,
  MerchantTheme,
} from './common';

type CardFormVariant = 'card-form' | 'card-number-form' | 'cvv-form';

interface CardFormBaseProps {
  merchantId: string;
  env?: CoinflowEnvs;
  theme?: MerchantTheme;
  onLoad?: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface CoinflowCardFormProps extends CardFormBaseProps {}

export interface CoinflowCardNumberFormProps extends CardFormBaseProps {}

export interface CoinflowCvvFormProps extends CardFormBaseProps {
  token: string;
}

export interface CardFormTokenResponse {
  token: string;
  expMonth?: string;
  expYear?: string;
  /** Forter device token captured in the card-form WebView; forward it as the `x-forter-token` header on your charge request so Forter can score the transaction. Absent if the Forter SDK has not loaded. */
  forterToken?: string;
}

export interface CardFormNativeRef {
  tokenize(): Promise<CardFormTokenResponse>;
}

function useCardFormWebView({
  variant,
  merchantId,
  env,
  theme,
  token,
  onLoad,
}: CardFormBaseProps & {variant: CardFormVariant; token?: string}) {
  const webViewRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);
  const tokenizeResolveRef = useRef<{
    resolve: (value: CardFormTokenResponse) => void;
    reject: (reason: Error) => void;
  } | null>(null);

  const url = useMemo(() => {
    const baseUrl = CoinflowUtils.getCoinflowBaseUrl(env);
    const iframeUrl = new URL(`/form/v2/${variant}`, baseUrl);
    iframeUrl.searchParams.append('merchantId', merchantId);
    iframeUrl.searchParams.append('useHeightChange', 'true');
    if (theme) {
      iframeUrl.searchParams.append(
        'theme',
        LZString.compressToEncodedURIComponent(JSON.stringify(theme))
      );
    }
    if (token) {
      iframeUrl.searchParams.append('token', token);
    }
    return iframeUrl.toString();
  }, [variant, merchantId, env, theme, token]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const {data} = event.nativeEvent;
      try {
        const parsed = JSON.parse(data);
        if (parsed.method === 'loaded') {
          setLoaded(true);
          onLoad?.();
        }
        if (parsed.method === 'heightChange') {
          const parsedHeight = Number(parsed.data);
          if (Number.isFinite(parsedHeight) && parsedHeight > 0) {
            setIframeHeight(parsedHeight);
          }
        }
        if (parsed.method === 'tokenize' && tokenizeResolveRef.current) {
          const {resolve, reject} = tokenizeResolveRef.current;
          tokenizeResolveRef.current = null;

          if (
            typeof parsed.data === 'string' &&
            parsed.data.startsWith('ERROR')
          ) {
            reject(new Error(parsed.data.replace('ERROR ', '')));
            return;
          }

          const responseData =
            typeof parsed.data === 'string'
              ? JSON.parse(parsed.data)
              : parsed.data;
          resolve(responseData);
        }
      } catch {
        // not JSON
      }
    },
    [onLoad]
  );

  const tokenize = useCallback((): Promise<CardFormTokenResponse> => {
    return new Promise((resolve, reject) => {
      if (!webViewRef.current) {
        reject(new Error('Card form WebView not loaded'));
        return;
      }
      tokenizeResolveRef.current = {resolve, reject};
      webViewRef.current.postMessage('tokenize');
    });
  }, []);

  return {webViewRef, url, loaded, handleMessage, tokenize, iframeHeight};
}

const CardFormWebViewComponent = forwardRef<
  CardFormNativeRef,
  CardFormBaseProps & {variant: CardFormVariant; token?: string}
>(({variant, style, ...props}, ref) => {
  const {webViewRef, url, loaded, handleMessage, tokenize, iframeHeight} =
    useCardFormWebView({
      ...props,
      variant,
    });

  useImperativeHandle(ref, () => ({tokenize}), [tokenize]);

  return (
    <View
      style={[
        {
          height: iframeHeight ?? INLINE_SKELETON_HEIGHT_PX,
          position: 'relative',
        },
        style,
      ]}
    >
      {!loaded && <CardFormSkeleton />}
      <View style={{flex: 1, opacity: loaded ? 1 : 0}}>
        <WebView
          ref={webViewRef}
          source={{uri: url}}
          onMessage={handleMessage}
          style={{flex: 1}}
          originWhitelist={['*']}
          keyboardDisplayRequiresUserAction={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
});

function CardFormSkeleton() {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.4, 1],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        justifyContent: 'center',
        paddingHorizontal: 12,
        opacity,
      }}
    >
      <View
        style={{
          width: '60%',
          height: 10,
          borderRadius: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
        }}
      />
    </Animated.View>
  );
}

export const CoinflowCardForm = forwardRef<
  CardFormNativeRef,
  CoinflowCardFormProps
>((props, ref) => (
  <CardFormWebViewComponent ref={ref} {...props} variant="card-form" />
));

export const CoinflowCardNumberForm = forwardRef<
  CardFormNativeRef,
  CoinflowCardNumberFormProps
>((props, ref) => (
  <CardFormWebViewComponent ref={ref} {...props} variant="card-number-form" />
));

export const CoinflowCvvForm = forwardRef<
  CardFormNativeRef,
  CoinflowCvvFormProps
>((props, ref) => (
  <CardFormWebViewComponent
    ref={ref}
    {...props}
    variant="cvv-form"
    token={props.token}
  />
));

/** @deprecated Use CoinflowCardForm instead */
export const CoinflowCardFormV2 = CoinflowCardForm;
/** @deprecated Use CoinflowCardNumberForm instead */
export const CoinflowCardNumberFormV2 = CoinflowCardNumberForm;
/** @deprecated Use CoinflowCvvForm instead */
export const CoinflowCvvFormV2 = CoinflowCvvForm;
/** @deprecated Use CoinflowCardFormProps instead */
export type CoinflowCardFormV2Props = CoinflowCardFormProps;
/** @deprecated Use CoinflowCardNumberFormProps instead */
export type CoinflowCardNumberFormV2Props = CoinflowCardNumberFormProps;
/** @deprecated Use CoinflowCvvFormProps instead */
export type CoinflowCvvFormV2Props = CoinflowCvvFormProps;
/** @deprecated Use CardFormTokenResponse instead */
export type CardFormV2TokenResponse = CardFormTokenResponse;
/** @deprecated Use CardFormNativeRef instead */
export type CardFormV2NativeRef = CardFormNativeRef;
