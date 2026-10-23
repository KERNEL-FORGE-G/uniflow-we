package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.models.Course;
import cm.uniflow.desktop.models.NewsItem;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.services.MockDataService;
import cm.uniflow.desktop.ui.components.BentoCard;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.util.List;

public class DashboardView extends ScrollPane {

    public DashboardView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        User user = AppConfig.getCurrentUser();
        String welcome = "Bonjour " + (user != null ? user.getName() : "Étudiant") + " 👋";
        String sub = "Bienvenue sur votre espace académique connecté · UY1 Informatique ICT4D L3";

        // Hero Bento
        HeroHeader hero = new HeroHeader(
                "Semestre 5 · Session Normale 2026/2027",
                welcome,
                sub,
                "/mascot/uni_copilot_3d.png",
                "30 ECTS", "Crédits inscrits",
                "94.2%", "Taux d'assiduité"
        );
        root.getChildren().add(hero);

        // Stats row
        HBox statsGrid = new HBox(16);
        statsGrid.getChildren().addAll(
                createStatTile("Prochain cours", "INF3055 · 08:00", "Amphi 250 avec Dr. Menga", "pill-blue"),
                createStatTile("UniMail @uniflow.cm", "2 Non lus", "Nouveau message du secrétariat", "pill-green"),
                createStatTile("Émargement QR", "Validé", "Séance précédente certifiée", "pill-amber"),
                createStatTile("Sentinelle IoT", "Bornes actives", "4 accès campus synchronisés", "pill-purple")
        );
        for (javafx.scene.Node n : statsGrid.getChildren()) {
            HBox.setHgrow(n, Priority.ALWAYS);
        }
        root.getChildren().add(statsGrid);

        // Main 2-column Bento section
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(62);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(38);
        grid.getColumnConstraints().addAll(col1, col2);

        // Left: Courses & Progress
        VBox coursesList = new VBox(12);
        List<Course> courses = MockDataService.getSampleCourses();
        for (Course c : courses) {
            coursesList.getChildren().add(createCourseRow(c));
        }
        BentoCard coursesCard = new BentoCard(
                "Unités d'Enseignement & Progression",
                "Suivi des cours du semestre en cours et taux de complétion",
                coursesList
        );
        grid.add(coursesCard, 0, 0);

        // Right: Campus Announcements
        VBox newsList = new VBox(14);
        List<NewsItem> news = MockDataService.getSampleNews();
        for (NewsItem n : news) {
            newsList.getChildren().add(createNewsSnippet(n));
        }
        BentoCard newsCard = new BentoCard(
                "Actualités & Annonces Campus",
                "Informations officielles de l'université et du département",
                newsList
        );
        grid.add(newsCard, 1, 0);

        root.getChildren().add(grid);
        setContent(root);
    }

    private VBox createStatTile(String label, String value, String desc, String pillClass) {
        VBox box = new VBox(6);
        box.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #E2E8F0; -fx-border-radius: 18; -fx-background-radius: 18; -fx-padding: 16;");
        Label l = new Label(label);
        l.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #64748B; -fx-font-weight: 600;");
        Label v = new Label(value);
        v.setStyle("-fx-font-size: 17px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        Label d = new Label(desc);
        d.setStyle("-fx-font-size: 11px; -fx-text-fill: #94A3B8;");
        box.getChildren().addAll(l, v, d);
        return box;
    }

    private HBox createCourseRow(Course c) {
        HBox row = new HBox(12);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 14; -fx-background-radius: 14; -fx-padding: 12;");

        VBox badge = new VBox(2);
        badge.setAlignment(Pos.CENTER);
        badge.setPrefWidth(70);
        badge.setStyle("-fx-background-color: " + c.getColor() + "; -fx-background-radius: 10; -fx-padding: 6;");
        Label code = new Label(c.getCode());
        code.setStyle("-fx-font-weight: 800; -fx-text-fill: #FFFFFF; -fx-font-size: 11px;");
        Label credits = new Label(c.getCredits() + " ECTS");
        credits.setStyle("-fx-font-size: 9.5px; -fx-text-fill: rgba(255,255,255,0.85);");
        badge.getChildren().addAll(code, credits);

        VBox center = new VBox(3);
        HBox.setHgrow(center, Priority.ALWAYS);
        Label title = new Label(c.getTitle());
        title.setStyle("-fx-font-weight: 700; -fx-font-size: 13px; -fx-text-fill: #0F172A;");
        Label teacher = new Label(c.getTeacher() + " · " + c.getRoom() + " · " + c.getHours() + "h");
        teacher.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");
        center.getChildren().addAll(title, teacher);

        VBox progressBox = new VBox(4);
        progressBox.setAlignment(Pos.CENTER_RIGHT);
        Label pct = new Label((int)(c.getProgress() * 100) + "%");
        pct.setStyle("-fx-font-weight: 800; -fx-font-size: 11.5px; -fx-text-fill: #1E3A8A;");
        ProgressBar pb = new ProgressBar(c.getProgress());
        pb.setPrefWidth(90);
        pb.setStyle("-fx-accent: #1E3A8A;");
        progressBox.getChildren().addAll(pct, pb);

        row.getChildren().addAll(badge, center, progressBox);
        return row;
    }

    private VBox createNewsSnippet(NewsItem n) {
        VBox box = new VBox(4);
        box.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 14; -fx-background-radius: 14; -fx-padding: 12;");

        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);
        Label cat = new Label(n.getCategory());
        cat.getStyleClass().addAll("pill-badge", "pill-blue");
        Label date = new Label(n.getDate());
        date.setStyle("-fx-font-size: 10.5px; -fx-text-fill: #94A3B8;");
        top.getChildren().addAll(cat, date);

        Label title = new Label(n.getTitle());
        title.setStyle("-fx-font-weight: 700; -fx-font-size: 12.5px; -fx-text-fill: #0F172A;");
        title.setWrapText(true);

        Label snippet = new Label(n.getContent());
        snippet.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #475569;");
        snippet.setWrapText(true);
        snippet.setMaxHeight(40);

        box.getChildren().addAll(top, title, snippet);
        return box;
    }
}
