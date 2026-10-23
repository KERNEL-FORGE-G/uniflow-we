package cm.uniflow.desktop.ui.components;

import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.layout.*;

public class BentoCard extends VBox {

    public BentoCard(String titleText, String subtitleText, Node content) {
        setSpacing(12);
        getStyleClass().add("bento-card");

        if (titleText != null || subtitleText != null) {
            VBox head = new VBox(2);
            if (titleText != null) {
                Label title = new Label(titleText);
                title.getStyleClass().add("card-title");
                head.getChildren().add(title);
            }
            if (subtitleText != null) {
                Label sub = new Label(subtitleText);
                sub.getStyleClass().add("card-subtitle");
                head.getChildren().add(sub);
            }
            getChildren().add(head);
        }

        if (content != null) {
            VBox.setVgrow(content, Priority.ALWAYS);
            getChildren().add(content);
        }
    }
}
