package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.models.AttendanceRecord;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.services.MockDataService;
import cm.uniflow.desktop.ui.components.BentoCard;
import cm.uniflow.desktop.ui.components.HeroHeader;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.ImageView;
import javafx.scene.image.PixelWriter;
import javafx.scene.image.WritableImage;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import java.util.List;

public class AttendanceView extends ScrollPane {

    public AttendanceView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        HeroHeader hero = new HeroHeader(
                "Certification Cryptographique de Présence",
                "Émargement & Feuille de Présence",
                "Validation infalsifiable par QR Code dynamique synchronisé avec les bornes Sentinelle IoT",
                "/icons/attendance.png",
                "94.2%", "Taux d'assiduité global",
                "24/25", "Séances validées"
        );
        root.getChildren().add(hero);

        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(40);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(60);
        grid.getColumnConstraints().addAll(col1, col2);

        // Left : Mon Pass QR Personnel dynamique
        VBox qrBox = new VBox(14);
        qrBox.setAlignment(Pos.CENTER);

        User user = AppConfig.getCurrentUser();
        String qrPayload = "UNIFLOW:ATTENDANCE:" + (user != null ? user.getId() : "USR") + ":" + System.currentTimeMillis();
        ImageView qrView = generateQrCodeImageView(qrPayload, 180, 180);

        Label qrTitle = new Label("Pass Numérique Étudiant");
        qrTitle.setStyle("-fx-font-weight: 800; -fx-font-size: 14px; -fx-text-fill: #0F172A;");

        Label qrSub = new Label("Scannez ce QR Code sur la borne Sentinelle IoT ou présentez-le au délégué");
        qrSub.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B; -fx-text-alignment: center;");
        qrSub.setWrapText(true);

        Button refreshBtn = new Button("Régénérer le jeton cryptographique");
        refreshBtn.getStyleClass().add("btn-secondary");

        qrBox.getChildren().addAll(qrView, qrTitle, qrSub, refreshBtn);
        BentoCard qrCard = new BentoCard("Mon QR Code de Présence", "Jeton signé à validité temporaire", qrBox);
        grid.add(qrCard, 0, 0);

        // Right : Registre des présences
        VBox historyList = new VBox(10);
        List<AttendanceRecord> records = MockDataService.getSampleAttendance();
        for (AttendanceRecord r : records) {
            historyList.getChildren().add(createRecordRow(r));
        }

        BentoCard historyCard = new BentoCard(
                "Registre d'Émargement Officiel",
                "Historique certifié par cours et horodatage",
                historyList
        );
        grid.add(historyCard, 1, 0);

        root.getChildren().add(grid);
        setContent(root);
    }

    private HBox createRecordRow(AttendanceRecord r) {
        HBox row = new HBox(12);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 12; -fx-background-radius: 12; -fx-padding: 12;");

        VBox left = new VBox(2);
        HBox.setHgrow(left, Priority.ALWAYS);
        Label title = new Label(r.getCourseCode() + " · " + r.getCourseTitle());
        title.setStyle("-fx-font-weight: 700; -fx-font-size: 13px; -fx-text-fill: #0F172A;");
        Label date = new Label("Date : " + r.getDate() + " à " + r.getTime() + (r.isVerifiedByQr() ? " · Certifié QR ✓" : ""));
        date.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");
        left.getChildren().addAll(title, date);

        Label status = new Label(r.getStatus());
        if ("PRÉSENT".equals(r.getStatus())) {
            status.getStyleClass().addAll("pill-badge", "pill-green");
        } else if ("EN RETARD".equals(r.getStatus())) {
            status.getStyleClass().addAll("pill-badge", "pill-amber");
        } else {
            status.getStyleClass().addAll("pill-badge", "pill-blue");
        }

        row.getChildren().addAll(left, status);
        return row;
    }

    private ImageView generateQrCodeImageView(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
            WritableImage image = new WritableImage(width, height);
            PixelWriter writer = image.getPixelWriter();
            for (int y = 0; y < height; y++) {
                for (int x = 0; x < width; x++) {
                    writer.setColor(x, y, bitMatrix.get(x, y) ? Color.BLACK : Color.WHITE);
                }
            }
            return new ImageView(image);
        } catch (Exception e) {
            return new ImageView();
        }
    }
}
