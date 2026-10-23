package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.ZBook;
import cm.uniflow.desktop.services.MockDataService;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

import java.util.List;

public class ZLibraryView extends ScrollPane {

    public ZLibraryView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        HeroHeader hero = new HeroHeader(
                "Bibliothèque Académique Intégrale",
                "Z-Library Campus Universitaire",
                "Ouvrages de référence, manuels officiels, thèses et publications en accès illimité 100% hors-ligne",
                "/icons/library.png",
                "15,000+ Titres", "Catalogue indexé",
                "100% Gratuit", "Accès étudiant certifié"
        );
        root.getChildren().add(hero);

        // Search and category toolbar
        HBox filterBar = new HBox(12);
        filterBar.setAlignment(Pos.CENTER_LEFT);

        TextField searchInput = new TextField();
        searchInput.setPromptText("Rechercher par titre, auteur, ISBN, matière...");
        searchInput.setPrefWidth(380);
        searchInput.getStyleClass().add("search-field");

        ComboBox<String> catBox = new ComboBox<>();
        catBox.getItems().addAll("Toutes les disciplines", "Génie Logiciel", "Intelligence Artificielle", "Cybersécurité", "Systèmes & Réseaux", "Bases de Données");
        catBox.setValue("Toutes les disciplines");
        catBox.getStyleClass().add("btn-secondary");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Button requestBookBtn = new Button("+ Proposer un livre");
        requestBookBtn.getStyleClass().add("btn-primary");

        filterBar.getChildren().addAll(searchInput, catBox, sp, requestBookBtn);
        root.getChildren().add(filterBar);

        // Books Grid
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(50);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(50);
        grid.getColumnConstraints().addAll(col1, col2);

        List<ZBook> books = MockDataService.getSampleBooks();
        int row = 0;
        int col = 0;
        for (ZBook b : books) {
            grid.add(createBookCard(b), col, row);
            col++;
            if (col > 1) {
                col = 0;
                row++;
            }
        }

        root.getChildren().add(grid);
        setContent(root);
    }

    private VBox createBookCard(ZBook b) {
        VBox card = new VBox(12);
        card.getStyleClass().add("bento-card");

        HBox main = new HBox(16);
        main.setAlignment(Pos.TOP_LEFT);

        // Book Cover Placeholder / Icon
        VBox coverBox = new VBox();
        coverBox.setAlignment(Pos.CENTER);
        coverBox.setPrefSize(75, 105);
        coverBox.setStyle("-fx-background-color: linear-gradient(to bottom right, #1E3A8A, #0D9488); -fx-background-radius: 8;");
        Label formatBadge = new Label(b.getFormat());
        formatBadge.setStyle("-fx-text-fill: white; -fx-font-weight: 800; -fx-font-size: 11px;");
        coverBox.getChildren().add(formatBadge);

        VBox meta = new VBox(4);
        HBox.setHgrow(meta, Priority.ALWAYS);

        Label cat = new Label(b.getCategory());
        cat.getStyleClass().addAll("pill-badge", "pill-blue");

        Label title = new Label(b.getTitle());
        title.setStyle("-fx-font-weight: 800; -fx-font-size: 13.5px; -fx-text-fill: #0F172A;");
        title.setWrapText(true);

        Label author = new Label("Auteur : " + b.getAuthor() + " (" + b.getYear() + ")");
        author.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #475569;");

        Label details = new Label(b.getPages() + " pages · " + b.getFileSize() + " · Édition Révisée");
        details.setStyle("-fx-font-size: 10.5px; -fx-text-fill: #94A3B8;");

        meta.getChildren().addAll(cat, title, author, details);
        main.getChildren().addAll(coverBox, meta);

        // Actions
        HBox actions = new HBox(10);
        Button readBtn = new Button("Lire en ligne");
        readBtn.getStyleClass().add("btn-secondary");
        HBox.setHgrow(readBtn, Priority.ALWAYS);

        Button downloadBtn = new Button("Télécharger (PDF direct)");
        downloadBtn.getStyleClass().add("btn-teal");
        HBox.setHgrow(downloadBtn, Priority.ALWAYS);

        actions.getChildren().addAll(readBtn, downloadBtn);

        card.getChildren().addAll(main, actions);
        return card;
    }
}
