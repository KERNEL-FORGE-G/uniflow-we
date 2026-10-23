package cm.uniflow.desktop.ui.dialogs;

import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.services.AppwriteService;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public class LoginDialog extends Dialog<User> {

    public LoginDialog(Runnable onOpenRegister) {
        setTitle("Connexion — UniFlow Desktop");
        setHeaderText("Accédez à votre espace universitaire ou personnel");

        VBox form = new VBox(12);
        form.setPadding(new Insets(20));
        form.setPrefWidth(380);

        Label errLabel = new Label();
        errLabel.setStyle("-fx-text-fill: #EF4444; -fx-font-weight: 700; -fx-font-size: 11px;");
        errLabel.setVisible(false);

        TextField emailField = new TextField("ravel.nghomsi@uniflow.cm");
        emailField.setPromptText("Adresse email ou identifiant");
        emailField.getStyleClass().add("search-field");

        PasswordField passwordField = new PasswordField();
        passwordField.setText("MotDePasse2026!");
        passwordField.setPromptText("Mot de passe sécurisé");
        passwordField.getStyleClass().add("search-field");

        ComboBox<String> typeCombo = new ComboBox<>();
        typeCombo.getItems().addAll("Espace Académique (Université)", "Espace Indépendant (Personnel)");
        typeCombo.setValue("Espace Académique (Université)");
        typeCombo.setMaxWidth(Double.MAX_VALUE);

        Hyperlink registerLink = new Hyperlink("Pas encore de compte ? Créer un compte");
        registerLink.setOnAction(e -> {
            close();
            if (onOpenRegister != null) onOpenRegister.run();
        });

        form.getChildren().addAll(
                errLabel,
                new Label("Type d'espace :"), typeCombo,
                new Label("Email ou Matricule :"), emailField,
                new Label("Mot de passe :"), passwordField,
                registerLink
        );

        getDialogPane().setContent(form);
        ButtonType loginBtnType = new ButtonType("Se connecter", ButtonBar.ButtonData.OK_DONE);
        getDialogPane().getButtonTypes().addAll(loginBtnType, ButtonType.CANCEL);

        Button loginBtn = (Button) getDialogPane().lookupButton(loginBtnType);
        loginBtn.getStyleClass().add("btn-primary");

        setResultConverter(dialogButton -> {
            if (dialogButton == loginBtnType) {
                try {
                    return AppwriteService.login(emailField.getText().trim(), passwordField.getText());
                } catch (Exception e) {
                    errLabel.setText(e.getMessage());
                    errLabel.setVisible(true);
                    return null;
                }
            }
            return null;
        });
    }
}
