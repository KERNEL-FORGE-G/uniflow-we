package cm.uniflow.desktop.ui.views;

import javafx.animation.*;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.shape.Circle;
import javafx.util.Duration;

import java.util.ArrayList;
import java.util.List;

public class OnboardingView extends StackPane {

    private static class Slide {
        String tag;
        String title;
        String subtitle;
        String imagePath;

        Slide(String tag, String title, String subtitle, String imagePath) {
            this.tag = tag;
            this.title = title;
            this.subtitle = subtitle;
            this.imagePath = imagePath;
        }
    }

    private final List<Slide> slides = new ArrayList<>();
    private int currentIndex = 0;

    private final VBox slideContent = new VBox(20);
    private final Label tagLabel = new Label();
    private final Label titleLabel = new Label();
    private final Label subtitleLabel = new Label();
    private final ImageView imageView = new ImageView();
    private final HBox dotsBox = new HBox(8);
    private final Button nextBtn = new Button("Suivant →");
    private final Button skipBtn = new Button("Passer l'introduction");

    private final Runnable onComplete;

    public OnboardingView(Runnable onComplete) {
        this.onComplete = onComplete;
        setAlignment(Pos.CENTER);
        setStyle("-fx-background-color: linear-gradient(to bottom right, #0B132B 0%, #1E3A8A 60%, #0D9488 100%);");

        slides.add(new Slide(
                "PILIER 01 · EMPLOIS DU TEMPS LMD",
                "Bienvenue sur UniFlow\nVotre Campus Connecté en Temps Réel",
                "Fini les plannings perdus ou obsolètes. Suivez vos cours magistraux, travaux dirigés et salles en direct avec synchronisation locale 100% hors-ligne.",
                "/onboarding/onboarding_1_welcome.jpg"
        ));
        slides.add(new Slide(
                "PILIER 02 · BIBLIOTHÈQUE & RESSOURCES",
                "Z-Library Campus & Syllabi\nTous vos Manuels Académiques Illimités",
                "Consultez les supports de cours des enseignants, manuels de référence en informatique, mathématiques et sciences sans aucune connexion requise.",
                "/onboarding/onboarding_2_courses.jpg"
        ));
        slides.add(new Slide(
                "PILIER 03 · ÉMARGEMENT SÉCURISÉ",
                "Pass Présence Cryptographique\nConnecté aux Bornes Sentinelle IoT",
                "Validez votre assiduité en un éclair grâce au QR code dynamique et aux bornes connectées biométriques déployées aux accès des amphithéâtres.",
                "/onboarding/onboarding_3_community.jpg"
        ));
        slides.add(new Slide(
                "PILIER 04 · COMMUNICATION & SOUVERAINETÉ",
                "UniMail @uniflow.cm &\nExcellence Technologique KERNEL FORGE",
                "Bénéficiez d'une messagerie officielle chiffrée, de salons de visioconférence HD et d'une souveraineté totale de vos données étudiantes.",
                "/onboarding/onboarding_4_forge.jpg"
        ));

        buildUI();
        displaySlide(0, false);
    }

