package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.services.AppwriteService;
import javafx.animation.FadeTransition;
import javafx.animation.TranslateTransition;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.util.Duration;

public class RegisterView extends HBox {

    private final Runnable onRegisterSuccess;
    private final Runnable onGoToLogin;

    private int currentStep = 1;

    // Fields Step 1
    private String category = "UNIVERSITY";
    private final TextField firstNameField = new TextField();
    private final TextField lastNameField = new TextField();
    private final TextField emailField = new TextField();
    private final TextField matriculeField = new TextField();
    private final ComboBox<String> programCombo = new ComboBox<>();
    private final ComboBox<String> levelCombo = new ComboBox<>();

    // Fields Step 2
    private final PasswordField pwdField = new PasswordField();
    private final PasswordField confirmPwdField = new PasswordField();
    private final CheckBox termsCheck = new CheckBox("J'accepte la charte informatique et le règlement de l'université.");

    private final VBox step1Box = new VBox(12);
    private final VBox step2Box = new VBox(12);
    private final StackPane stepContainer = new StackPane();

    private final Label stepIndicator = new Label("Étape 1 sur 2 : Identité & Espace Académique");
    private final Label errorLabel = new Label();
    private final Button actionBtn = new Button("Continuer vers la sécurisation →");

    public RegisterView(Runnable onRegisterSuccess, Runnable onGoToLogin) {
        this.onRegisterSuccess = onRegisterSuccess;
        this.onGoToLogin = onGoToLogin;

        setAlignment(Pos.CENTER);
        getStyleClass().add("app-container");

        buildShowcasePane();
        buildFormCard();
    }

    private void buildShowcasePane() {
        VBox showcase = new VBox(24);
        showcase.setAlignment(Pos.CENTER_LEFT);
        showcase.setPadding(new Insets(48));
        showcase.setPrefWidth(520);
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
        logoBox.getChildren().add(brand);

        Label headline = new Label("Rejoignez des milliers d'étudiants connectés au campus.");
        headline.setStyle("-fx-font-size: 26px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-line-spacing: 4;");
        headline.setWrapText(true);

        Label sub = new Label("Créez votre compte en 2 minutes et accédez immédiatement à vos cours, emplois du temps officiels et votre adresse académique @uniflow.cm.");
        sub.setStyle("-fx-font-size: 14px; -fx-text-fill: #BAE6FD; -fx-line-spacing: 3;");
        sub.setWrapText(true);

        ImageView mascot = null;
        try {
            var url = getClass().getResource("/mascot/uni_copilot_3d.png");
            if (url != null) {
                mascot = new ImageView(new Image(url.toExternalForm(), 120, 120, true, true));
            }
        } catch (Exception ignored) {}

        Region sp = new Region();
        VBox.setVgrow(sp, Priority.ALWAYS);

        Label copy = new Label("KERNEL FORGE · Système d'Excellence Académique");
        copy.setStyle("-fx-font-size: 11px; -fx-text-fill: rgba(255, 255, 255, 0.65);");

        showcase.getChildren().addAll(logoBox, headline, sub);
        if (mascot != null) showcase.getChildren().add(mascot);
        showcase.getChildren().addAll(sp, copy);

        getChildren().add(showcase);
    }

