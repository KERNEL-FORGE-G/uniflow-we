package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.services.AppwriteService;
import javafx.animation.FadeTransition;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.util.Duration;

public class LoginView extends HBox {

    private final Runnable onLoginSuccess;
    private final Runnable onGoToRegister;

    private String accountType = "UNIVERSITY";
    private final TextField identifierField = new TextField("ravel.nghomsi@uniflow.cm");
    private final PasswordField passwordField = new PasswordField();
    private final Label errorLabel = new Label();
    private final Button loginBtn = new Button("Se connecter");
    private final ProgressIndicator spinner = new ProgressIndicator();

    public LoginView(Runnable onLoginSuccess, Runnable onGoToRegister) {
        this.onLoginSuccess = onLoginSuccess;
        this.onGoToRegister = onGoToRegister;

        setAlignment(Pos.CENTER);
        getStyleClass().add("app-container");

        buildShowcasePane();
        buildLoginCard();
    }

    private void buildShowcasePane() {
        VBox showcase = new VBox(24);
        showcase.setAlignment(Pos.CENTER_LEFT);
        showcase.setPadding(new Insets(48));
        showcase.setPrefWidth(550);
        showcase.setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B 0%, #1E3A8A 55%, #0D9488 100%);");
        HBox.setHgrow(showcase, Priority.ALWAYS);

        // Logo
        HBox logoBox = new HBox(12);
        logoBox.setAlignment(Pos.CENTER_LEFT);
        try {
            var url = getClass().getResource("/brand/uniflow_logo_final.png");
            if (url != null) {
                ImageView iv = new ImageView(new Image(url.toExternalForm(), 42, 42, true, true));
                logoBox.getChildren().add(iv);
            }
        } catch (Exception ignored) {}
        Label brand = new Label("UniFlow");
        brand.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF;");
        Label edition = new Label("Desktop Enterprise");
        edition.setStyle("-fx-font-size: 13px; -fx-text-fill: #38BDF8; -fx-font-weight: 700;");
        logoBox.getChildren().addAll(brand, edition);

        Label headline = new Label("L'excellence universitaire africaine unifiée en un seul espace.");
        headline.setStyle("-fx-font-size: 26px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-line-spacing: 4;");
        headline.setWrapText(true);

        Label sub = new Label("Planning LMD en direct, émargement cryptographique, bibliothèque numérique et messagerie officielle @uniflow.cm.");
        sub.setStyle("-fx-font-size: 14px; -fx-text-fill: #BAE6FD; -fx-line-spacing: 3;");
        sub.setWrapText(true);

        // Pillars
        VBox pillars = new VBox(10);
        pillars.getChildren().addAll(
                createPillarRow("🗓️", "Emploi du temps temps réel & alertes salles"),
                createPillarRow("🛡️", "Feuille de présence certifiée par QR Code"),
                createPillarRow("📚", "Z-Library : 15,000+ manuels 100% hors-ligne"),
                createPillarRow("✉️", "UniMail @uniflow.cm signé cryptographiquement")
        );

        // Mascot 3D
        HBox mascotBox = new HBox(16);
        mascotBox.setAlignment(Pos.CENTER_LEFT);
        try {
            var url = getClass().getResource("/mascot/uni_copilot_3d.png");
            if (url != null) {
                ImageView iv = new ImageView(new Image(url.toExternalForm(), 90, 90, true, true));
                mascotBox.getChildren().add(iv);
            }
        } catch (Exception ignored) {}
        VBox mTxt = new VBox(2);
        Label mTitle = new Label("Uni Copilot IA Intégré");
        mTitle.setStyle("-fx-font-weight: 800; -fx-text-fill: #FFFFFF; -fx-font-size: 13px;");
        Label mSub = new Label("Votre tuteur académique toujours à portée de main");
        mSub.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #E2E8F0;");
        mTxt.getChildren().addAll(mTitle, mSub);
        mascotBox.getChildren().add(mTxt);

        Region sp = new Region();
        VBox.setVgrow(sp, Priority.ALWAYS);

        Label copy = new Label("Conçu et propulsé par KERNEL FORGE · Université de Yaoundé I");
        copy.setStyle("-fx-font-size: 11px; -fx-text-fill: rgba(255, 255, 255, 0.65);");

        showcase.getChildren().addAll(logoBox, headline, sub, pillars, mascotBox, sp, copy);
        getChildren().add(showcase);
    }