    private void buildUI() {
        // Main Bento Card in Center
        VBox card = new VBox(24);
        card.setMaxWidth(960);
        card.setMaxHeight(640);
        card.setAlignment(Pos.CENTER);
        card.setStyle("-fx-background-color: rgba(255, 255, 255, 0.95); -fx-background-radius: 28; -fx-padding: 36 44; -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.35), 30, 0, 0, 10);");

        // Top Header
        HBox topBar = new HBox();
        topBar.setAlignment(Pos.CENTER_LEFT);

        HBox brand = new HBox(10);
        brand.setAlignment(Pos.CENTER_LEFT);
        try {
            var url = getClass().getResource("/brand/uniflow_logo_final.png");
            if (url != null) {
                ImageView logo = new ImageView(new Image(url.toExternalForm(), 32, 32, true, true));
                brand.getChildren().add(logo);
            }
        } catch (Exception ignored) {}
        Label brandTxt = new Label("UniFlow");
        brandTxt.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");
        Label brandSub = new Label("· KERNEL FORGE");
        brandSub.setStyle("-fx-font-size: 13px; -fx-text-fill: #64748B; -fx-font-weight: 600;");
        brand.getChildren().addAll(brandTxt, brandSub);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        skipBtn.setStyle("-fx-background-color: transparent; -fx-text-fill: #64748B; -fx-font-weight: 600; -fx-cursor: hand;");
        skipBtn.setOnAction(e -> onComplete.run());

        topBar.getChildren().addAll(brand, spacer, skipBtn);
        card.getChildren().add(topBar);

        // Slide Content (Horizontal Split: Image on Left / Text on Right)
        HBox body = new HBox(36);
        body.setAlignment(Pos.CENTER);
        VBox.setVgrow(body, Priority.ALWAYS);

        // Left : Image Frame
        VBox imgFrame = new VBox();
        imgFrame.setAlignment(Pos.CENTER);
        imgFrame.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 20; -fx-background-radius: 20; -fx-padding: 8;");
        imageView.setFitWidth(420);
        imageView.setFitHeight(300);
        imageView.setPreserveRatio(true);
        imgFrame.getChildren().add(imageView);

        // Right : Text Details
        VBox textBox = new VBox(14);
        textBox.setAlignment(Pos.CENTER_LEFT);
        HBox.setHgrow(textBox, Priority.ALWAYS);

        tagLabel.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-size: 11px; -fx-font-weight: 800; -fx-padding: 4 12; -fx-background-radius: 12;");

        titleLabel.setStyle("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: #0F172A; -fx-line-spacing: 2;");
        titleLabel.setWrapText(true);

        subtitleLabel.setStyle("-fx-font-size: 13.5px; -fx-text-fill: #475569; -fx-line-spacing: 4;");
        subtitleLabel.setWrapText(true);

        textBox.getChildren().addAll(tagLabel, titleLabel, subtitleLabel);

        body.getChildren().addAll(imgFrame, textBox);
        card.getChildren().add(body);

        // Bottom Navigation Bar
        HBox bottomBar = new HBox();
        bottomBar.setAlignment(Pos.CENTER_LEFT);

        dotsBox.setAlignment(Pos.CENTER_LEFT);

        Region botSpacer = new Region();
        HBox.setHgrow(botSpacer, Priority.ALWAYS);

        nextBtn.getStyleClass().add("btn-primary");
        nextBtn.setStyle("-fx-font-size: 14px; -fx-padding: 10 24; -fx-background-radius: 14;");
        nextBtn.setOnAction(e -> {
            if (currentIndex < slides.size() - 1) {
                displaySlide(currentIndex + 1, true);
            } else {
                onComplete.run();
            }
        });

        bottomBar.getChildren().addAll(dotsBox, botSpacer, nextBtn);
        card.getChildren().add(bottomBar);

        getChildren().add(card);
    }

    private void displaySlide(int index, boolean animate) {
        this.currentIndex = index;
        Slide slide = slides.get(index);

        if (animate) {
            FadeTransition fade = new FadeTransition(Duration.millis(250), imageView);
            fade.setFromValue(1.0);
            fade.setToValue(0.2);
            fade.setOnFinished(e -> {
                updateSlideData(slide);
                FadeTransition fadeIn = new FadeTransition(Duration.millis(250), imageView);
                fadeIn.setFromValue(0.2);
                fadeIn.setToValue(1.0);
                fadeIn.play();
            });
            fade.play();
        } else {
            updateSlideData(slide);
        }

        updateDots();

        if (index == slides.size() - 1) {
            nextBtn.setText("Commencer l'expérience UniFlow 🚀");
            skipBtn.setVisible(false);
        } else {
            nextBtn.setText("Suivant →");
            skipBtn.setVisible(true);
        }
    }

    private void updateSlideData(Slide slide) {
        tagLabel.setText(slide.tag);
        titleLabel.setText(slide.title);
        subtitleLabel.setText(slide.subtitle);

        try {
            var url = getClass().getResource(slide.imagePath);
            if (url != null) {
                imageView.setImage(new Image(url.toExternalForm(), 420, 300, true, true));
            }
        } catch (Exception ignored) {}
    }

    private void updateDots() {
        dotsBox.getChildren().clear();
        for (int i = 0; i < slides.size(); i++) {
            HBox dot = new HBox();
            if (i == currentIndex) {
                dot.setPrefSize(28, 8);
                dot.setStyle("-fx-background-color: #1E3A8A; -fx-background-radius: 4;");
            } else {
                dot.setPrefSize(8, 8);
                dot.setStyle("-fx-background-color: #CBD5E1; -fx-background-radius: 4;");
            }
            int finalI = i;
            dot.setOnMouseClicked(e -> displaySlide(finalI, true));
            dot.setStyle(dot.getStyle() + "; -fx-cursor: hand;");
            dotsBox.getChildren().add(dot);
        }
    }
}
