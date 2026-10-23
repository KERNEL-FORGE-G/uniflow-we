package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.RoomItem;
import cm.uniflow.desktop.services.MockDataService;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

import java.util.List;

public class ClassroomsView extends ScrollPane {

    private final List<RoomItem> rooms = MockDataService.getSampleRooms();
    private final FlowPane roomsFlow = new FlowPane(16, 16);
    private String currentFilter = "ALL";

    public ClassroomsView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));
        root.setStyle("-fx-background-color: transparent;");

        root.getChildren().addAll(
                buildHeroBanner(),
                buildFilterBar(),
                roomsFlow
        );

        refreshRooms();

        setContent(root);
    }

    private VBox buildHeroBanner() {
        VBox hero = new VBox(14);
        hero.setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B, #1E3A8A, #0D9488);" +
                "-fx-background-radius: 24; -fx-padding: 24 28; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.18), 16, 0, 0, 4);");

        HBox topRow = new HBox(16);
        topRow.setAlignment(Pos.CENTER_LEFT);

        ImageView icon = loadIcon("/icons/rooms.png", 46, 46);
        if (icon != null) topRow.getChildren().add(icon);

        VBox textCol = new VBox(4);
        Label badge = new Label("Infrastructures Universitaires · UY1");
        badge.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-text-fill: #A5F3FC; -fx-font-weight: 700;" +
                "-fx-padding: 4 12; -fx-background-radius: 12; -fx-font-size: 11px;");

        Label title = new Label("Amphithéâtres & Salles Connectées");
        title.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: white;");

        Label sub = new Label("Disponibilité en temps réel, jauges d'occupation et équipements connectés aux bornes Sentinelle.");
        sub.setStyle("-fx-font-size: 13px; -fx-text-fill: #E2E8F0;");

        textCol.getChildren().addAll(badge, title, sub);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        ImageView sentinelle = loadIcon("/icons/sentinelle.png", 64, 64);
        if (sentinelle != null) topRow.getChildren().add(sentinelle);

        topRow.getChildren().add(textCol);
        hero.getChildren().add(topRow);
        return hero;
    }

    private HBox buildFilterBar() {
        HBox bar = new HBox(10);
        bar.setAlignment(Pos.CENTER_LEFT);

        Button btnAll = createFilterButton("Tous les locaux", "ALL");
        Button btnAmphi = createFilterButton("Amphithéâtres", "AMPHI");
        Button btnLab = createFilterButton("Laboratoires & TP", "LAB");
        Button btnFree = createFilterButton("Libres maintenant", "FREE");

        bar.getChildren().addAll(btnAll, btnAmphi, btnLab, btnFree);
        return bar;
    }

    private Button createFilterButton(String text, String filter) {
        Button btn = new Button(text);
        btn.setStyle(currentFilter.equals(filter) ?
                "-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 18; -fx-padding: 7 16;" :
                "-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-weight: 600; -fx-background-radius: 18; -fx-padding: 7 16;");
        btn.setOnAction(e -> {
            this.currentFilter = filter;
            refreshRooms();
        });
        return btn;
    }

    private void refreshRooms() {
        roomsFlow.getChildren().clear();

        List<RoomItem> filtered = rooms.stream().filter(r -> {
            if ("ALL".equals(currentFilter)) return true;
            if ("AMPHI".equals(currentFilter)) return r.getType().equalsIgnoreCase("Amphithéâtre");
            if ("LAB".equals(currentFilter)) return r.getType().toLowerCase().contains("lab") || r.getType().equalsIgnoreCase("Salle TP");
            if ("FREE".equals(currentFilter)) return "LIBRE".equalsIgnoreCase(r.getStatus());
            return true;
        }).toList();

        for (RoomItem r : filtered) {
            roomsFlow.getChildren().add(createRoomCard(r));
        }
    }

    private VBox createRoomCard(RoomItem r) {
        VBox card = new VBox(12);
        card.setPrefWidth(360);
        card.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 18; -fx-background-radius: 18; -fx-padding: 20; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.04), 8, 0, 0, 2);");

        HBox top = new HBox(10);
        top.setAlignment(Pos.CENTER_LEFT);

        Label name = new Label(r.getName());
        name.setStyle("-fx-font-size: 16px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");
        HBox.setHgrow(name, Priority.ALWAYS);

        Label statusPill = new Label();
        boolean isFree = "LIBRE".equalsIgnoreCase(r.getStatus());
        statusPill.setText(isFree ? "● LIBRE" : "● EN COURS");
        statusPill.setStyle(isFree ?
                "-fx-background-color: #ECFDF5; -fx-text-fill: #047857; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 12; -fx-font-size: 11px;" :
                "-fx-background-color: #FEF2F2; -fx-text-fill: #B91C1C; -fx-font-weight: 800; -fx-padding: 3 10; -fx-background-radius: 12; -fx-font-size: 11px;");

        top.getChildren().addAll(name, statusPill);

        Label infoLbl = new Label(r.getType() + " · " + r.getBuilding() + " · " + r.getCapacity() + " places");
        infoLbl.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B; -fx-font-weight: 600;");

        Label equipLbl = new Label("⚡ Équipements : " + r.getEquipment());
        equipLbl.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #475569;");
        equipLbl.setWrapText(true);

        Label occLbl = new Label("Occupant actuel : " + (r.getCurrentCourse() != null ? r.getCurrentCourse() : "Aucun cours en cours"));
        occLbl.setStyle(isFree ?
                "-fx-font-size: 12px; -fx-text-fill: #047857; -fx-font-weight: 700;" :
                "-fx-font-size: 12px; -fx-text-fill: #1D4ED8; -fx-font-weight: 700;");

        Button reserveBtn = new Button(isFree ? "Réserver pour étude de groupe" : "Consulter le planning de la salle");
        reserveBtn.setStyle(isFree ?
                "-fx-background-color: #2563EB; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 12; -fx-padding: 7 14;" :
                "-fx-background-color: #F1F5F9; -fx-text-fill: #334155; -fx-font-weight: 700; -fx-background-radius: 12; -fx-padding: 7 14;");
        reserveBtn.setMaxWidth(Double.MAX_VALUE);
        reserveBtn.setOnAction(e -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Réservation de Salle");
            alert.setHeaderText("Salle : " + r.getName());
            alert.setContentText("Votre demande de créneau dans " + r.getName() + " a été transmise aux délégués et au gardiennage connecté Sentinelle.");
            alert.showAndWait();
        });

        card.getChildren().addAll(top, infoLbl, equipLbl, occLbl, reserveBtn);
        return card;
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
