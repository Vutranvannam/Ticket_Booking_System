import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/app/store";
import AppRouter from "@/app/router/AppRouter";
import { ThemeProvider } from "@/core/theme/ThemeProvider";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system">
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
