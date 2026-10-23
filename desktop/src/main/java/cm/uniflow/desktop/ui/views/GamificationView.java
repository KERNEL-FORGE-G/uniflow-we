package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.models.BadgeItem;
import cm.uniflow.desktop.services.MockDataService;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

import java.util.List;

public class GamificationView extends ScrollPane {

    private final List<BadgeItem> badges = MockDataService.getSampleBadges();

    public GamificationView() {
        setFitToWidth(true);
        getStyleClass().add("scroll-pane");

        VBox root = new VBox(22);
        root.setPadding(new Insets(24));
        root.setStyle("-fx-background-color: transparent;");

        root.getChildren().addAll(
                buildHeroBanner(),
                buildStreakCard(),
                buildQuestsSection(),
                buildBadgesShowcase(),
                buildLeaderboardSection()
        );

        setContent(root);
    }

    private VBox buildHeroBanner() {
        VBox hero = new VBox(14);
        hero.setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B, #1E3A8A, #7C3AED);" +
                "-fx-background-radius: 24; -fx-padding: 24 28; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.18), 16, 0, 0, 4);");

        HBox topRow = new HBox(16);
        topRow.setAlignment(Pos.CENTER_LEFT);

        ImageView icon = loadIcon("/icons/gamification.png", 46, 46);
        if (icon != null) topRow.getChildren().add(icon);

