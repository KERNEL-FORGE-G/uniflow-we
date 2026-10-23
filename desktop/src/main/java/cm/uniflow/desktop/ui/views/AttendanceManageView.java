package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.services.MockDataService;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

import java.util.ArrayList;
import java.util.List;

public class AttendanceManageView extends ScrollPane {

    public static class StudentRoll {
        String id;
        String matricule;
        String name;
        String status; // PRESENT, LATE, ABSENT
        String time;

        public StudentRoll(String id, String matricule, String name, String status, String time) {
            this.id = id;
            this.matricule = matricule;
            this.name = name;
            this.status = status;
            this.time = time;
        }
    }

    private final ObservableList<StudentRoll> studentList = FXCollections.observableArrayList();
    private final Label presentCountLbl = new Label("42");
    private final Label lateCountLbl = new Label("2");
    private final Label absentCountLbl = new Label("1");
    private final Label rateLbl = new Label("95.5%");

    public AttendanceManageView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        initSampleStudents();

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));
        root.setStyle("-fx-background-color: transparent;");

        root.getChildren().addAll(
                buildHeroBanner(),
                buildSessionSelector(),
                buildMetricsSection(),
                buildRollCallSection()
        );

        setContent(root);
    }

    private void initSampleStudents() {
        studentList.add(new StudentRoll("1", "21U2845", "Nghomsi Ravel", "PRESENT", "08:02"));
        studentList.add(new StudentRoll("2", "21U2410", "Fosso Audrey", "PRESENT", "08:04"));
        studentList.add(new StudentRoll("3", "21U2991", "Kamdem Cedric", "PRESENT", "08:05"));
        studentList.add(new StudentRoll("4", "21U2102", "Tchinda Vanessa", "LATE", "08:21"));
        studentList.add(new StudentRoll("5", "21U2334", "Ndongo Fabrice", "PRESENT", "08:07"));
        studentList.add(new StudentRoll("6", "21U2558", "Biya Emmanuel", "ABSENT", "-"));
        studentList.add(new StudentRoll("7", "21U2670", "Manga Kevin", "PRESENT", "08:01"));
        studentList.add(new StudentRoll("8", "21U2801", "Kouam Brenda", "PRESENT", "08:10"));
    }

    private VBox buildHeroBanner() {
        VBox hero = new VBox(14);
        hero.setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B, #1E3A8A, #0D9488);" +
                "-fx-background-radius: 24; -fx-padding: 24 28; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.18), 16, 0, 0, 4);");

        HBox topRow = new HBox(16);
        topRow.setAlignment(Pos.CENTER_LEFT);

        ImageView icon = loadIcon("/icons/coordination.png", 46, 46);
        if (icon != null) topRow.getChildren().add(icon);

        VBox textCol = new VBox(4);
        Label badge = new Label("Module Délégué & Enseignant · Émargement Digital");
        badge.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-text-fill: #A5F3FC; -fx-font-weight: 700;" +
                "-fx-padding: 4 12; -fx-background-radius: 12; -fx-font-size: 11px;");

        Label title = new Label("Registre d'Émargement & Feuille d'Appel");
        title.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: white;");

        Label sub = new Label("Supervisez la présence en temps réel, validez les émargements par scan QR et signez la feuille officielle.");
        sub.setStyle("-fx-font-size: 13px; -fx-text-fill: #E2E8F0;");

        textCol.getChildren().addAll(badge, title, sub);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        ImageView mascot = loadIcon("/mascot/uni_duo_qr_scan.png", 76, 76);
        if (mascot != null) topRow.getChildren().add(mascot);

        topRow.getChildren().add(textCol);
        hero.getChildren().add(topRow);
        return hero;
    }

    private HBox buildSessionSelector() {
        HBox bar = new HBox(14);
        bar.setAlignment(Pos.CENTER_LEFT);
        bar.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 16; -fx-background-radius: 16; -fx-padding: 14 20;");

        Label lbl = new Label("Séance active :");
        lbl.setStyle("-fx-font-weight: 800; -fx-font-size: 13px; -fx-text-fill: #0F172A;");

        ComboBox<String> combo = new ComboBox<>();
        combo.getItems().addAll(
                "INF3055 · Génie Logiciel (Aujourd'hui 08h00 - 11h00 · Amphi 250)",
                "INF3075 · Intelligence Artificielle (Mardi 09h00 - 12h00 · Amphi 350)",
                "INF3095 · Cryptographie & Sécurité (Mercredi 08h00 - 11h00 · Lab C204)"
        );
        combo.setValue(combo.getItems().get(0));
        combo.setStyle("-fx-background-radius: 10; -fx-pref-width: 480;");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button signBtn = new Button("🔒 Clôturer & Signer la Séance");
        signBtn.setStyle("-fx-background-color: #047857; -fx-text-fill: white; -fx-font-weight: 800; -fx-background-radius: 12; -fx-padding: 8 16;");
        signBtn.setOnAction(e -> handleSignSession());

        bar.getChildren().addAll(lbl, combo, spacer, signBtn);
        return bar;
    }

    private HBox buildMetricsSection() {
        HBox kpiBox = new HBox(16);

        VBox card1 = createKpiBox("Présents", presentCountLbl, "Scan QR certifié", "#ECFDF5", "#047857", "#10B981");
        VBox card2 = createKpiBox("En retard", lateCountLbl, "Arrivée après 08h15", "#FEF3C7", "#B45309", "#F59E0B");
        VBox card3 = createKpiBox("Absents", absentCountLbl, "Non justifié", "#FEF2F2", "#B91C1C", "#EF4444");
        VBox card4 = createKpiBox("Taux de présence", rateLbl, "Effectif total : 45", "#EFF6FF", "#1D4ED8", "#3B82F6");

        HBox.setHgrow(card1, Priority.ALWAYS);
        HBox.setHgrow(card2, Priority.ALWAYS);
        HBox.setHgrow(card3, Priority.ALWAYS);
        HBox.setHgrow(card4, Priority.ALWAYS);

        kpiBox.getChildren().addAll(card1, card2, card3, card4);
        return kpiBox;
    }

    private VBox createKpiBox(String title, Label valLbl, String hint, String bg, String textCol, String borderCol) {
        VBox box = new VBox(4);
        box.setStyle(String.format("-fx-background-color: %s; -fx-border-color: %s; -fx-border-radius: 16; -fx-background-radius: 16; -fx-padding: 16;", bg, borderCol));

        Label t = new Label(title);
        t.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 600; -fx-text-fill: #64748B;");

        valLbl.setStyle(String.format("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: %s;", textCol));

        Label h = new Label(hint);
        h.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

        box.getChildren().addAll(t, valLbl, h);
        return box;
    }

    private VBox buildRollCallSection() {
        VBox section = new VBox(14);
        section.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 24;");

        HBox header = new HBox(12);
        header.setAlignment(Pos.CENTER_LEFT);

        Label secTitle = new Label("Appel Nominal & Liste des Étudiants");
        secTitle.setStyle("-fx-font-size: 16px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        HBox.setHgrow(secTitle, Priority.ALWAYS);

        Button exportBtn = new Button("📄 Exporter Feuille de Présence PDF");
        exportBtn.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 12; -fx-padding: 7 16;");
        exportBtn.setOnAction(e -> handleExportPdf());

        header.getChildren().addAll(secTitle, exportBtn);

        VBox listContainer = new VBox(8);

        // Header Row
        HBox head = new HBox(12);
        head.setPadding(new Insets(8, 14, 8, 14));
        head.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 10;");

        Label hMat = new Label("Matricule");
        hMat.setPrefWidth(120);
        hMat.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #64748B;");

        Label hName = new Label("Nom & Prénom de l'Étudiant");
        hName.setPrefWidth(280);
        hName.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #64748B;");

        Label hTime = new Label("Heure de Scan");
        hTime.setPrefWidth(120);
        hTime.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #64748B;");

        Label hStat = new Label("Statut d'Émargement");
        hStat.setPrefWidth(140);
        hStat.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #64748B;");

        Label hActions = new Label("Action Manuelle");
        hActions.setPrefWidth(200);
        hActions.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #64748B;");

        head.getChildren().addAll(hMat, hName, hTime, hStat, hActions);
        listContainer.getChildren().add(head);

        for (StudentRoll s : studentList) {
            listContainer.getChildren().add(createStudentRow(s));
        }

        section.getChildren().addAll(header, listContainer);
        return section;
    }

    private HBox createStudentRow(StudentRoll s) {
        HBox row = new HBox(12);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setPadding(new Insets(10, 14, 10, 14));
        row.setStyle("-fx-background-color: white; -fx-border-color: #F1F5F9; -fx-border-width: 0 0 1 0;");

        Label matLbl = new Label(s.matricule);
        matLbl.setPrefWidth(120);
        matLbl.setStyle("-fx-font-weight: 700; -fx-text-fill: #1D4ED8; -fx-font-size: 12.5px;");

        Label nameLbl = new Label(s.name);
        nameLbl.setPrefWidth(280);
        nameLbl.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E293B; -fx-font-size: 13px;");

        Label timeLbl = new Label(s.time);
        timeLbl.setPrefWidth(120);
        timeLbl.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B;");

        Label statusPill = new Label();
        statusPill.setPrefWidth(140);
        updateStatusPill(statusPill, s.status);

        HBox actions = new HBox(6);
        actions.setPrefWidth(200);

        Button btnP = new Button("P");
        btnP.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #047857; -fx-font-weight: 800; -fx-padding: 4 10; -fx-background-radius: 8;");
        btnP.setOnAction(e -> {
            s.status = "PRESENT";
            s.time = "08:15";
            timeLbl.setText(s.time);
            updateStatusPill(statusPill, s.status);
            recalculateMetrics();
        });

        Button btnR = new Button("R");
        btnR.setStyle("-fx-background-color: #FEF3C7; -fx-text-fill: #B45309; -fx-font-weight: 800; -fx-padding: 4 10; -fx-background-radius: 8;");
        btnR.setOnAction(e -> {
            s.status = "LATE";
            s.time = "08:25";
            timeLbl.setText(s.time);
            updateStatusPill(statusPill, s.status);
            recalculateMetrics();
        });

        Button btnA = new Button("A");
        btnA.setStyle("-fx-background-color: #FEF2F2; -fx-text-fill: #B91C1C; -fx-font-weight: 800; -fx-padding: 4 10; -fx-background-radius: 8;");
        btnA.setOnAction(e -> {
            s.status = "ABSENT";
            s.time = "-";
            timeLbl.setText(s.time);
            updateStatusPill(statusPill, s.status);
            recalculateMetrics();
        });

        actions.getChildren().addAll(btnP, btnR, btnA);

        row.getChildren().addAll(matLbl, nameLbl, timeLbl, statusPill, actions);
        return row;
    }

    private void updateStatusPill(Label pill, String status) {
        if ("PRESENT".equalsIgnoreCase(status)) {
            pill.setText("PRÉSENT");
            pill.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #047857; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 10; -fx-font-size: 11px;");
        } else if ("LATE".equalsIgnoreCase(status)) {
            pill.setText("EN RETARD");
            pill.setStyle("-fx-background-color: #FEF3C7; -fx-text-fill: #B45309; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 10; -fx-font-size: 11px;");
        } else {
            pill.setText("ABSENT");
            pill.setStyle("-fx-background-color: #FEF2F2; -fx-text-fill: #B91C1C; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 10; -fx-font-size: 11px;");
        }
    }

    private void recalculateMetrics() {
        long p = studentList.stream().filter(s -> "PRESENT".equalsIgnoreCase(s.status)).count();
        long l = studentList.stream().filter(s -> "LATE".equalsIgnoreCase(s.status)).count();
        long a = studentList.stream().filter(s -> "ABSENT".equalsIgnoreCase(s.status)).count();
        presentCountLbl.setText(String.valueOf(p));
        lateCountLbl.setText(String.valueOf(l));
        absentCountLbl.setText(String.valueOf(a));
        double pct = studentList.isEmpty() ? 0 : ((double)(p + l) / studentList.size()) * 100.0;
        rateLbl.setText(String.format("%.1f%%", pct));
    }

    private void handleSignSession() {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Séance Clôturée");
        alert.setHeaderText("Signature Cryptographique Émise");
        alert.setContentText("La feuille d'émargement de INF3055 a été scellée avec le certificat numérique de l'enseignant et du délégué de promotion.");
        alert.showAndWait();
    }

    private void handleExportPdf() {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Export PDF Terminé");
        alert.setHeaderText("Feuille d'émargement officielle prête");
        alert.setContentText("Le document 'Emargement_INF3055_23-10-2026.pdf' contenant les signatures électroniques a été généré.");
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
