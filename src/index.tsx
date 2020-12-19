import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import 'fontsource-roboto';
import { render } from 'react-dom';
import { App } from './app';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { theme } from './theme';

render(
    <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <App />
    </ThemeProvider>,
    document.getElementById('root')
);

serviceWorkerRegistration.register();