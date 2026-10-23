package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.Course;
import cm.uniflow.desktop.services.MockDataService;
import cm.uniflow.desktop.ui.components.BentoCard;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.util.List;

public class CoursesView extends ScrollPane {

    public CoursesView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        HeroHeader hero = new HeroHeader(
                "Programme Académique Officiel",
                "Unités d'Enseignement & Syllabi",
                "Consultez les ressources, cours magistraux, devoirs et barèmes de notation",
                "/images/course_study_hero_3d.png",
                "6 UEs", "Inscrites au S5",
                "225 Heures", "Volume total semestriel"
        );
        root.getChildren().add(hero);

        // Courses Grid (2 columns)
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(50);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(50);
        grid.getColumnConstraints().addAll(col1, col2);

        List<Course> courses = MockDataService.getSampleCourses();
        int row = 0;
        int col = 0;
        for (Course c : courses) {
            grid.add(createCourseCard(c), col, row);
            col++;
            if (col > 1) {
                col = 0;
                row++;
            }
        }

        root.getChildren().add(grid);
        setContent(root);
    }

    private VBox createCourseCard(Course c) {
        VBox card = new VBox(12);
        card.getStyleClass().add("bento-card");

        HBox top = new HBox(10);
        top.setAlignment(Pos.CENTER_LEFT);

        Label codeBadge = new Label(c.getCode());
        codeBadge.setStyle("-fx-background-color: " + c.getColor() + "; -fx-text-fill: white; -fx-font-weight: 800; -fx-padding: 4 10; -fx-background-radius: 8;");

        Label creditsBadge = new Label(c.getCredits() + " Crédits ECTS");
        creditsBadge.getStyleClass().addAll("pill-badge", "pill-blue");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Label hours = new Label(c.getHours() + " Heures");
        hours.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B; -fx-font-weight: 600;");

        top.getChildren().addAll(codeBadge, creditsBadge, sp, hours);

        Label title = new Label(c.getTitle());
        title.setStyle("-fx-font-size: 15px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        title.setWrapText(true);

        Label teacher = new Label("Enseignant titulaire : " + c.getTeacher() + " · Salle : " + c.getRoom());
        teacher.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #475569;");

        // Progress bar
        VBox prog = new VBox(4);
        HBox progHeader = new HBox();
        Label progLabel = new Label("Progression pédagogique :");
        progLabel.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");
        Region pSp = new Region();
        HBox.setHgrow(pSp, Priority.ALWAYS);
        Label pct = new Label((int)(c.getProgress() * 100) + "%");
        pct.setStyle("-fx-font-weight: 800; -fx-font-size: 11px; -fx-text-fill: #1E3A8A;");
        progHeader.getChildren().addAll(progLabel, pSp, pct);

        ProgressBar pb = new ProgressBar(c.getProgress());
        pb.setMaxWidth(Double.MAX_VALUE);
        pb.setStyle("-fx-accent: #1E3A8A;");
        prog.getChildren().addAll(progHeader, pb);

        // Actions
        HBox actions = new HBox(10);
        Button docsBtn = new Button("Supports de cours (PDF)");
        docsBtn.getStyleClass().add("btn-secondary");
        HBox.setHgrow(docsBtn, Priority.ALWAYS);

        Button devoirBtn = new Button("Devoirs & Travaux");
        devoirBtn.getStyleClass().add("btn-primary");
        HBox.setHgrow(devoirBtn, Priority.ALWAYS);

        actions.getChildren().addAll(docsBtn, devoirBtn);

        card.getChildren().addAll(top, title, teacher, prog, actions);
        return card;
    }
}
