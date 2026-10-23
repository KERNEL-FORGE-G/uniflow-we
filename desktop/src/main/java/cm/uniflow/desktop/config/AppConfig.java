package cm.uniflow.desktop.config;

import cm.uniflow.desktop.models.User;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;

public class AppConfig {
    public static final String APP_NAME = "UniFlow Desktop";
    public static final String APP_VERSION = "2.5.0";
    public static final String ORG_NAME = "KERNEL FORGE";
    public static final String APPWRITE_ENDPOINT = "https://vps.kernelforge.codes/v1";
    public static final String APPWRITE_PROJECT_ID = "uniflow";
    public static final String APPWRITE_DATABASE_ID = "uniflow";

    private static final ObjectProperty<User> currentUser = new SimpleObjectProperty<>(new User());

    public static User getCurrentUser() {
        return currentUser.get();
    }

    public static void setCurrentUser(User user) {
        currentUser.set(user);
    }

    public static ObjectProperty<User> currentUserProperty() {
        return currentUser;
    }
}
