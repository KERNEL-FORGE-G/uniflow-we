package cm.uniflow.desktop.config;

import atlantafx.base.theme.CupertinoDark;
import atlantafx.base.theme.CupertinoLight;
import atlantafx.base.theme.NordDark;
import atlantafx.base.theme.PrimerDark;
import atlantafx.base.theme.PrimerLight;
import javafx.application.Application;
import javafx.scene.Scene;

public class ThemeManager {
    public enum Theme {
        PRIMER_LIGHT,
        PRIMER_DARK,
        CUPERTINO_LIGHT,
        CUPERTINO_DARK,
        NORD_DARK
    }

    private static Theme currentTheme = Theme.PRIMER_LIGHT;

    public static void applyTheme(Theme theme, Scene scene) {
        currentTheme = theme;
        switch (theme) {
            case PRIMER_LIGHT -> Application.setUserAgentStylesheet(new PrimerLight().getUserAgentStylesheet());
            case PRIMER_DARK -> Application.setUserAgentStylesheet(new PrimerDark().getUserAgentStylesheet());
            case CUPERTINO_LIGHT -> Application.setUserAgentStylesheet(new CupertinoLight().getUserAgentStylesheet());
            case CUPERTINO_DARK -> Application.setUserAgentStylesheet(new CupertinoDark().getUserAgentStylesheet());
            case NORD_DARK -> Application.setUserAgentStylesheet(new NordDark().getUserAgentStylesheet());
        }

        if (scene != null) {
            var cssUrl = ThemeManager.class.getResource("/css/uniflow.css");
            if (cssUrl != null) {
                String cssExternal = cssUrl.toExternalForm();
                if (!scene.getStylesheets().contains(cssExternal)) {
                    scene.getStylesheets().add(cssExternal);
                }
            }
        }
    }

    public static Theme getCurrentTheme() {
        return currentTheme;
    }

    public static boolean isDark() {
        return currentTheme == Theme.PRIMER_DARK || currentTheme == Theme.CUPERTINO_DARK || currentTheme == Theme.NORD_DARK;
    }
}