    private void buildFormCard() {
        VBox rightPane = new VBox();
        rightPane.setAlignment(Pos.CENTER);
        rightPane.setPadding(new Insets(40));
        rightPane.setPrefWidth(560);
        HBox.setHgrow(rightPane, Priority.ALWAYS);

        VBox card = new VBox(16);
        card.setMaxWidth(480);
        card.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #E2E8F0; -fx-border-radius: 24; -fx-background-radius: 24; -fx-padding: 32; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.06), 20, 0, 0, 6);");

        stepIndicator.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 800; -fx-text-fill: #2563EB;");

        Label title = new Label("Créer votre compte UniFlow");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");

        // Error Label
        errorLabel.setStyle("-fx-background-color: #FEF2F2; -fx-border-color: #FECACA; -fx-text-fill: #B91C1C; -fx-font-weight: 700; -fx-font-size: 11px; -fx-padding: 8 12; -fx-background-radius: 10;");
        errorLabel.setVisible(false);
        errorLabel.setManaged(false);

        buildStep1();
        buildStep2();

        step2Box.setVisible(false);
        step2Box.setManaged(false);

        stepContainer.getChildren().addAll(step1Box, step2Box);

        // Buttons
        HBox btnRow = new HBox(12);
        Button backBtn = new Button("← Précédent");
        backBtn.getStyleClass().add("btn-secondary");
        backBtn.setVisible(false);
        backBtn.setOnAction(e -> goToStep(1));

        actionBtn.getStyleClass().add("btn-primary");
        actionBtn.setMaxWidth(Double.MAX_VALUE);
        HBox.setHgrow(actionBtn, Priority.ALWAYS);
        actionBtn.setStyle("-fx-font-size: 13.5px; -fx-padding: 11; -fx-background-radius: 14;");

        actionBtn.setOnAction(e -> {
            if (currentStep == 1) {
                if (validateStep1()) {
                    backBtn.setVisible(true);
                    goToStep(2);
                }
            } else {
                handleRegister();
            }
        });

        btnRow.getChildren().addAll(backBtn, actionBtn);

        // Footer
        HBox footer = new HBox(6);
        footer.setAlignment(Pos.CENTER);
        Label already = new Label("Vous avez déjà un compte ?");
        already.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B;");
        Hyperlink loginLink = new Hyperlink("Se connecter");
        loginLink.setStyle("-fx-font-size: 12px; -fx-font-weight: 800; -fx-text-fill: #1E3A8A;");
        loginLink.setOnAction(e -> onGoToLogin.run());
        footer.getChildren().addAll(already, loginLink);

        card.getChildren().addAll(stepIndicator, title, errorLabel, stepContainer, btnRow, footer);
        rightPane.getChildren().add(card);
        getChildren().add(rightPane);
    }

    private void buildStep1() {
        step1Box.getChildren().clear();

        // Mode switch
        HBox modeTabs = new HBox(6);
        modeTabs.setStyle("-fx-background-color: #F1F5F9; -fx-border-color: #E2E8F0; -fx-border-radius: 12; -fx-background-radius: 12; -fx-padding: 4;");
        Button uniBtn = new Button("Compte Académique (UY1)");
        Button indepBtn = new Button("Compte Indépendant");
        uniBtn.setMaxWidth(Double.MAX_VALUE);
        indepBtn.setMaxWidth(Double.MAX_VALUE);
        HBox.setHgrow(uniBtn, Priority.ALWAYS);
        HBox.setHgrow(indepBtn, Priority.ALWAYS);

        uniBtn.setStyle("-fx-background-color: #FFFFFF; -fx-text-fill: #1E3A8A; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 6;");
        indepBtn.setStyle("-fx-background-color: transparent; -fx-text-fill: #64748B; -fx-font-weight: 600; -fx-background-radius: 10; -fx-padding: 6;");

        uniBtn.setOnAction(e -> {
            category = "UNIVERSITY";
            uniBtn.setStyle("-fx-background-color: #FFFFFF; -fx-text-fill: #1E3A8A; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 6;");
            indepBtn.setStyle("-fx-background-color: transparent; -fx-text-fill: #64748B; -fx-font-weight: 600; -fx-background-radius: 10; -fx-padding: 6;");
            matriculeField.setDisable(false);
        });

        indepBtn.setOnAction(e -> {
            category = "PERSONAL";
            indepBtn.setStyle("-fx-background-color: #FFFFFF; -fx-text-fill: #1E3A8A; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 6;");
            uniBtn.setStyle("-fx-background-color: transparent; -fx-text-fill: #64748B; -fx-font-weight: 600; -fx-background-radius: 10; -fx-padding: 6;");
            matriculeField.setDisable(true);
        });

        modeTabs.getChildren().addAll(uniBtn, indepBtn);

        // Name fields row
        HBox namesRow = new HBox(10);
        firstNameField.setPromptText("Prénom");
        firstNameField.getStyleClass().add("search-field");
        lastNameField.setPromptText("Nom");
        lastNameField.getStyleClass().add("search-field");
        HBox.setHgrow(firstNameField, Priority.ALWAYS);
        HBox.setHgrow(lastNameField, Priority.ALWAYS);
        namesRow.getChildren().addAll(firstNameField, lastNameField);

        emailField.setPromptText("Adresse email officielle ou personnelle");
        emailField.getStyleClass().add("search-field");

        matriculeField.setPromptText("Matricule étudiant officiel (ex: 21T2849)");
        matriculeField.getStyleClass().add("search-field");

        programCombo.getItems().addAll("Informatique (ICT4D)", "Génie Logiciel", "Systèmes & Réseaux", "Mathématiques", "Physique");
        programCombo.setValue("Informatique (ICT4D)");
        programCombo.setMaxWidth(Double.MAX_VALUE);

        levelCombo.getItems().addAll("Licence 1 (L1)", "Licence 2 (L2)", "Licence 3 (L3)", "Master 1 (M1)", "Master 2 (M2)");
        levelCombo.setValue("Licence 3 (L3)");
        levelCombo.setMaxWidth(Double.MAX_VALUE);

        step1Box.getChildren().addAll(
                modeTabs,
                new Label("Nom & Prénom :"), namesRow,
                new Label("Adresse Email :"), emailField,
                new Label("Matricule Étudiant :"), matriculeField,
                new Label("Filière & Parcours :"), programCombo,
                new Label("Niveau Universitaire :"), levelCombo
        );
    }

