import { RecoilRoot } from "recoil";
import { GlobalStyle } from "../ui/GlobalStyle";
import theme from "../ui/theme";
import { ThemeProvider } from "styled-components";

function CustomApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </RecoilRoot>
  );
}

export default CustomApp;
