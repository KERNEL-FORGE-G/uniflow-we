package cm.uniflow.desktop.ui.components;

import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

public class HeroHeader extends HBox {

    public HeroHeader(String badgeText, String titleText, String subtitleText, String imageResourcePath, String stat1Val, String stat1Label, String stat2Val, String stat2Label) {
        setAlignment(Pos.CENTER_LEFT);
        setSpacing(24);
        getStyleClass().add("hero-bento");

        VBox left = new VBox(12);
        HBox.setHgrow(left, Priority.ALWAYS);

        Label badge = new Label(badgeText);
        badge.getStyleClass().add("hero-badge");

        Label title = new Label(titleText);
        title.getStyleClass().add("hero-title");
        title.setWrapText(true);

        Label subtitle = new Label(subtitleText);
        subtitle.getStyleClass().add("hero-subtitle");
        subtitle.setWrapText(true);

        HBox statsBox = new HBox(14);
        statsBox.setAlignment(Pos.CENTER_LEFT);

        if (stat1Val != null) {
            statsBox.getChildren().add(createMicroStat(stat1Val, stat1Label));
        }
        if (stat2Val != null) {
            statsBox.getChildren().add(createMicroStat(stat2Val, stat2Label));
        }

        left.getChildren().addAll(badge, title, subtitle, statsBox);
        getChildren().add(left);

        if (imageResourcePath != null) {
            try {
                var url = getClass().getResource(imageResourcePath);
                if (url != null) {
                    ImageView iv = new ImageView(new Image(url.toExternalForm(), 110, 110, true, true));
                    iv.setFitWidth(110);
                    iv.setFitHeight(110);
                    getChildren().add(iv);
                }
            } catch (Exception ignored) {}
        }
    }

    private VBox createMicroStat(String val, String lbl) {
        VBox box = new VBox(2);
        box.getStyleClass().add("hero-micro-card");
        Label v = new Label(val);
        v.setStyle("-fx-font-size: 16px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF;");
        Label l = new Label(lbl);
        l.setStyle("-fx-font-size: 10.5px; -fx-text-fill: #E2E8F0; -fx-font-weight: 500;");
        box.getChildren().addAll(v, l);
        return box;
    }
}