    private void buildStep2() {
        step2Box.getChildren().clear();

        pwdField.setPromptText("Mot de passe (8 caractères minimum)");
        pwdField.getStyleClass().add("search-field");

        confirmPwdField.setPromptText("Confirmez votre mot de passe");
        confirmPwdField.getStyleClass().add("search-field");

        termsCheck.setSelected(true);
        termsCheck.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #475569;");
        termsCheck.setWrapText(true);

        Label secHint = new Label("💡 Votre mot de passe protège votre clé de présence et vos attestations officielles.");
        secHint.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 10; -fx-background-radius: 10; -fx-padding: 10; -fx-font-size: 11px; -fx-text-fill: #64748B;");
        secHint.setWrapText(true);

        step2Box.getChildren().addAll(
                new Label("Mot de passe :"), pwdField,
                new Label("Confirmer le mot de passe :"), confirmPwdField,
                secHint,
                termsCheck
        );
    }

    private boolean validateStep1() {
        if (firstNameField.getText().trim().isEmpty() || lastNameField.getText().trim().isEmpty()) {
            showError("Veuillez renseigner votre nom et prénom.");
            return false;
        }
        if (emailField.getText().trim().isEmpty() || !emailField.getText().contains("@")) {
            showError("Veuillez saisir une adresse email valide.");
            return false;
        }
        if ("UNIVERSITY".equals(category) && matriculeField.getText().trim().isEmpty()) {
            showError("Le matricule étudiant est obligatoire pour un compte universitaire.");
            return false;
        }
        hideError();
        return true;
    }

    private void goToStep(int step) {
        this.currentStep = step;
        if (step == 1) {
            stepIndicator.setText("Étape 1 sur 2 : Identité & Espace Académique");
            actionBtn.setText("Continuer vers la sécurisation →");
            step2Box.setVisible(false);
            step2Box.setManaged(false);
            step1Box.setVisible(true);
            step1Box.setManaged(true);
        } else {
            stepIndicator.setText("Étape 2 sur 2 : Mot de passe & Validation");
            actionBtn.setText("Créer mon compte et entrer 🚀");
            step1Box.setVisible(false);
            step1Box.setManaged(false);
            step2Box.setVisible(true);
            step2Box.setManaged(true);
        }
        FadeTransition ft = new FadeTransition(Duration.millis(250), stepContainer);
        ft.setFromValue(0.2);
        ft.setToValue(1.0);
        ft.play();
    }

    private void handleRegister() {
        String p1 = pwdField.getText();
        String p2 = confirmPwdField.getText();

        if (p1.length() < 8) {
            showError("Le mot de passe doit comporter au moins 8 caractères.");
            return;
        }
        if (!p1.equals(p2)) {
            showError("Les deux mots de passe ne correspondent pas.");
            return;
        }
        if (!termsCheck.isSelected()) {
            showError("Veuillez accepter le règlement pour continuer.");
            return;
        }

        actionBtn.setDisable(true);
        actionBtn.setText("Création du compte en cours...");

        new Thread(() -> {
            String fullName = firstNameField.getText().trim() + " " + lastNameField.getText().trim();
            String email = emailField.getText().trim();
            String matricule = matriculeField.getText().trim();

            User user = AppwriteService.register(fullName, email, p1, "STUDENT", matricule);
            javafx.application.Platform.runLater(() -> {
                AppConfig.setCurrentUser(user);
                onRegisterSuccess.run();
            });
        }).start();
    }

    private void showError(String msg) {
        errorLabel.setText(msg);
        errorLabel.setVisible(true);
        errorLabel.setManaged(true);
    }

    private void hideError() {
        errorLabel.setVisible(false);
        errorLabel.setManaged(false);
    }
}
