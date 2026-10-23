package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.ui.components.BentoCard;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public class VisioView extends ScrollPane {

    public VisioView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        HeroHeader hero = new HeroHeader(
                "Salles Virtuelles Haute Définition",
                "Visioconférence Campus UY1",
                "Rejoignez vos cours magistraux interactifs, ateliers à distance et soutenances de projets en WebRTC HD chiffré",
                "/icons/visio.png",
                "HD 1080p", "Flux vidéo haute fidélité",
                "0 Latence", "Réseau campus optimisé"
        );
        root.getChildren().add(hero);

        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(50);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(50);
        grid.getColumnConstraints().addAll(col1, col2);

        // Left : Rejoindre une session
        VBox joinBox = new VBox(14);
        TextField roomInput = new TextField("inf3055-microservices");
        roomInput.setPromptText("Code de la salle de cours (ex: inf3055-amphi250)");
        roomInput.getStyleClass().add("search-field");

        CheckBox micCheck = new CheckBox("Activer mon microphone au démarrage");
        micCheck.setSelected(true);
        CheckBox camCheck = new CheckBox("Activer ma caméra HD");
        camCheck.setSelected(true);

        Button startBtn = new Button("🚀 Entrer dans l'amphithéâtre virtuel");
        startBtn.getStyleClass().add("btn-primary");
        startBtn.setMaxWidth(Double.MAX_VALUE);

        joinBox.getChildren().addAll(
                new Label("Code ou lien de la réunion :"), roomInput,
                micCheck, camCheck,
                startBtn
        );
        BentoCard joinCard = new BentoCard("Rejoindre un cours en direct", "Saisissez l'identifiant fourni par votre enseignant", joinBox);
        grid.add(joinCard, 0, 0);

        // Right : Créer un salon de travail (Enseignants & Délégués)
        VBox hostBox = new VBox(14);
        TextField newRoomName = new TextField("Groupe d'Étude ICT4D L3");
        newRoomName.getStyleClass().add("search-field");

        ComboBox<String> typeCombo = new ComboBox<>();
        typeCombo.getItems().addAll("Travaux Pratiques en Sous-groupes", "Séance de Révision", "Soutenance de Stage", "Consultation Enseignant");
        typeCombo.setValue("Travaux Pratiques en Sous-groupes");
        typeCombo.setMaxWidth(Double.MAX_VALUE);

        Button createBtn = new Button("➕ Démarrer une nouvelle visioconférence");
        createBtn.getStyleClass().add("btn-teal");
        createBtn.setMaxWidth(Double.MAX_VALUE);

        hostBox.getChildren().addAll(
                new Label("Nom de l'atelier :"), newRoomName,
                new Label("Type d'activité :"), typeCombo,
                createBtn
        );
        BentoCard hostCard = new BentoCard("Créer un atelier d'étude", "Réservé aux délégués et enseignants pour le travail d'équipe", hostBox);
        grid.add(hostCard, 1, 0);

        root.getChildren().add(grid);
        setContent(root);
    }
}
