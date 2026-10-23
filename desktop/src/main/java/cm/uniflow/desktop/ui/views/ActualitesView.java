package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.NewsItem;
import cm.uniflow.desktop.services.MockDataService;
import cm.uniflow.desktop.ui.components.BentoCard;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

import java.util.ArrayList;
import java.util.List;

public class ActualitesView extends ScrollPane {

    private final List<NewsItem> newsList = new ArrayList<>(MockDataService.getSampleNews());
    private final VBox newsContainer = new VBox(20);

    public ActualitesView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        HeroHeader hero = new HeroHeader(
                "Fil d'Actualités & Communications Officielles",
                "Actualités du Campus Universitaire",
                "Restez informé des annonces ministérielles, décrets décanaux, bourses et événements de l'université",
                "/icons/analytics.png",
                "3 Officielles", "Annonces publiées",
                "100% Vérifié", "Source rectorat & décanat"
        );
        root.getChildren().add(hero);

        // Filter and Admin Publish Bar
        HBox bar = new HBox(12);
        bar.setAlignment(Pos.CENTER_LEFT);

        HBox filters = new HBox(8);
        filters.getChildren().addAll(
                createFilterChip("Toutes les actualités", true),
                createFilterChip("Annonces Décanat", false),
                createFilterChip("Pédagogie & Examens", false),
                createFilterChip("Bourses & Concours", false)
        );

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Button publishBtn = new Button("📢 Publier une actualité (Admin)");
        publishBtn.getStyleClass().add("btn-primary");
        publishBtn.setOnAction(e -> showPublishDialog());

        bar.getChildren().addAll(filters, sp, publishBtn);
        root.getChildren().add(bar);

        // News container
        renderNews();
        root.getChildren().add(newsContainer);

        setContent(root);
    }

    private Button createFilterChip(String label, boolean active) {
        Button b = new Button(label);
        b.setStyle(active
                ? "-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 20; -fx-padding: 6 14;"
                : "-fx-background-color: #FFFFFF; -fx-text-fill: #475569; -fx-border-color: #E2E8F0; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 6 14;");
        return b;
    }

    private void renderNews() {
        newsContainer.getChildren().clear();

        for (NewsItem n : newsList) {
            VBox card = new VBox(14);
            card.getStyleClass().add("bento-card");

            if (n.isPinned()) {
                card.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #38BDF8; -fx-border-width: 2; -fx-border-radius: 22; -fx-background-radius: 22; -fx-padding: 22;");
            }

            // Top meta
            HBox top = new HBox(10);
            top.setAlignment(Pos.CENTER_LEFT);

            if (n.isPinned()) {
                Label pinned = new Label("📌 ACTUALITÉ OFFICIELLE ÉPINGLÉE");
                pinned.setStyle("-fx-background-color: #0284C7; -fx-text-fill: white; -fx-font-weight: 800; -fx-font-size: 10px; -fx-padding: 4 10; -fx-background-radius: 10;");
                top.getChildren().add(pinned);
            }

            Label cat = new Label(n.getCategory());
            cat.getStyleClass().addAll("pill-badge", "pill-blue");
            top.getChildren().add(cat);

            Region sp = new Region();
            HBox.setHgrow(sp, Priority.ALWAYS);

            Label date = new Label(n.getDate() + " · " + n.getAuthor());
            date.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B; -fx-font-weight: 600;");
            top.getChildren().addAll(sp, date);

            // Title
            Label title = new Label(n.getTitle());
            title.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");
            title.setWrapText(true);

            // Image if present
            if (n.getImagePath() != null) {
                try {
                    var url = getClass().getResource(n.getImagePath());
                    if (url != null) {
                        ImageView iv = new ImageView(new Image(url.toExternalForm(), 600, 220, true, true));
                        iv.setFitWidth(550);
                        iv.setPreserveRatio(true);
                        iv.setStyle("-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 2);");
                        card.getChildren().add(iv);
                    }
                } catch (Exception ignored) {}
            }

            // Content
            Label content = new Label(n.getContent());
            content.setStyle("-fx-font-size: 13.5px; -fx-text-fill: #334155; -fx-line-spacing: 4;");
            content.setWrapText(true);

            // Actions
            HBox actions = new HBox(12);
            actions.setAlignment(Pos.CENTER_LEFT);
            Button readMoreBtn = new Button("Lire l'annonce intégrale");
            readMoreBtn.getStyleClass().add("btn-primary");
            Button shareBtn = new Button("Partager l'actualité");
            shareBtn.getStyleClass().add("btn-secondary");

            actions.getChildren().addAll(readMoreBtn, shareBtn);

            card.getChildren().addAll(top, title, content, actions);
            newsContainer.getChildren().add(card);
        }
    }

    private void showPublishDialog() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Publier une Actualité Officielle — UniFlow Campus");
        dialog.setHeaderText("Diffuser une annonce aux étudiants et enseignants");

        VBox form = new VBox(10);
        form.setPadding(new Insets(20));

        TextField titleField = new TextField();
        titleField.setPromptText("Titre de l'actualité");

        ComboBox<String> catBox = new ComboBox<>();
        catBox.getItems().addAll("Annonces", "Pédagogie", "Vie de campus", "Bourse", "Événements");
        catBox.setValue("Annonces");

        TextArea contentArea = new TextArea();
        contentArea.setPromptText("Texte de l'annonce officielle...");
        contentArea.setPrefRowCount(6);

        CheckBox pinBox = new CheckBox("Épingler cette actualité en tête");
        pinBox.setSelected(true);

        form.getChildren().addAll(
                new Label("Titre :"), titleField,
                new Label("Catégorie :"), catBox,
                new Label("Contenu :"), contentArea,
                pinBox
        );

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.showAndWait().ifPresent(btn -> {
            if (btn == ButtonType.OK && !titleField.getText().trim().isEmpty()) {
                newsList.add(0, new NewsItem(
                        "n_" + System.currentTimeMillis(),
                        titleField.getText().trim(),
                        catBox.getValue(),
                        contentArea.getText().trim(),
                        "Administration Centrale",
                        "À l'instant",
                        "/images/about_campus_hero.png",
                        pinBox.isSelected(),
                        null
                ));
                renderNews();
            }
        });
    }
}
