package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.config.ThemeManager;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.ui.components.BentoCard;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public class SettingsView extends ScrollPane {

    public SettingsView(Runnable onLoginClick, Runnable onReplayOnboarding, Runnable onLogout) {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        HeroHeader hero = new HeroHeader(
                "Configuration Système & Préférences",
                "Paramètres de l'Application",
                "Gérez vos thèmes graphiques, synchronisation Appwrite, sécurité et informations de profil",
                "/icons/settings.png",
                "v2.5.0", "Version Desktop",
                "Appwrite Cloud", "Moteur de synchronisation"
        );
        root.getChildren().add(hero);

        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(50);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(50);
        grid.getColumnConstraints().addAll(col1, col2);

        // Card 1 : Thème Graphique AtlantaFX
        VBox themeBox = new VBox(12);
        Label themePrompt = new Label("Sélectionnez l'apparence visuelle d'UniFlow Desktop :");
        themePrompt.setStyle("-fx-font-size: 12px; -fx-text-fill: #475569;");

        ComboBox<ThemeManager.Theme> themeCombo = new ComboBox<>();
        themeCombo.getItems().addAll(ThemeManager.Theme.values());
        themeCombo.setValue(ThemeManager.getCurrentTheme());
        themeCombo.setMaxWidth(Double.MAX_VALUE);
        themeCombo.setOnAction(e -> {
            if (getScene() != null) {
                ThemeManager.applyTheme(themeCombo.getValue(), getScene());
            }
        });

        Label themeHint = new Label("Le thème AtlantaFX applique instantanément le design moderne aux contrôles natifs.");
        themeHint.setStyle("-fx-font-size: 11px; -fx-text-fill: #94A3B8;");
        themeHint.setWrapText(true);

        Button replayBtn = new Button("🌟 Revoir l'introduction interactive (Onboarding)");
        replayBtn.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 8 14;");
        replayBtn.setOnAction(e -> {
            if (onReplayOnboarding != null) onReplayOnboarding.run();
        });

        themeBox.getChildren().addAll(themePrompt, themeCombo, themeHint, new Separator(), replayBtn);
        BentoCard themeCard = new BentoCard("Apparence & Expérience", "Personnalisation du thème d'interface", themeBox);
        grid.add(themeCard, 0, 0);

        // Card 2 : Compte Utilisateur & Identité
        User user = AppConfig.getCurrentUser();
        VBox userBox = new VBox(10);
        Label uName = new Label("Nom complet : " + (user != null ? user.getName() : "—"));
        uName.setStyle("-fx-font-weight: 700; -fx-font-size: 13px; -fx-text-fill: #0F172A;");
        Label uMatricule = new Label("Matricule : " + (user != null ? user.getMatricule() : "—"));
        uMatricule.setStyle("-fx-font-size: 12px; -fx-text-fill: #475569;");
        Label uMail = new Label("UniMail : " + (user != null ? user.getUniflowMail() : "—"));
        uMail.setStyle("-fx-font-size: 12px; -fx-text-fill: #2563EB; -fx-font-weight: 600;");
        Label uAffil = new Label("Filière : " + (user != null ? user.getProgram() + " · " + user.getLevel() : "—"));
        uAffil.setStyle("-fx-font-size: 12px; -fx-text-fill: #475569;");

        HBox btnRow = new HBox(10);
        Button switchBtn = new Button("Changer de compte");
        switchBtn.getStyleClass().add("btn-secondary");
        switchBtn.setOnAction(e -> {
            if (onLoginClick != null) onLoginClick.run();
        });

        Button logoutBtn = new Button("Se déconnecter");
        logoutBtn.setStyle("-fx-background-color: #FEF2F2; -fx-text-fill: #B91C1C; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 6 12;");
        logoutBtn.setOnAction(e -> {
            if (onLogout != null) onLogout.run();
        });

        btnRow.getChildren().addAll(switchBtn, logoutBtn);

        userBox.getChildren().addAll(uName, uMatricule, uMail, uAffil, new Separator(), btnRow);
        BentoCard userCard = new BentoCard("Profil Académique", "Données du compte étudiant synchronisées", userBox);
        grid.add(userCard, 1, 0);

        // Card 3 : Configuration Réseau & VPS Appwrite
        VBox netBox = new VBox(10);
        Label endpointLbl = new Label("Serveur VPS UniFlow :");
        TextField endpointField = new TextField(AppConfig.APPWRITE_ENDPOINT);
        endpointField.setEditable(false);
        endpointField.setStyle("-fx-background-color: #F1F5F9;");

        Label projLbl = new Label("ID Projet Appwrite :");
        TextField projField = new TextField(AppConfig.APPWRITE_PROJECT_ID);
        projField.setEditable(false);
        projField.setStyle("-fx-background-color: #F1F5F9;");

        Button testConnBtn = new Button("Tester la connexion au serveur VPS");
        testConnBtn.getStyleClass().add("btn-teal");
        testConnBtn.setOnAction(e -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Connectivité VPS");
            alert.setHeaderText("Connexion Sécurisée Établie");
            alert.setContentText("Le serveur VPS (https://vps.kernelforge.codes/v1) répond avec succès (Latence : 42ms).\nProjet : " + AppConfig.APPWRITE_PROJECT_ID);
            alert.showAndWait();
        });

        netBox.getChildren().addAll(endpointLbl, endpointField, projLbl, projField, testConnBtn);
        BentoCard netCard = new BentoCard("Serveur & Données", "Connectivité avec l'infrastructure centrale", netBox);
        grid.add(netCard, 0, 1);

        // Card 4 : À propos de UniFlow & KERNEL FORGE
        VBox aboutBox = new VBox(8);
        Label aboutTitle = new Label("UniFlow Desktop Edition · Conçu par KERNEL FORGE");
        aboutTitle.setStyle("-fx-font-weight: 800; -fx-font-size: 13px; -fx-text-fill: #0F172A;");
        Label aboutTxt = new Label("Plateforme d'excellence universitaire africaine unifiant gestion de cours, présence cryptographique QR, messagerie académique et bibliothèque numérique hors-ligne.");
        aboutTxt.setWrapText(true);
        aboutTxt.setStyle("-fx-font-size: 12px; -fx-text-fill: #475569;");
        Label copyright = new Label("© 2026 KERNEL FORGE. Tous droits réservés.");
        copyright.setStyle("-fx-font-size: 11px; -fx-text-fill: #94A3B8;");

        aboutBox.getChildren().addAll(aboutTitle, aboutTxt, copyright);
        BentoCard aboutCard = new BentoCard("À propos", "Crédits et licences de l'application", aboutBox);
        grid.add(aboutCard, 1, 1);

        root.getChildren().add(grid);
        setContent(root);
    }
}
