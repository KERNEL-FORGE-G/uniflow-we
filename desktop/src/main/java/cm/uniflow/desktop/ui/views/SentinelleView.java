package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.ui.components.BentoCard;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

public class SentinelleView extends ScrollPane {

    public SentinelleView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        HeroHeader hero = new HeroHeader(
                "Supervision Edge AI & Bornes Connectées",
                "Sentinelle IoT Campus Intelligence",
                "Télémétrie en temps réel des bornes biométriques, contrôle d'accès aux amphithéâtres et monitoring des salles d'étude",
                "/icons/sentinelle.png",
                "4 Bornes", "Opérationnelles",
                "99.8% Uptime", "Télémétrie VPS active"
        );
        root.getChildren().add(hero);

        // Hardware Schematic Card
        HBox hardwareBox = new HBox(20);
        hardwareBox.setAlignment(Pos.CENTER_LEFT);

        ImageView schematicView = loadImg("/images/sentinelle_hardware_schematic.png", 180, 150);
        VBox desc = new VBox(6);
        Label hwTitle = new Label("Borne Sentinelle Mk.IV · Spécifications Matérielles");
        hwTitle.setStyle("-fx-font-weight: 800; -fx-font-size: 15px; -fx-text-fill: #0F172A;");
        Label hwDesc = new Label("Équipée d'un module cryptographique ESP32-S3, capteur optique biométrique certifié, lecteur QR laser et caméra Edge AI pour l'émargement instantané des étudiants même en cas de coupure Internet.");
        hwDesc.setWrapText(true);
        hwDesc.setStyle("-fx-font-size: 12px; -fx-text-fill: #475569;");

        HBox badges = new HBox(8);
        Label b1 = new Label("Mode 100% Hors-ligne");
        b1.getStyleClass().addAll("pill-badge", "pill-green");
        Label b2 = new Label("Chiffrement AES-256");
        b2.getStyleClass().addAll("pill-badge", "pill-blue");
        badges.getChildren().addAll(b1, b2);

        desc.getChildren().addAll(hwTitle, hwDesc, badges);
        if (schematicView != null) hardwareBox.getChildren().add(schematicView);
        hardwareBox.getChildren().add(desc);

        BentoCard hwCard = new BentoCard("Infrastructure Déployée", "Châssis et contrôleurs physiques présents sur le campus", hardwareBox);
        root.getChildren().add(hwCard);

        // CCTV Monitoring Grid (4 Cameras)
        GridPane cctvGrid = new GridPane();
        cctvGrid.setHgap(16);
        cctvGrid.setVgap(16);
        ColumnConstraints c1 = new ColumnConstraints();
        c1.setPercentWidth(50);
        ColumnConstraints c2 = new ColumnConstraints();
        c2.setPercentWidth(50);
        cctvGrid.getColumnConstraints().addAll(c1, c2);

        cctvGrid.add(createCameraFeedCard("CAM 01 · Salle de Lecture Bibliothèque", "/images/sentinelle_cam_library.jpg", "Affluence : 42 Étudiants · 24°C"), 0, 0);
        cctvGrid.add(createCameraFeedCard("CAM 02 · Atelier Informatique & Lab C204", "/images/sentinelle_cam_lab.jpg", "Affluence : 28 Postes occupés · 22°C"), 1, 0);
        cctvGrid.add(createCameraFeedCard("CAM 03 · Couloir Résidence Bloc A", "/images/sentinelle_cam_residence.jpg", "Statut : Calme · Accès Sécurisé"), 0, 1);
        cctvGrid.add(createCameraFeedCard("CAM 04 · Parking & Entrée Principale Campus", "/images/sentinelle_cam_parking.jpg", "Trafic : Fluide · Barrière Ouverte"), 1, 1);

        BentoCard cctvCard = new BentoCard(
                "Flux Vidéo & Télémétrie Sécuritaire",
                "Aperçus en direct des zones sous surveillance Sentinelle IoT",
                cctvGrid
        );
        root.getChildren().add(cctvCard);

        setContent(root);
    }

    private VBox createCameraFeedCard(String camName, String imgPath, String status) {
        VBox box = new VBox(8);
        box.setStyle("-fx-background-color: #0F172A; -fx-background-radius: 14; -fx-padding: 10;");

        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);
        Label recDot = new Label("REC ●");
        recDot.setStyle("-fx-text-fill: #EF4444; -fx-font-weight: 800; -fx-font-size: 10px;");
        Label name = new Label(camName);
        name.setStyle("-fx-text-fill: #FFFFFF; -fx-font-weight: 700; -fx-font-size: 11.5px;");
        top.getChildren().addAll(recDot, name);

        ImageView iv = loadImg(imgPath, 320, 160);
        if (iv != null) {
            iv.setFitWidth(320);
            iv.setPreserveRatio(true);
        }

        Label st = new Label(status);
        st.setStyle("-fx-text-fill: #94A3B8; -fx-font-size: 10.5px;");

        box.getChildren().add(top);
        if (iv != null) box.getChildren().add(iv);
        box.getChildren().add(st);
        return box;
    }

    private ImageView loadImg(String path, double w, double h) {
        try {
            var url = getClass().getResource(path);
            if (url != null) {
                return new ImageView(new Image(url.toExternalForm(), w, h, true, true));
            }
        } catch (Exception ignored) {}
        return null;
    }
}
