package cm.uniflow.desktop;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.config.ThemeManager;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.ui.components.Sidebar;
import cm.uniflow.desktop.ui.components.TopBar;
import cm.uniflow.desktop.ui.dialogs.LoginDialog;
import cm.uniflow.desktop.ui.dialogs.RegisterDialog;
import cm.uniflow.desktop.ui.views.*;
import javafx.application.Application;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

import java.util.HashMap;
import java.util.Map;

public class UniFlowApp extends Application {

    private Stage primaryStage;
    private BorderPane mainLayout;
    private StackPane contentArea;
    private Sidebar sidebar;
    private TopBar topBar;

    private final Map<Sidebar.NavSection, Node> viewCache = new HashMap<>();

    @Override
    public void start(Stage stage) {
        this.primaryStage = stage;
        stage.setTitle("UniFlow Desktop — Portail Académique & Campus Numérique · KERNEL FORGE");

        // Set application icon
        try {
            var iconUrl = getClass().getResource("/brand/uniflow_logo_final.png");
            if (iconUrl != null) {
                stage.getIcons().add(new Image(iconUrl.toExternalForm()));
            }
        } catch (Exception ignored) {}

        mainLayout = new BorderPane();
        mainLayout.getStyleClass().add("app-container");

        contentArea = new StackPane();

        sidebar = new Sidebar(this::navigateTo);
        mainLayout.setLeft(sidebar);

        topBar = new TopBar(this::toggleTheme, this::openLoginDialog);
        mainLayout.setTop(topBar);

        mainLayout.setCenter(contentArea);

        Scene scene = new Scene(mainLayout, 1280, 820);
        ThemeManager.applyTheme(ThemeManager.Theme.PRIMER_LIGHT, scene);

        stage.setScene(scene);
        stage.setMinWidth(1000);
        stage.setMinHeight(700);

        // Navigate to default view
        navigateTo(Sidebar.NavSection.DASHBOARD);

        stage.show();
    }

    public void navigateTo(Sidebar.NavSection section) {
        Node view = viewCache.computeIfAbsent(section, this::createViewForSection);
        contentArea.getChildren().setAll(view);

        String subtitle = switch (section) {
            case DASHBOARD -> "Portail Universitaire · Université de Yaoundé I";
            case SCHEDULE -> "Filière Informatique (ICT4D) · Semestre 5";
            case COURSES -> "Unités d'Enseignement & Syllabi Pédagogiques";
            case ATTENDANCE -> "Certification Cryptographique & Pass Étudiant";
            case ZLIBRARY -> "Bibliothèque Numérique Académique & Manuels";
            case UNIMAIL -> "Courrier Électronique Sécurisé @uniflow.cm";
            case ACTUALITES -> "Annonces & Événements Officiels du Campus";
            case VISIO -> "Visioconférence Haute Définition WebRTC";
            case SENTINELLE -> "Supervision IoT des Bornes & Caméras Campus";
            case SETTINGS -> "Paramètres & Configuration Système";
        };

        topBar.updateTitle(section.getTitle(), subtitle);
    }

    private Node createViewForSection(Sidebar.NavSection section) {
        return switch (section) {
            case DASHBOARD -> new DashboardView();
            case SCHEDULE -> new ScheduleView();
            case COURSES -> new CoursesView();
            case ATTENDANCE -> new AttendanceView();
            case ZLIBRARY -> new ZLibraryView();
            case UNIMAIL -> new UniMailView();
            case ACTUALITES -> new ActualitesView();
            case VISIO -> new VisioView();
            case SENTINELLE -> new SentinelleView();
            case SETTINGS -> new SettingsView(this::openLoginDialog);
        };
    }

    private void toggleTheme() {
        if (primaryStage.getScene() == null) return;
        ThemeManager.Theme next = ThemeManager.isDark() ? ThemeManager.Theme.PRIMER_LIGHT : ThemeManager.Theme.PRIMER_DARK;
        ThemeManager.applyTheme(next, primaryStage.getScene());
    }

    public void openLoginDialog() {
        LoginDialog dialog = new LoginDialog(this::openRegisterDialog);
        dialog.initOwner(primaryStage);
        dialog.showAndWait().ifPresent(user -> {
            if (user != null) {
                AppConfig.setCurrentUser(user);
                viewCache.remove(Sidebar.NavSection.DASHBOARD);
                sidebar.selectSection(Sidebar.NavSection.DASHBOARD);
            }
        });
    }

    public void openRegisterDialog() {
        RegisterDialog dialog = new RegisterDialog();
        dialog.initOwner(primaryStage);
        dialog.showAndWait().ifPresent(user -> {
            if (user != null) {
                AppConfig.setCurrentUser(user);
                viewCache.remove(Sidebar.NavSection.DASHBOARD);
                sidebar.selectSection(Sidebar.NavSection.DASHBOARD);
            }
        });
    }

    public static void main(String[] args) {
        launch(args);
    }
}
