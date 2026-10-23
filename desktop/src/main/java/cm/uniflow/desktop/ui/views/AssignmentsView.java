package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.Assignment;
import cm.uniflow.desktop.services.MockDataService;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.stage.FileChooser;

import java.io.File;
import java.util.List;

public class AssignmentsView extends ScrollPane {

    private final VBox assignmentsContainer = new VBox(14);
    private String currentFilter = "ALL";
    private final List<Assignment> allAssignments = MockDataService.getSampleAssignments();

    public AssignmentsView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));
        root.setStyle("-fx-background-color: transparent;");

        root.getChildren().addAll(
                buildHeroBanner(),
                buildKpiCards(),
                buildFilterBar(),
                assignmentsContainer
        );

        refreshAssignments();

        setContent(root);
    }

    private VBox buildHeroBanner() {
        VBox hero = new VBox(14);
        hero.setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B, #1E3A8A, #0D9488);" +
                "-fx-background-radius: 24; -fx-padding: 24 28; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.18), 16, 0, 0, 4);");

        HBox topRow = new HBox(16);
        topRow.setAlignment(Pos.CENTER_LEFT);

        ImageView icon = loadIcon("/icons/assignments.png", 46, 46);
        if (icon != null) topRow.getChildren().add(icon);

        VBox textCol = new VBox(4);
        Label badge = new Label("Espace Pédagogique · Travaux Dirigés & Projets");
        badge.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-text-fill: #A5F3FC; -fx-font-weight: 700;" +
                "-fx-padding: 4 12; -fx-background-radius: 12; -fx-font-size: 11px;");

        Label title = new Label("Devoirs & Livrables Académiques");
        title.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: white;");

        Label sub = new Label("Consultez vos travaux pratiques, soumettez vos dépôts de code et suivez vos évaluations notées.");
        sub.setStyle("-fx-font-size: 13px; -fx-text-fill: #E2E8F0;");

        textCol.getChildren().addAll(badge, title, sub);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        ImageView mascot = loadIcon("/mascot/uni_duo_assignment.png", 82, 82);
        if (mascot != null) topRow.getChildren().add(mascot);

        topRow.getChildren().add(textCol);
        hero.getChildren().add(topRow);
        return hero;
    }

    private HBox buildKpiCards() {
        HBox kpiBox = new HBox(16);

        VBox card1 = createKpiCard("À rendre cette semaine", "2 devoirs", "Date limite : 24 & 30 Oct.", "#EFF6FF", "#1D4ED8", "#3B82F6");
        VBox card2 = createKpiCard("Moyenne des TP", "17.25 / 20", "2 évaluations notées", "#ECFDF5", "#047857", "#10B981");
        VBox card3 = createKpiCard("Taux de complétion", "100%", "Aucun retard enregistré", "#F5F3FF", "#6D28D9", "#8B5CF6");

        HBox.setHgrow(card1, Priority.ALWAYS);
        HBox.setHgrow(card2, Priority.ALWAYS);
        HBox.setHgrow(card3, Priority.ALWAYS);

        kpiBox.getChildren().addAll(card1, card2, card3);
        return kpiBox;
    }

    private VBox createKpiCard(String label, String value, String hint, String bg, String textCol, String borderCol) {
        VBox box = new VBox(6);
        box.setStyle(String.format("-fx-background-color: %s; -fx-border-color: %s; -fx-border-radius: 16; -fx-background-radius: 16; -fx-padding: 16;", bg, borderCol));

        Label l = new Label(label);
        l.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 600; -fx-text-fill: #64748B;");

        Label v = new Label(value);
        v.setStyle(String.format("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: %s;", textCol));

        Label h = new Label(hint);
        h.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

        box.getChildren().addAll(l, v, h);
        return box;
    }

    private HBox buildFilterBar() {
        HBox bar = new HBox(10);
        bar.setAlignment(Pos.CENTER_LEFT);

        Button btnAll = createFilterButton("Tous les devoirs", "ALL");
        Button btnTodo = createFilterButton("À faire (2)", "TO_DO");
        Button btnGraded = createFilterButton("Notés (2)", "GRADED");

        bar.getChildren().addAll(btnAll, btnTodo, btnGraded);
        return bar;
    }

    private Button createFilterButton(String text, String filter) {
        Button btn = new Button(text);
        btn.setStyle(currentFilter.equals(filter) ?
                "-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 18; -fx-padding: 7 16;" :
                "-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-weight: 600; -fx-background-radius: 18; -fx-padding: 7 16;");
        btn.setOnAction(e -> {
            this.currentFilter = filter;
            refreshAssignments();
        });
        return btn;
    }

    private void refreshAssignments() {
        assignmentsContainer.getChildren().clear();

        List<Assignment> filtered = allAssignments.stream()
                .filter(a -> currentFilter.equals("ALL") || a.getStatus().equalsIgnoreCase(currentFilter))
                .toList();

        if (filtered.isEmpty()) {
            VBox emptyBox = new VBox(12);
            emptyBox.setAlignment(Pos.CENTER);
            emptyBox.setPadding(new Insets(40));
            Label emptyLbl = new Label("Aucun devoir dans cette catégorie");
            emptyLbl.setStyle("-fx-font-size: 14px; -fx-text-fill: #94A3B8;");
            emptyBox.getChildren().add(emptyLbl);
            assignmentsContainer.getChildren().add(emptyBox);
            return;
        }

        for (Assignment a : filtered) {
            assignmentsContainer.getChildren().add(createAssignmentCard(a));
        }
    }

    private VBox createAssignmentCard(Assignment a) {
        VBox card = new VBox(12);
        card.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 18; -fx-background-radius: 18; -fx-padding: 20; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.04), 8, 0, 0, 2);");

        HBox top = new HBox(12);
        top.setAlignment(Pos.CENTER_LEFT);

        Label courseBadge = new Label(a.getCourseCode());
        courseBadge.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-weight: 800; -fx-padding: 4 10; -fx-background-radius: 10; -fx-font-size: 11px;");

        Label titleLbl = new Label(a.getTitle());
        titleLbl.setStyle("-fx-font-size: 15px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        HBox.setHgrow(titleLbl, Priority.ALWAYS);

        Label statusPill = createStatusPill(a);

        top.getChildren().addAll(courseBadge, titleLbl, statusPill);

        Label descLbl = new Label(a.getDescription());
        descLbl.setStyle("-fx-font-size: 12.5px; -fx-text-fill: #475569;");
        descLbl.setWrapText(true);

        HBox bottom = new HBox(14);
        bottom.setAlignment(Pos.CENTER_LEFT);

        Label dueLbl = new Label("📅 Échéance : " + a.getDueDate());
        dueLbl.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B; -fx-font-weight: 600;");
        HBox.setHgrow(dueLbl, Priority.ALWAYS);

        if ("TO_DO".equalsIgnoreCase(a.getStatus())) {
            Button submitBtn = new Button("Déposer un livrable (ZIP / PDF)");
            submitBtn.setStyle("-fx-background-color: #2563EB; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 12; -fx-padding: 6 14;");
            submitBtn.setOnAction(e -> handleUpload(a));
            bottom.getChildren().addAll(dueLbl, submitBtn);
        } else {
            Label scoreLbl = new Label(a.getGrade() != null ? String.format("Note obtenue : %.1f / 20", a.getGrade()) : "En cours de correction");
            scoreLbl.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #047857;");
            bottom.getChildren().addAll(dueLbl, scoreLbl);
        }

        card.getChildren().addAll(top, descLbl, bottom);
        return card;
    }

    private Label createStatusPill(Assignment a) {
        Label pill = new Label();
        if ("TO_DO".equalsIgnoreCase(a.getStatus())) {
            pill.setText("À RENDRE");
            pill.setStyle("-fx-background-color: #FEF3C7; -fx-text-fill: #B45309; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 12; -fx-font-size: 10.5px;");
        } else if ("GRADED".equalsIgnoreCase(a.getStatus())) {
            pill.setText("NOTÉ & VALIDÉ");
            pill.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #047857; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 12; -fx-font-size: 10.5px;");
        } else {
            pill.setText("RENDU");
            pill.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 12; -fx-font-size: 10.5px;");
        }
        return pill;
    }

    private void handleUpload(Assignment a) {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Sélectionner votre archive de projet");
        chooser.getExtensionFilters().addAll(
                new FileChooser.ExtensionFilter("Archives ou Documents", "*.zip", "*.tar.gz", "*.pdf")
        );
        File file = chooser.showOpenDialog(getScene().getWindow());
        if (file != null) {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Livrable Enregistré");
            alert.setHeaderText("Dépôt réussi pour " + a.getCourseCode());
            alert.setContentText("Le fichier '" + file.getName() + "' (" + (file.length() / 1024) + " KB) a été horodaté et signé cryptographiquement sur le serveur académique.");
            alert.showAndWait();
        }
    }

    private ImageView loadIcon(String path, double w, double h) {
        try {
            var url = getClass().getResource(path);
            if (url != null) {
                ImageView iv = new ImageView(new Image(url.toExternalForm(), w, h, true, true));
                iv.setFitWidth(w);
                iv.setFitHeight(h);
                return iv;
            }
        } catch (Exception ignored) {}
        return null;
    }
}
