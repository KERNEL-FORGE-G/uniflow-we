package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.ScheduleItem;
import cm.uniflow.desktop.services.MockDataService;
import cm.uniflow.desktop.ui.components.BentoCard;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.util.List;

public class ScheduleView extends ScrollPane {

    public ScheduleView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));

        HeroHeader hero = new HeroHeader(
                "Planning Pédagogique Officiel",
                "Emploi du Temps Semaine LMD",
                "Filière Informatique (ICT4D) · Semestre 5 · Université de Yaoundé I",
                "/images/schedule_calendar_hero_3d.png",
                "7 Séances", "Cette semaine",
                "24 Heures", "Volume hebdomadaire"
        );
        root.getChildren().add(hero);

        // Day filters and action bar
        HBox bar = new HBox(12);
        bar.setAlignment(Pos.CENTER_LEFT);

        Label filterLabel = new Label("Filtrer par jour :");
        filterLabel.setStyle("-fx-font-weight: 700; -fx-text-fill: #0F172A;");

        ComboBox<String> dayCombo = new ComboBox<>();
        dayCombo.getItems().addAll("Toute la semaine", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi");
        dayCombo.setValue("Toute la semaine");
        dayCombo.getStyleClass().add("btn-secondary");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button exportBtn = new Button("Exporter au format ICS / Google Agenda");
        exportBtn.getStyleClass().add("btn-teal");

        bar.getChildren().addAll(filterLabel, dayCombo, spacer, exportBtn);
        root.getChildren().add(bar);

        // Schedule cards grid
        VBox scheduleList = new VBox(12);
        List<ScheduleItem> items = MockDataService.getSampleSchedule();
        for (ScheduleItem item : items) {
            scheduleList.getChildren().add(createScheduleCard(item));
        }

        BentoCard card = new BentoCard(
                "Séances Programmées",
                "Séances synchronisées avec l'administration départementale",
                scheduleList
        );
        root.getChildren().add(card);

        setContent(root);
    }

    private HBox createScheduleCard(ScheduleItem item) {
        HBox card = new HBox(16);
        card.setAlignment(Pos.CENTER_LEFT);
        card.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #E2E8F0; -fx-border-radius: 16; -fx-background-radius: 16; -fx-padding: 16;");

        // Time Badge
        VBox timeBox = new VBox(2);
        timeBox.setAlignment(Pos.CENTER);
        timeBox.setPrefWidth(90);
        timeBox.setStyle("-fx-background-color: #EFF6FF; -fx-border-color: #BFDBFE; -fx-border-radius: 12; -fx-background-radius: 12; -fx-padding: 8;");
        Label day = new Label(item.getDay());
        day.setStyle("-fx-font-weight: 800; -fx-font-size: 11px; -fx-text-fill: #1D4ED8;");
        Label hours = new Label(item.getStartTime() + " - " + item.getEndTime());
        hours.setStyle("-fx-font-weight: 700; -fx-font-size: 10px; -fx-text-fill: #3B82F6;");
        timeBox.getChildren().addAll(day, hours);

        // Course Info
        VBox info = new VBox(3);
        HBox.setHgrow(info, Priority.ALWAYS);
        HBox titleRow = new HBox(8);
        titleRow.setAlignment(Pos.CENTER_LEFT);
        Label code = new Label(item.getCourseCode());
        code.setStyle("-fx-font-weight: 800; -fx-font-size: 13.5px; -fx-text-fill: #0F172A;");
        Label typeBadge = new Label(item.getType());
        typeBadge.getStyleClass().addAll("pill-badge", "pill-purple");
        titleRow.getChildren().addAll(code, typeBadge);

        Label title = new Label(item.getCourseTitle());
        title.setStyle("-fx-font-size: 12.5px; -fx-text-fill: #334155; -fx-font-weight: 600;");

        Label teacher = new Label("Enseignant : " + item.getTeacher() + " · Salle : " + item.getRoom());
        teacher.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");
        info.getChildren().addAll(titleRow, title, teacher);

        // Action QR / Presences
        Button qrBtn = new Button("Émarger QR");
        qrBtn.getStyleClass().add("btn-primary");

        card.getChildren().addAll(timeBox, info, qrBtn);
        return card;
    }
}
