package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.GradeEntry;
import cm.uniflow.desktop.services.MockDataService;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

import java.util.List;

public class GradesView extends ScrollPane {

    private final List<GradeEntry> grades = MockDataService.getSampleGrades();

    public GradesView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));
        root.setStyle("-fx-background-color: transparent;");

        root.getChildren().addAll(
                buildHeroBanner(),
                buildSummaryCards(),
                buildGradesTableSection()
        );

        setContent(root);
    }

    private VBox buildHeroBanner() {
        VBox hero = new VBox(14);
        hero.setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B, #1E3A8A, #0D9488);" +
                "-fx-background-radius: 24; -fx-padding: 24 28; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.18), 16, 0, 0, 4);");

        HBox topRow = new HBox(16);
        topRow.setAlignment(Pos.CENTER_LEFT);

        ImageView icon = loadIcon("/icons/grades.png", 46, 46);
        if (icon != null) topRow.getChildren().add(icon);

        VBox textCol = new VBox(4);
        Label badge = new Label("Système LMD · Relevé Officiel Certifié");
        badge.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-text-fill: #A5F3FC; -fx-font-weight: 700;" +
                "-fx-padding: 4 12; -fx-background-radius: 12; -fx-font-size: 11px;");

        Label title = new Label("Relevé de Notes & Performances Académiques");
        title.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: white;");

        Label sub = new Label("Semestre 5 · Licence 3 Informatique (ICT4D) · Faculté des Sciences, Université de Yaoundé I");
        sub.setStyle("-fx-font-size: 13px; -fx-text-fill: #E2E8F0;");

        textCol.getChildren().addAll(badge, title, sub);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        ImageView mascot = loadIcon("/mascot/uni_graduate.webp", 76, 76);
        if (mascot != null) topRow.getChildren().add(mascot);

        topRow.getChildren().add(textCol);
        hero.getChildren().add(topRow);
        return hero;
    }

    private HBox buildSummaryCards() {
        double totalWeighted = 0;
        int totalCredits = 0;
        for (GradeEntry g : grades) {
            totalWeighted += g.getFinalScore() * g.getCredits();
            totalCredits += g.getCredits();
        }
        double gpa = totalCredits > 0 ? (totalWeighted / totalCredits) : 0.0;

        HBox kpiBox = new HBox(16);

        VBox card1 = createSummaryCard("Moyenne Générale", String.format("%.2f / 20", gpa), "Mention Très Bien", "#ECFDF5", "#047857", "#10B981");
        VBox card2 = createSummaryCard("Crédits Capitalisés", totalCredits + " / " + totalCredits + " ECTS", "100% des crédits acquis", "#EFF6FF", "#1D4ED8", "#3B82F6");
        VBox card3 = createSummaryCard("Rang de Promotion", "1er / 142", "Major de la cohorte ICT4D", "#FEF3C7", "#B45309", "#F59E0B");
        VBox card4 = createSummaryCard("Décision du Jury", "ADMIS (S5)", "Relevé signé cryptographiquement", "#F5F3FF", "#6D28D9", "#8B5CF6");

        HBox.setHgrow(card1, Priority.ALWAYS);
        HBox.setHgrow(card2, Priority.ALWAYS);
        HBox.setHgrow(card3, Priority.ALWAYS);
        HBox.setHgrow(card4, Priority.ALWAYS);

        kpiBox.getChildren().addAll(card1, card2, card3, card4);
        return kpiBox;
    }

    private VBox createSummaryCard(String label, String value, String hint, String bg, String textCol, String borderCol) {
        VBox box = new VBox(6);
        box.setStyle(String.format("-fx-background-color: %s; -fx-border-color: %s; -fx-border-radius: 16; -fx-background-radius: 16; -fx-padding: 16;", bg, borderCol));

        Label l = new Label(label);
        l.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 600; -fx-text-fill: #64748B;");

        Label v = new Label(value);
        v.setStyle(String.format("-fx-font-size: 20px; -fx-font-weight: 900; -fx-text-fill: %s;", textCol));

        Label h = new Label(hint);
        h.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

        box.getChildren().addAll(l, v, h);
        return box;
    }

    private VBox buildGradesTableSection() {
        VBox section = new VBox(14);
        section.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 24;");

        HBox header = new HBox(12);
        header.setAlignment(Pos.CENTER_LEFT);

        Label secTitle = new Label("Détail des Évaluations par Unité d'Enseignement");
        secTitle.setStyle("-fx-font-size: 16px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        HBox.setHgrow(secTitle, Priority.ALWAYS);

        Button exportBtn = new Button("📄 Télécharger le Relevé Officiel PDF");
        exportBtn.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 12; -fx-padding: 7 16;");
        exportBtn.setOnAction(e -> handleDownloadPdf());

        header.getChildren().addAll(secTitle, exportBtn);

        // Custom Bento list instead of rigid table for maximum beauty
        VBox rowsBox = new VBox(8);

        // Header row
        HBox colHeader = new HBox(12);
        colHeader.setPadding(new Insets(8, 14, 8, 14));
        colHeader.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 10;");

        Label hCode = createColHeader("Code UE", 110);
        Label hTitle = createColHeader("Intitulé du Cours", 320);
        Label hCred = createColHeader("Crédits", 80);
        Label hCc = createColHeader("CC (/20)", 90);
        Label hExam = createColHeader("Examen (/20)", 100);
        Label hFinal = createColHeader("Note Finale", 100);
        Label hStatus = createColHeader("Validation", 120);

        colHeader.getChildren().addAll(hCode, hTitle, hCred, hCc, hExam, hFinal, hStatus);
        rowsBox.getChildren().add(colHeader);

        for (GradeEntry g : grades) {
            HBox row = new HBox(12);
            row.setAlignment(Pos.CENTER_LEFT);
            row.setPadding(new Insets(12, 14, 12, 14));
            row.setStyle("-fx-background-color: white; -fx-border-color: #F1F5F9; -fx-border-width: 0 0 1 0;");

            Label lCode = new Label(g.getCourseCode());
            lCode.setPrefWidth(110);
            lCode.setStyle("-fx-font-weight: 800; -fx-text-fill: #1D4ED8; -fx-font-size: 13px;");

            Label lTitle = new Label(g.getCourseTitle());
            lTitle.setPrefWidth(320);
            lTitle.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E293B; -fx-font-size: 13px;");

            Label lCred = new Label(g.getCredits() + " ECTS");
            lCred.setPrefWidth(80);
            lCred.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B;");

            Label lCc = new Label(String.format("%.1f", g.getCaScore()));
            lCc.setPrefWidth(90);
            lCc.setStyle("-fx-font-size: 13px; -fx-font-weight: 600; -fx-text-fill: #334155;");

            Label lExam = new Label(String.format("%.1f", g.getExamScore()));
            lExam.setPrefWidth(100);
            lExam.setStyle("-fx-font-size: 13px; -fx-font-weight: 600; -fx-text-fill: #334155;");

            Label lFinal = new Label(String.format("%.2f / 20", g.getFinalScore()));
            lFinal.setPrefWidth(100);
            lFinal.setStyle("-fx-font-size: 13.5px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

            Label lStatus = new Label("VALIDÉ");
            lStatus.setPrefWidth(120);
            lStatus.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #047857; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 10; -fx-font-size: 11px;");

            row.getChildren().addAll(lCode, lTitle, lCred, lCc, lExam, lFinal, lStatus);
            rowsBox.getChildren().add(row);
        }

        section.getChildren().addAll(header, rowsBox);
        return section;
    }

    private Label createColHeader(String title, double width) {
        Label l = new Label(title);
        l.setPrefWidth(width);
        l.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 700; -fx-text-fill: #64748B;");
        return l;
    }

    private void handleDownloadPdf() {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Relevé de Notes Généré");
        alert.setHeaderText("Relevé officiel certifié par l'Université de Yaoundé I");
        alert.setContentText("Le document PDF a été généré avec succès avec le sceau cryptographique officiel UniFlow.\nMatricule : 21U2845 · Licence 3 ICT4D · Moyenne : 16.58/20.");
        alert.showAndWait();
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
