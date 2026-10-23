package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.DirectoryPerson;
import cm.uniflow.desktop.services.MockDataService;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.Clipboard;
import javafx.scene.input.ClipboardContent;
import javafx.scene.layout.*;

import java.util.List;

public class DirectoryView extends ScrollPane {

    private final List<DirectoryPerson> allPeople = MockDataService.getSampleDirectory();
    private final FlowPane cardsFlow = new FlowPane(16, 16);
    private final TextField searchField = new TextField();
    private String currentRoleFilter = "ALL";

    public DirectoryView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));
        root.setStyle("-fx-background-color: transparent;");

        root.getChildren().addAll(
                buildHeroBanner(),
                buildSearchBar(),
                cardsFlow
        );

        refreshDirectory();

        setContent(root);
    }

    private VBox buildHeroBanner() {
        VBox hero = new VBox(14);
        hero.setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B, #1E3A8A, #0D9488);" +
                "-fx-background-radius: 24; -fx-padding: 24 28; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.18), 16, 0, 0, 4);");

        HBox topRow = new HBox(16);
        topRow.setAlignment(Pos.CENTER_LEFT);

        ImageView icon = loadIcon("/icons/students.png", 46, 46);
        if (icon != null) topRow.getChildren().add(icon);

        VBox textCol = new VBox(4);
        Label badge = new Label("Communauté Campus · Université de Yaoundé I");
        badge.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-text-fill: #A5F3FC; -fx-font-weight: 700;" +
                "-fx-padding: 4 12; -fx-background-radius: 12; -fx-font-size: 11px;");

        Label title = new Label("Annuaire Académique & Contact Direct");
        title.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: white;");

        Label sub = new Label("Retrouvez les enseignants, délégués et camarades de promotion avec leurs adresses UniMail @uniflow.cm.");
        sub.setStyle("-fx-font-size: 13px; -fx-text-fill: #E2E8F0;");

        textCol.getChildren().addAll(badge, title, sub);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        ImageView teachIcon = loadIcon("/icons/teachers.png", 64, 64);
        if (teachIcon != null) topRow.getChildren().add(teachIcon);

        topRow.getChildren().add(textCol);
        hero.getChildren().add(topRow);
        return hero;
    }

    private HBox buildSearchBar() {
        HBox bar = new HBox(12);
        bar.setAlignment(Pos.CENTER_LEFT);
        bar.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 16; -fx-background-radius: 16; -fx-padding: 12 18;");

        searchField.setPromptText("Rechercher un enseignant, délégué, matière ou matricule...");
        searchField.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #CBD5E1; -fx-border-radius: 10; -fx-background-radius: 10; -fx-padding: 8 14; -fx-pref-width: 380;");
        searchField.textProperty().addListener((obs, oldV, newV) -> refreshDirectory());

        Button btnAll = createFilterBtn("Tous", "ALL");
        Button btnTeach = createFilterBtn("Enseignants", "TEACHER");
        Button btnStud = createFilterBtn("Étudiants / Délégués", "STUDENT");

        bar.getChildren().addAll(searchField, btnAll, btnTeach, btnStud);
        return bar;
    }

    private Button createFilterBtn(String text, String role) {
        Button btn = new Button(text);
        btn.setStyle(currentRoleFilter.equals(role) ?
                "-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 16; -fx-padding: 6 14;" :
                "-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-weight: 600; -fx-background-radius: 16; -fx-padding: 6 14;");
        btn.setOnAction(e -> {
            this.currentRoleFilter = role;
            refreshDirectory();
        });
        return btn;
    }

    private void refreshDirectory() {
        cardsFlow.getChildren().clear();
        String query = searchField.getText().toLowerCase().trim();

        List<DirectoryPerson> filtered = allPeople.stream().filter(p -> {
            boolean matchRole = "ALL".equals(currentRoleFilter) || p.getRole().equalsIgnoreCase(currentRoleFilter);
            if (!matchRole) return false;
            if (query.isEmpty()) return true;
            return p.getName().toLowerCase().contains(query) ||
                    p.getTitle().toLowerCase().contains(query) ||
                    p.getDepartment().toLowerCase().contains(query) ||
                    p.getEmail().toLowerCase().contains(query);
        }).toList();

        for (DirectoryPerson p : filtered) {
            cardsFlow.getChildren().add(createPersonCard(p));
        }
    }

    private VBox createPersonCard(DirectoryPerson p) {
        VBox card = new VBox(10);
        card.setPrefWidth(360);
        card.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 18; -fx-background-radius: 18; -fx-padding: 20; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.04), 8, 0, 0, 2);");

        HBox top = new HBox(12);
        top.setAlignment(Pos.CENTER_LEFT);

        ImageView avatar = loadIcon("TEACHER".equalsIgnoreCase(p.getRole()) ? "/icons/teacher.png" : "/icons/students.png", 42, 42);
        if (avatar != null) top.getChildren().add(avatar);

        VBox nameBox = new VBox(2);
        Label nameLbl = new Label(p.getName());
        nameLbl.setStyle("-fx-font-size: 14.5px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label titleLbl = new Label(p.getTitle());
        titleLbl.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #2563EB; -fx-font-weight: 700;");

        nameBox.getChildren().addAll(nameLbl, titleLbl);
        HBox.setHgrow(nameBox, Priority.ALWAYS);

        top.getChildren().add(nameBox);

        Label deptLbl = new Label("🏛️ " + p.getDepartment() + " · " + p.getOffice());
        deptLbl.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B;");

        Label mailLbl = new Label("✉ " + p.getEmail());
        mailLbl.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #0D9488; -fx-font-weight: 600;");

        HBox actions = new HBox(8);
        Button copyBtn = new Button("Copier l'adresse");
        copyBtn.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #334155; -fx-font-weight: 600; -fx-background-radius: 10; -fx-padding: 6 12;");
        copyBtn.setOnAction(e -> {
            Clipboard clipboard = Clipboard.getSystemClipboard();
            ClipboardContent content = new ClipboardContent();
            content.putString(p.getEmail());
            clipboard.setContent(content);

            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Adresse Copiée");
            alert.setHeaderText(null);
            alert.setContentText("L'adresse " + p.getEmail() + " a été copiée dans le presse-papiers.");
            alert.showAndWait();
        });

        Button writeBtn = new Button("UniMail direct");
        writeBtn.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 6 12;");
        writeBtn.setOnAction(e -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Nouveau Message UniMail");
            alert.setHeaderText("Destinataire : " + p.getName());
            alert.setContentText("Le composeur UniMail @uniflow.cm a été pré-rempli pour " + p.getEmail());
            alert.showAndWait();
        });

        actions.getChildren().addAll(copyBtn, writeBtn);

        card.getChildren().addAll(top, deptLbl, mailLbl, actions);
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
