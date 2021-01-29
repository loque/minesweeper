import { RecoilRoot } from "recoil";
import { ConfigProvider } from "../lib/useConfig";
import { GlobalStyle } from "../ui/GlobalStyle";
import theme from "../ui/theme";
import { ThemeProvider } from "styled-components";

function CustomApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <ConfigProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Component {...pageProps} />
        </ThemeProvider>
      </ConfigProvider>
    </RecoilRoot>
  );
}

export default CustomApp;