        VBox textCol = new VBox(4);
        Label badge = new Label("Progression & Récompenses · KERNEL FORGE");
        badge.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-text-fill: #DDD6FE; -fx-font-weight: 700;" +
                "-fx-padding: 4 12; -fx-background-radius: 12; -fx-font-size: 11px;");

        Label title = new Label("Quêtes Académiques, Badges & Trophées 3D");
        title.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: white;");

        Label sub = new Label("Cumulez des points d'XP, maintenez votre série quotidienne et dominez le classement de promotion.");
        sub.setStyle("-fx-font-size: 13px; -fx-text-fill: #E2E8F0;");

        textCol.getChildren().addAll(badge, title, sub);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        ImageView mascot = loadIcon("/mascot/uni_duo_celebrate_streak.png", 82, 82);
        if (mascot != null) topRow.getChildren().add(mascot);

        topRow.getChildren().add(textCol);
        hero.getChildren().add(topRow);
        return hero;
    }

    private HBox buildStreakCard() {
        HBox card = new HBox(18);
        card.setAlignment(Pos.CENTER_LEFT);
        card.setStyle("-fx-background-color: linear-gradient(to right, #FFFBEB, #FEF3C7);" +
                "-fx-border-color: #FCD34D; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 18 24;");

        ImageView fireImg = loadIcon("/mascot/uni_duo_streak_fire.png", 68, 68);
        if (fireImg != null) card.getChildren().add(fireImg);

        VBox textCol = new VBox(4);
        Label streakTitle = new Label("🔥 Série Incandescente : 14 Jours Consécutifs !");
        streakTitle.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #B45309;");

        Label streakDesc = new Label("Vous avez validé vos cours et révisé 14 jours d'affilée. Encore 1 jour pour remporter le badge 'Flamme Mensuelle' !");
        streakDesc.setStyle("-fx-font-size: 12.5px; -fx-text-fill: #92400E;");

        textCol.getChildren().addAll(streakTitle, streakDesc);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        VBox xpBox = new VBox(2);
        xpBox.setAlignment(Pos.CENTER);
        Label xpVal = new Label("1 450 XP");
        xpVal.setStyle("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: #B45309;");
        Label xpLbl = new Label("Niveau 7 · Spécialiste");
        xpLbl.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #78350F;");
        xpBox.getChildren().addAll(xpVal, xpLbl);

        card.getChildren().addAll(textCol, xpBox);
        return card;
    }

    private VBox buildQuestsSection() {
        VBox section = new VBox(14);
        section.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 24;");

        Label title = new Label("Quêtes du Jour");
        title.setStyle("-fx-font-size: 16px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        VBox questsList = new VBox(10);
        questsList.getChildren().addAll(
                createQuestItem("Valider son émargement par QR Code ce matin", "Présence en INF3055 enregistrée", 1.0, "+50 XP", true),
                createQuestItem("Consulter un ouvrage technique sur Z-Library", "Clean Architecture téléchargé", 1.0, "+30 XP", true),
                createQuestItem("Soumettre le TP de Docker & Spring Boot", "Date limite : 24 Octobre", 0.6, "+100 XP", false)
        );

        section.getChildren().addAll(title, questsList);
        return section;
    }

    private HBox createQuestItem(String questTitle, String sub, double progress, String xpReward, boolean completed) {
        HBox row = new HBox(14);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 14; -fx-background-radius: 14; -fx-padding: 12 16;");

        Label check = new Label(completed ? "✓" : "○");
        check.setStyle(completed ?
                "-fx-font-size: 16px; -fx-font-weight: 900; -fx-text-fill: #047857; -fx-background-color: #ECFDF5; -fx-padding: 4 10; -fx-background-radius: 10;" :
                "-fx-font-size: 16px; -fx-font-weight: 900; -fx-text-fill: #94A3B8; -fx-background-color: #F1F5F9; -fx-padding: 4 10; -fx-background-radius: 10;");

        VBox textCol = new VBox(2);
        Label t = new Label(questTitle);
        t.setStyle("-fx-font-size: 13px; -fx-font-weight: 700; -fx-text-fill: #0F172A;");
        Label s = new Label(sub);
        s.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");
        textCol.getChildren().addAll(t, s);
        HBox.setHgrow(textCol, Priority.ALWAYS);

        ProgressBar pb = new ProgressBar(progress);
        pb.setPrefWidth(120);
        pb.setStyle("-fx-accent: #2563EB;");

        Label rewardPill = new Label(xpReward);
        rewardPill.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-weight: 800; -fx-padding: 4 10; -fx-background-radius: 10; -fx-font-size: 11px;");

        row.getChildren().addAll(check, textCol, pb, rewardPill);
        return row;
    }

    private VBox buildBadgesShowcase() {
        VBox section = new VBox(14);
        section.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 24;");

        Label title = new Label("Insignes & Trophées Débloqués");
        title.setStyle("-fx-font-size: 16px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        FlowPane flow = new FlowPane(16, 16);
        for (BadgeItem b : badges) {
            flow.getChildren().add(createBadgeCard(b));
        }

        section.getChildren().addAll(title, flow);
        return section;
    }

    private VBox createBadgeCard(BadgeItem b) {
        VBox card = new VBox(8);
        card.setAlignment(Pos.CENTER);
        card.setPrefWidth(190);
        card.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 16; -fx-background-radius: 16; -fx-padding: 16;");

        ImageView icon = loadIcon(b.getIconPath(), 48, 48);
        if (icon == null) icon = loadIcon("/icons/gamification.png", 48, 48);

        Label name = new Label(b.getTitle());
        name.setStyle("-fx-font-size: 12px; -fx-font-weight: 800; -fx-text-fill: #0F172A; -fx-alignment: center;");
        name.setWrapText(true);

        Label desc = new Label(b.getDescription());
        desc.setStyle("-fx-font-size: 10.5px; -fx-text-fill: #64748B; -fx-alignment: center;");
        desc.setWrapText(true);

        Label xp = new Label("+" + b.getXpValue() + " XP");
        xp.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #047857; -fx-font-weight: 800; -fx-padding: 2 8; -fx-background-radius: 8; -fx-font-size: 10px;");

        if (icon != null) card.getChildren().add(icon);
        card.getChildren().addAll(name, desc, xp);
        return card;
    }

    private VBox buildLeaderboardSection() {
        VBox section = new VBox(12);
        section.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 24;");

        Label title = new Label("Classement de la Promotion · Licence 3 ICT4D");
        title.setStyle("-fx-font-size: 16px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        VBox list = new VBox(8);
        list.getChildren().addAll(
                createLeaderboardRow("🥇", "Nghomsi Ravel (Vous)", "1 450 XP", "14 Jours Streak", true),
                createLeaderboardRow("🥈", "Kamdem Cedric", "1 380 XP", "12 Jours Streak", false),
                createLeaderboardRow("🥉", "Fosso Audrey", "1 250 XP", "10 Jours Streak", false),
                createLeaderboardRow("4.", "Tchinda Vanessa", "1 120 XP", "8 Jours Streak", false),
                createLeaderboardRow("5.", "Ndongo Fabrice", "980 XP", "6 Jours Streak", false)
        );

        section.getChildren().addAll(title, list);
        return section;
    }

    private HBox createLeaderboardRow(String rank, String name, String xp, String streak, boolean isUser) {
        HBox row = new HBox(14);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setStyle(isUser ?
                "-fx-background-color: #EFF6FF; -fx-border-color: #93C5FD; -fx-border-radius: 12; -fx-background-radius: 12; -fx-padding: 10 14;" :
                "-fx-background-color: #F8FAFC; -fx-border-color: #F1F5F9; -fx-border-radius: 12; -fx-background-radius: 12; -fx-padding: 10 14;");

        Label r = new Label(rank);
        r.setStyle("-fx-font-size: 15px; -fx-font-weight: 900;");

        Label n = new Label(name);
        n.setStyle(isUser ? "-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #1D4ED8;" : "-fx-font-size: 13px; -fx-font-weight: 600; -fx-text-fill: #334155;");
        HBox.setHgrow(n, Priority.ALWAYS);

        Label s = new Label("🔥 " + streak);
        s.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #B45309; -fx-font-weight: 700;");

        Label x = new Label(xp);
        x.setStyle("-fx-font-size: 13px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");

        row.getChildren().addAll(r, n, s, x);
        return row;
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