    private HBox createPillarRow(String emoji, String text) {
        HBox row = new HBox(10);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setStyle("-fx-background-color: rgba(255, 255, 255, 0.12); -fx-border-color: rgba(255, 255, 255, 0.18); -fx-border-radius: 12; -fx-background-radius: 12; -fx-padding: 8 14;");
        Label em = new Label(emoji);
        em.setStyle("-fx-font-size: 15px;");
        Label t = new Label(text);
        t.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 12.5px; -fx-font-weight: 600;");
        row.getChildren().addAll(em, t);
        return row;
    }

    private void buildLoginCard() {
        VBox rightPane = new VBox();
        rightPane.setAlignment(Pos.CENTER);
        rightPane.setPadding(new Insets(48));
        rightPane.setPrefWidth(500);
        HBox.setHgrow(rightPane, Priority.ALWAYS);

        VBox card = new VBox(18);
        card.setMaxWidth(420);
        card.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #E2E8F0; -fx-border-radius: 24; -fx-background-radius: 24; -fx-padding: 36; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.06), 20, 0, 0, 6);");

        Label eyebrow = new Label("PORTAIL D'ACCÈS SÉCURISÉ");
        eyebrow.setStyle("-fx-font-size: 11px; -fx-font-weight: 800; -fx-text-fill: #2563EB; -fx-letter-spacing: 1px;");

        Label title = new Label("Bon retour parmi nous 👋");
        title.setStyle("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");

        Label subtitle = new Label("Connectez-vous pour retrouver vos cours, vos notes et vos présences.");
        subtitle.setStyle("-fx-font-size: 13px; -fx-text-fill: #64748B;");
        subtitle.setWrapText(true);

        // Tabs : Académique vs Personnel
        HBox modeTabs = new HBox(6);
        modeTabs.setStyle("-fx-background-color: #F1F5F9; -fx-border-color: #E2E8F0; -fx-border-radius: 14; -fx-background-radius: 14; -fx-padding: 4;");
        Button uniTab = new Button("Espace Universitaire");
        Button indepTab = new Button("Compte Personnel");
        uniTab.setMaxWidth(Double.MAX_VALUE);
        indepTab.setMaxWidth(Double.MAX_VALUE);
        HBox.setHgrow(uniTab, Priority.ALWAYS);
        HBox.setHgrow(indepTab, Priority.ALWAYS);

        uniTab.setStyle("-fx-background-color: #FFFFFF; -fx-text-fill: #1E3A8A; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 8;");
        indepTab.setStyle("-fx-background-color: transparent; -fx-text-fill: #64748B; -fx-font-weight: 600; -fx-background-radius: 10; -fx-padding: 8;");

        uniTab.setOnAction(e -> {
            accountType = "UNIVERSITY";
            uniTab.setStyle("-fx-background-color: #FFFFFF; -fx-text-fill: #1E3A8A; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 8;");
            indepTab.setStyle("-fx-background-color: transparent; -fx-text-fill: #64748B; -fx-font-weight: 600; -fx-background-radius: 10; -fx-padding: 8;");
            identifierField.setPromptText("Email ou Matricule étudiant");
        });

        indepTab.setOnAction(e -> {
            accountType = "PERSONAL";
            indepTab.setStyle("-fx-background-color: #FFFFFF; -fx-text-fill: #1E3A8A; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 8;");
            uniTab.setStyle("-fx-background-color: transparent; -fx-text-fill: #64748B; -fx-font-weight: 600; -fx-background-radius: 10; -fx-padding: 8;");
            identifierField.setPromptText("Adresse email personnelle");
        });

        modeTabs.getChildren().addAll(uniTab, indepTab);

        // Error message container
        errorLabel.setStyle("-fx-background-color: #FEF2F2; -fx-border-color: #FECACA; -fx-text-fill: #B91C1C; -fx-font-weight: 700; -fx-font-size: 11.5px; -fx-padding: 8 12; -fx-background-radius: 10;");
        errorLabel.setVisible(false);
        errorLabel.setManaged(false);

        // Fields
        VBox idBox = new VBox(4);
        Label idLbl = new Label("Email ou Matricule étudiant :");
        idLbl.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #334155;");
        identifierField.getStyleClass().add("search-field");
        idBox.getChildren().addAll(idLbl, identifierField);

        VBox pwdBox = new VBox(4);
        Label pwdLbl = new Label("Mot de passe :");
        pwdLbl.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #334155;");
        passwordField.setText("MotDePasse2026!");
        passwordField.getStyleClass().add("search-field");
        pwdBox.getChildren().addAll(pwdLbl, passwordField);

        // Options
        HBox opts = new HBox();
        opts.setAlignment(Pos.CENTER_LEFT);
        CheckBox rememberMe = new CheckBox("Rester connecté");
        rememberMe.setSelected(true);
        rememberMe.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #475569;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Hyperlink forgotLink = new Hyperlink("Mot de passe oublié ?");
        forgotLink.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #1E3A8A; -fx-font-weight: 600;");

        opts.getChildren().addAll(rememberMe, sp, forgotLink);

        // Submit Button
        loginBtn.getStyleClass().add("btn-primary");
        loginBtn.setMaxWidth(Double.MAX_VALUE);
        loginBtn.setStyle("-fx-font-size: 14px; -fx-padding: 12; -fx-background-radius: 14;");
        spinner.setPrefSize(18, 18);
        spinner.setVisible(false);
        spinner.setManaged(false);

        loginBtn.setOnAction(e -> handleLogin());

        // Footer register link
        HBox footer = new HBox(6);
        footer.setAlignment(Pos.CENTER);
        Label noAcc = new Label("Pas encore de compte ?");
        noAcc.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B;");
        Hyperlink regLink = new Hyperlink("Créer mon espace");
        regLink.setStyle("-fx-font-size: 12px; -fx-font-weight: 800; -fx-text-fill: #1E3A8A;");
        regLink.setOnAction(e -> onGoToRegister.run());
        footer.getChildren().addAll(noAcc, regLink);

        card.getChildren().addAll(eyebrow, title, subtitle, modeTabs, errorLabel, idBox, pwdBox, opts, loginBtn, footer);
        rightPane.getChildren().add(card);
        getChildren().add(rightPane);
    }

    private void handleLogin() {
        String email = identifierField.getText().trim();
        String pwd = passwordField.getText();

        if (email.isEmpty() || pwd.isEmpty()) {
            showError("Veuillez renseigner vos identifiants de connexion.");
            return;
        }

        loginBtn.setDisable(true);
        loginBtn.setText("Connexion en cours...");

        new Thread(() -> {
            try {
                User user = AppwriteService.login(email, pwd);
                javafx.application.Platform.runLater(() -> {
                    AppConfig.setCurrentUser(user);
                    onLoginSuccess.run();
                });
            } catch (Exception ex) {
                javafx.application.Platform.runLater(() -> {
                    loginBtn.setDisable(false);
                    loginBtn.setText("Se connecter");
                    showError(ex.getMessage());
                });
            }
        }).start();
    }

    private void showError(String msg) {
        errorLabel.setText(msg);
        errorLabel.setVisible(true);
        errorLabel.setManaged(true);
        FadeTransition ft = new FadeTransition(Duration.millis(300), errorLabel);
        ft.setFromValue(0.0);
        ft.setToValue(1.0);
        ft.play();
    }
}
