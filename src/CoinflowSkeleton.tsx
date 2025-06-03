import React from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export function CoinflowSkeleton({
  style,
  loaderBackground = '#ffffff',
}: {
  style?: StyleProp<ViewStyle>;
  loaderBackground?: string;
}) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.05, 0.1, 0.05],
  });

  const invertedColor = invertHexColor(loaderBackground);

  const skeletonStyle = {
    backgroundColor: invertedColor,
    opacity,
    width: '100%',
  } satisfies ViewStyle;
  return (
    <SafeAreaView style={[{flex: 1, backgroundColor: loaderBackground}, style]}>
      <View style={styles.container}>
        <View style={styles.row}>
          <Animated.View style={[styles.skeleton, skeletonStyle, {flex: 1}]} />
          <Animated.View style={[styles.skeleton, skeletonStyle, {flex: 1}]} />
        </View>
        <Animated.View style={[styles.skeleton, skeletonStyle, {height: 80}]} />
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <Animated.View
            style={[
              styles.skeleton,
              skeletonStyle,
              {width: 100, height: 25, borderRadius: 8},
            ]}
          />
          <Animated.View
            style={[
              styles.skeleton,
              skeletonStyle,
              {width: 100, height: 25, borderRadius: 8},
            ]}
          />
        </View>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <Animated.View
            style={[
              styles.skeleton,
              skeletonStyle,
              {width: 100, height: 25, borderRadius: 8},
            ]}
          />
          <Animated.View
            style={[
              styles.skeleton,
              skeletonStyle,
              {width: 100, height: 25, borderRadius: 8},
            ]}
          />
        </View>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <Animated.View
            style={[
              styles.skeleton,
              skeletonStyle,
              {width: 125, height: 30, borderRadius: 8},
            ]}
          />
          <Animated.View
            style={[
              styles.skeleton,
              skeletonStyle,
              {width: 125, height: 30, borderRadius: 8},
            ]}
          />
        </View>
        <Animated.View style={[styles.skeleton, skeletonStyle, {height: 80}]} />
        <Animated.View
          style={[
            styles.skeleton,
            skeletonStyle,
            {height: 10, marginHorizontal: 'auto', width: '80%'},
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  skeleton: {
    height: 40,
    backgroundColor: '#E1E9EE',
    borderRadius: 12,
  },
});

function invertHexColor(hex: string): string {
  hex = hex.replace(/^#/, '');
  const rgb = hex.match(/.{2}/g)?.map(val => 255 - parseInt(val, 16)) || [];
  return `#${rgb.map(val => val.toString(16).padStart(2, '0')).join('')}`;
}
