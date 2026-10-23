package cm.uniflow.desktop.ui.dialogs;

import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.services.AppwriteService;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public class RegisterDialog extends Dialog<User> {

    public RegisterDialog() {
        setTitle("Inscription — UniFlow Desktop");
        setHeaderText("Créer votre compte étudiant et simplifiez vos études");

        VBox form = new VBox(10);
        form.setPadding(new Insets(20));
        form.setPrefWidth(420);

        TextField nameField = new TextField();
        nameField.setPromptText("Nom et Prénom");

        TextField emailField = new TextField();
        emailField.setPromptText("Adresse email");

        TextField matriculeField = new TextField();
        matriculeField.setPromptText("Matricule étudiant (ex: 21T2849)");

        PasswordField pwdField = new PasswordField();
        pwdField.setPromptText("Mot de passe (8 caractères min)");

        ComboBox<String> programCombo = new ComboBox<>();
        programCombo.getItems().addAll("Informatique (ICT4D)", "Mathématiques", "Physique", "Chimie", "Biochimie");
        programCombo.setValue("Informatique (ICT4D)");
        programCombo.setMaxWidth(Double.MAX_VALUE);

        ComboBox<String> levelCombo = new ComboBox<>();
        levelCombo.getItems().addAll("L1", "L2", "L3", "M1", "M2", "Doctorat");
        levelCombo.setValue("L3");
        levelCombo.setMaxWidth(Double.MAX_VALUE);

        form.getChildren().addAll(
                new Label("Nom complet :"), nameField,
                new Label("Email :"), emailField,
                new Label("Matricule étudiant :"), matriculeField,
                new Label("Mot de passe :"), pwdField,
                new Label("Filière académique :"), programCombo,
                new Label("Niveau :"), levelCombo
        );

        getDialogPane().setContent(form);
        ButtonType registerBtnType = new ButtonType("Créer mon compte", ButtonBar.ButtonData.OK_DONE);
        getDialogPane().getButtonTypes().addAll(registerBtnType, ButtonType.CANCEL);

        Button regBtn = (Button) getDialogPane().lookupButton(registerBtnType);
        regBtn.getStyleClass().add("btn-primary");

        setResultConverter(btn -> {
            if (btn == registerBtnType) {
                String name = nameField.getText().trim();
                String email = emailField.getText().trim();
                String matricule = matriculeField.getText().trim();
                String pwd = pwdField.getText();
                if (!name.isEmpty() && !email.isEmpty()) {
                    return AppwriteService.register(name, email, pwd, "STUDENT", matricule);
                }
            }
            return null;
        });
    }
}
