package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.PaymentItem;
import cm.uniflow.desktop.services.MockDataService;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

import java.util.List;

public class PaymentsView extends ScrollPane {

    private final List<PaymentItem> payments = MockDataService.getSamplePayments();

    public PaymentsView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));
        root.setStyle("-fx-background-color: transparent;");

        root.getChildren().addAll(
                buildHeroBanner(),
                buildSummaryCards(),
                buildPaymentActionsSection(),
                buildHistorySection()
        );

        setContent(root);
    }

    private VBox buildHeroBanner() {
        VBox hero = new VBox(14);
        hero.setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B, #1E3A8A, #0D9488);" +
                "-fx-background-radius: 24; -fx-padding: 24 28; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.18), 16, 0, 0, 4);");

        HBox topRow = new HBox(16);
        topRow.setAlignment(Pos.CENTER_LEFT);

        ImageView icon = loadIcon("/icons/paiements.png", 46, 46);
        if (icon != null) topRow.getChildren().add(icon);

        VBox textCol = new VBox(4);
        Label badge = new Label("Trésorerie Universitaire · Faculté des Sciences");
        badge.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-text-fill: #A5F3FC; -fx-font-weight: 700;" +
                "-fx-padding: 4 12; -fx-background-radius: 12; -fx-font-size: 11px;");

        Label title = new Label("Scolarité, Droits Universitaires & Bourses");
        title.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: white;");

        Label sub = new Label("Paiement sécurisé via Mobile Money (MTN & Orange), quitus de scolarité et suivi des bourses d'excellence.");
        sub.setStyle("-fx-font-size: 13px; -fx-text-fill: #E2E8F0;");

        textCol.getChildren().addAll(badge, title, sub);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        ImageView bourses = loadIcon("/icons/bourses.png", 64, 64);
        if (bourses != null) topRow.getChildren().add(bourses);

        topRow.getChildren().add(textCol);
        hero.getChildren().add(topRow);
        return hero;
    }

    private HBox buildSummaryCards() {
        HBox kpiBox = new HBox(16);

        VBox card1 = createSummaryCard("Frais d'Inscription", "50 000 FCFA", "Année 2026/2027", "#EFF6FF", "#1D4ED8", "#3B82F6");
        VBox card2 = createSummaryCard("Montant Réglé", "50 000 FCFA", "100% de la scolarité", "#ECFDF5", "#047857", "#10B981");
        VBox card3 = createSummaryCard("Reste à Payer", "0 FCFA", "Situation financière régularisée", "#F8FAFC", "#0F172A", "#CBD5E1");
        VBox card4 = createSummaryCard("Quitus Académique", "DÉLIVRÉ ✓", "Accès examens & bornes validé", "#ECFDF5", "#047857", "#10B981");

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

    private HBox buildPaymentActionsSection() {
        HBox box = new HBox(16);

        // Mobile Money Simulator Card
        VBox momoCard = new VBox(12);
        momoCard.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 18; -fx-background-radius: 18; -fx-padding: 20;");
        HBox.setHgrow(momoCard, Priority.ALWAYS);

        Label momoTitle = new Label("Paiement Direct par Mobile Money");
        momoTitle.setStyle("-fx-font-size: 15px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label momoDesc = new Label("Réglez vos droits de scolarité, attestations ou duplicata de carte par MTN MoMo ou Orange Money.");
        momoDesc.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B;");

        HBox inputs = new HBox(10);
        inputs.setAlignment(Pos.CENTER_LEFT);

        ComboBox<String> opCombo = new ComboBox<>();
        opCombo.getItems().addAll("MTN Mobile Money (*126#)", "Orange Money (*150#)");
        opCombo.setValue(opCombo.getItems().get(0));
        opCombo.setStyle("-fx-background-radius: 10; -fx-pref-width: 220;");

        TextField phoneField = new TextField();
        phoneField.setPromptText("+237 6...");
        phoneField.setStyle("-fx-background-radius: 10; -fx-pref-width: 160;");

        Button payBtn = new Button("Initier le paiement sécurisé");
        payBtn.setStyle("-fx-background-color: #F59E0B; -fx-text-fill: #78350F; -fx-font-weight: 900; -fx-background-radius: 10; -fx-padding: 8 16;");
        payBtn.setOnAction(e -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Demande de Paiement Émise");
            alert.setHeaderText("Notification Push USSD envoyée");
            alert.setContentText("Veuillez valider le débit sur votre téléphone en composant votre code secret Mobile Money.");
            alert.showAndWait();
        });

        inputs.getChildren().addAll(opCombo, phoneField, payBtn);
        momoCard.getChildren().addAll(momoTitle, momoDesc, inputs);

        // Bourse Card
        VBox bourseCard = new VBox(10);
        bourseCard.setStyle("-fx-background-color: linear-gradient(to bottom right, #FEF3C7, #FFFBEB); -fx-border-color: #FDE68A; -fx-border-radius: 18; -fx-background-radius: 18; -fx-padding: 20;");
        bourseCard.setPrefWidth(380);

        Label bTitle = new Label("🎓 Bourse d'Excellence Numérique 2026");
        bTitle.setStyle("-fx-font-size: 14.5px; -fx-font-weight: 800; -fx-text-fill: #92400E;");

        Label bDesc = new Label("Votre dossier a été validé par la commission ministérielle. Allocation semestrielle de 100 000 FCFA créditée.");
        bDesc.setStyle("-fx-font-size: 12px; -fx-text-fill: #78350F;");
        bDesc.setWrapText(true);

        Label bStatus = new Label("ATTRIBUTION EN COURS · CRÉDIT NOVEMBRE");
        bStatus.setStyle("-fx-background-color: white; -fx-text-fill: #B45309; -fx-font-weight: 800; -fx-padding: 4 10; -fx-background-radius: 10; -fx-font-size: 10.5px;");

        bourseCard.getChildren().addAll(bTitle, bDesc, bStatus);

        box.getChildren().addAll(momoCard, bourseCard);
        return box;
    }

    private VBox buildHistorySection() {
        VBox section = new VBox(14);
        section.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 24;");

        HBox header = new HBox(12);
        header.setAlignment(Pos.CENTER_LEFT);

        Label secTitle = new Label("Historique des Versements & Quitus Délivrés");
        secTitle.setStyle("-fx-font-size: 16px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        HBox.setHgrow(secTitle, Priority.ALWAYS);

        Button quitusBtn = new Button("📄 Télécharger le Quitus Général");
        quitusBtn.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 12; -fx-padding: 7 16;");
        quitusBtn.setOnAction(e -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Quitus de Scolarité");
            alert.setHeaderText("Quitus Académique Officiel 2026/2027");
            alert.setContentText("Le quitus officiel certifiant que l'étudiant 21U2845 est totalement en règle pour l'année en cours a été généré.");
            alert.showAndWait();
        });

        header.getChildren().addAll(secTitle, quitusBtn);

        VBox rows = new VBox(8);

        // Header Row
        HBox head = new HBox(12);
        head.setPadding(new Insets(8, 14, 8, 14));
        head.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 10;");

        Label hRef = createColHeader("Référence", 140);
        Label hLabel = createColHeader("Description de l'Opération", 300);
        Label hDate = createColHeader("Date de Règlement", 150);
        Label hMethod = createColHeader("Moyen de Paiement", 160);
        Label hAmt = createColHeader("Montant", 120);
        Label hStat = createColHeader("Statut", 110);
        Label hRec = createColHeader("Reçu", 100);

        head.getChildren().addAll(hRef, hLabel, hDate, hMethod, hAmt, hStat, hRec);
        rows.getChildren().add(head);

        for (PaymentItem p : payments) {
            HBox row = new HBox(12);
            row.setAlignment(Pos.CENTER_LEFT);
            row.setPadding(new Insets(10, 14, 10, 14));
            row.setStyle("-fx-background-color: white; -fx-border-color: #F1F5F9; -fx-border-width: 0 0 1 0;");

            Label lRef = new Label(p.getReference());
            lRef.setPrefWidth(140);
            lRef.setStyle("-fx-font-family: monospace; -fx-font-weight: 700; -fx-text-fill: #1D4ED8; -fx-font-size: 12px;");

            Label lLabel = new Label(p.getLabel());
            lLabel.setPrefWidth(300);
            lLabel.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E293B; -fx-font-size: 13px;");

            Label lDate = new Label(p.getDate());
            lDate.setPrefWidth(150);
            lDate.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B;");

            Label lMethod = new Label(p.getMethod());
            lMethod.setPrefWidth(160);
            lMethod.setStyle("-fx-font-size: 12px; -fx-text-fill: #475569; -fx-font-weight: 600;");

            Label lAmt = new Label(String.format("%,d FCFA", p.getAmount()));
            lAmt.setPrefWidth(120);
            lAmt.setStyle("-fx-font-size: 13.5px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

            Label lStat = new Label("PAYÉ");
            lStat.setPrefWidth(110);
            lStat.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #047857; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 10; -fx-font-size: 11px;");

            Button recBtn = new Button("Reçu PDF");
            recBtn.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-weight: 700; -fx-background-radius: 8; -fx-padding: 4 10; -fx-font-size: 11px;");
            recBtn.setOnAction(e -> {
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle("Téléchargement du Reçu");
                alert.setHeaderText("Reçu : " + p.getReference());
                alert.setContentText("Le reçu officiel pour " + p.getLabel() + " (" + String.format("%,d FCFA", p.getAmount()) + ") a été téléchargé.");
                alert.showAndWait();
            });

            row.getChildren().addAll(lRef, lLabel, lDate, lMethod, lAmt, lStat, recBtn);
            rows.getChildren().add(row);
        }

        section.getChildren().addAll(header, rows);
        return section;
    }

    private Label createColHeader(String title, double width) {
        Label l = new Label(title);
        l.setPrefWidth(width);
        l.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 700; -fx-text-fill: #64748B;");
        return l;
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
