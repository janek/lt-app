import {useCallback} from 'react';
import {StatusBar, StatusBarStyle, Platform} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

const isAndroid = Platform.OS === 'android';

export function useSetStatusBarStyle() {
  return useCallback(
    (
      backgroundColor: string,
      style: StatusBarStyle,
      navBarColor?: string,
      navBarLight?: boolean,
    ) => {
      if (isAndroid) {
        StatusBar.setBackgroundColor(backgroundColor);
      }

      StatusBar.setBarStyle(style, true);
      changeNavigationBarColor(
        navBarColor || backgroundColor,
        navBarLight === undefined ? true : navBarLight,
        true,
      );
    },
    [],
  );
}

export default function useStatusBarStyle(
  backgroundColor: string,
  style: StatusBarStyle,
  navBarColor?: string,
) {
  const setStatusBarStyle = useSetStatusBarStyle();
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(backgroundColor, style, navBarColor);
    }, [setStatusBarStyle, backgroundColor, style, navBarColor]),
  );
}
