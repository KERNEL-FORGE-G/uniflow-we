package cm.uniflow.desktop.ui.components;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.config.ThemeManager;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public class TopBar extends HBox {

    private final Label titleLabel = new Label("Tableau de bord");
    private final Label subtitleLabel = new Label("Portail Universitaire · Université de Yaoundé I");
    private final TextField searchField = new TextField();

    public TopBar(Runnable onThemeToggle, Runnable onLoginClick) {
        setAlignment(Pos.CENTER_LEFT);
        setSpacing(16);
        getStyleClass().add("topbar");

        VBox titleBox = new VBox(2);
        titleLabel.setStyle("-fx-font-size: 17px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        subtitleLabel.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #64748B; -fx-font-weight: 500;");
        titleBox.getChildren().addAll(titleLabel, subtitleLabel);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        searchField.setPromptText("Rechercher un cours, un enseignant, une ressource...");
        searchField.setPrefWidth(300);
        searchField.getStyleClass().add("search-field");

        // Network Status Pill
        HBox statusPill = new HBox(6);
        statusPill.setAlignment(Pos.CENTER);
        statusPill.setStyle("-fx-background-color: #ECFDF5; -fx-border-color: #A7F3D0; -fx-border-radius: 14; -fx-background-radius: 14; -fx-padding: 4 10;");
        Label dot = new Label("●");
        dot.setStyle("-fx-text-fill: #10B981; -fx-font-size: 10px;");
        Label statusText = new Label("En ligne · VPS UY1");
        statusText.setStyle("-fx-text-fill: #047857; -fx-font-weight: 700; -fx-font-size: 11px;");
        statusPill.getChildren().addAll(dot, statusText);

        // Theme Toggle Button
        Button themeBtn = new Button("🌓");
        themeBtn.getStyleClass().add("btn-secondary");
        themeBtn.setStyle("-fx-padding: 6 10; -fx-background-radius: 12;");
        themeBtn.setTooltip(new Tooltip("Basculer thème Clair / Sombre"));
        themeBtn.setOnAction(e -> onThemeToggle.run());

        // Account Button
        Button accountBtn = new Button("Mon Profil");
        accountBtn.getStyleClass().add("btn-secondary");
        accountBtn.setOnAction(e -> onLoginClick.run());

        getChildren().addAll(titleBox, spacer, searchField, statusPill, themeBtn, accountBtn);
    }

    public void updateTitle(String title, String subtitle) {
        titleLabel.setText(title);
        subtitleLabel.setText(subtitle);
    }
}
