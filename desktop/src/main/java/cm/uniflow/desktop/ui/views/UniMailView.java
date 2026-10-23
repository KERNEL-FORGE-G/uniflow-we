package cm.uniflow.desktop.ui.views;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.models.EmailMessage;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.services.MockDataService;
import cm.uniflow.desktop.ui.components.HeroHeader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.util.List;

public class UniMailView extends VBox {

    private final List<EmailMessage> emails = MockDataService.getSampleEmails();
    private EmailMessage selectedMessage;
    private final VBox emailDetailPane = new VBox(14);
    private final VBox messageListContainer = new VBox(8);

    public UniMailView() {
        setSpacing(16);
        setPadding(new Insets(20));

        User user = AppConfig.getCurrentUser();
        String mailAddr = user != null ? user.getUniflowMail() : "etudiant.uy1@uniflow.cm";

        HeroHeader hero = new HeroHeader(
                "Messagerie Académique Chiffrée & Certifiée",
                "UniMail · " + mailAddr,
                "Courrier électronique officiel signé numériquement par UniFlow · Lié au cycle de vie de votre compte étudiant",
                "/icons/messages.png",
                "3 Nouveaux", "Boîte de réception",
                "Signé 256-bit", "Certificat UniFlow"
        );
        getChildren().add(hero);

        // Toolbar
        HBox bar = new HBox(12);
        bar.setAlignment(Pos.CENTER_LEFT);

        Button composeBtn = new Button("✍️ Nouveau message");
        composeBtn.getStyleClass().add("btn-primary");
        composeBtn.setOnAction(e -> showComposeDialog());

        TextField search = new TextField();
        search.setPromptText("Rechercher dans vos messages ou par expéditeur...");
        search.setPrefWidth(320);
        search.getStyleClass().add("search-field");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Button refreshBtn = new Button("🔄 Actualiser");
        refreshBtn.getStyleClass().add("btn-secondary");

        bar.getChildren().addAll(composeBtn, search, sp, refreshBtn);
        getChildren().add(bar);

        // Split-pane layout
        SplitPane splitPane = new SplitPane();
        VBox.setVgrow(splitPane, Priority.ALWAYS);

        // Left : Folders + Mail list
        VBox leftPane = new VBox(10);
        leftPane.setPadding(new Insets(10));
        leftPane.setPrefWidth(360);

        // Folder Tabs
        HBox folderTabs = new HBox(6);
        Button inboxTab = createFolderButton("📥 Réception", true);
        Button sentTab = createFolderButton("📤 Envoyés", false);
        Button starredTab = createFolderButton("⭐ Favoris", false);
        folderTabs.getChildren().addAll(inboxTab, sentTab, starredTab);
        leftPane.getChildren().add(folderTabs);

        // Scrollable message list
        ScrollPane listScroll = new ScrollPane(messageListContainer);
        listScroll.setFitToWidth(true);
        listScroll.getStyleClass().add("scroll-pane");
        VBox.setVgrow(listScroll, Priority.ALWAYS);
        leftPane.getChildren().add(listScroll);

        // Right : Message Details
        emailDetailPane.setPadding(new Insets(20));
        emailDetailPane.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #E2E8F0; -fx-border-radius: 16; -fx-background-radius: 16;");
        ScrollPane detailScroll = new ScrollPane(emailDetailPane);
        detailScroll.setFitToWidth(true);
        detailScroll.getStyleClass().add("scroll-pane");

        splitPane.getItems().addAll(leftPane, detailScroll);
        splitPane.setDividerPositions(0.42);

        getChildren().add(splitPane);

        renderMessageList();
        if (!emails.isEmpty()) {
            selectEmail(emails.get(0));
        }
    }

    private Button createFolderButton(String text, boolean active) {
        Button b = new Button(text);
        b.setStyle(active
                ? "-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-weight: 700; -fx-background-radius: 10; -fx-padding: 6 12;"
                : "-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-weight: 600; -fx-background-radius: 10; -fx-padding: 6 12;");
        return b;
    }

    private void renderMessageList() {
        messageListContainer.getChildren().clear();
        for (EmailMessage msg : emails) {
            VBox item = new VBox(4);
            item.setStyle("-fx-background-color: " + (msg == selectedMessage ? "#EFF6FF" : "#F8FAFC") + ";"
                    + "-fx-border-color: " + (msg == selectedMessage ? "#93C5FD" : "#E2E8F0") + ";"
                    + "-fx-border-radius: 12; -fx-background-radius: 12; -fx-padding: 12; -fx-cursor: hand;");

            HBox top = new HBox(8);
            Label sender = new Label(msg.getSender());
            sender.setStyle("-fx-font-weight: 700; -fx-font-size: 12px; -fx-text-fill: #1E3A8A;");
            Region sp = new Region();
            HBox.setHgrow(sp, Priority.ALWAYS);
            Label date = new Label(msg.getDate());
            date.setStyle("-fx-font-size: 10.5px; -fx-text-fill: #94A3B8;");
            top.getChildren().addAll(sender, sp, date);

            Label sub = new Label(msg.getSubject());
            sub.setStyle("-fx-font-weight: " + (msg.isRead() ? "600" : "800") + "; -fx-font-size: 12.5px; -fx-text-fill: #0F172A;");

            Label snip = new Label(msg.getSnippet());
            snip.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

            item.getChildren().addAll(top, sub, snip);
            item.setOnMouseClicked(e -> selectEmail(msg));

            messageListContainer.getChildren().add(item);
        }
    }

    private void selectEmail(EmailMessage msg) {
        this.selectedMessage = msg;
        msg.setRead(true);
        renderMessageList();

        emailDetailPane.getChildren().clear();

        // Header
        HBox certBadge = new HBox(6);
        certBadge.setAlignment(Pos.CENTER_LEFT);
        certBadge.setStyle("-fx-background-color: #ECFDF5; -fx-border-color: #A7F3D0; -fx-border-radius: 10; -fx-background-radius: 10; -fx-padding: 4 10;");
        Label cert = new Label("✓ Message Officiel Signé par UniFlow PKI & Horodaté");
        cert.setStyle("-fx-text-fill: #047857; -fx-font-weight: 700; -fx-font-size: 11px;");
        certBadge.getChildren().add(cert);

        Label subject = new Label(msg.getSubject());
        subject.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");
        subject.setWrapText(true);

        VBox senderBox = new VBox(2);
        senderBox.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 10; -fx-background-radius: 10; -fx-padding: 10;");
        Label from = new Label("De : " + msg.getSender());
        from.setStyle("-fx-font-weight: 700; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;");
        Label to = new Label("À : " + msg.getRecipient() + " · " + msg.getDate());
        to.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");
        senderBox.getChildren().addAll(from, to);

        TextArea bodyArea = new TextArea(msg.getBody());
        bodyArea.setEditable(false);
        bodyArea.setWrapText(true);
        bodyArea.setPrefRowCount(10);
        bodyArea.setStyle("-fx-background-color: transparent; -fx-border-color: transparent; -fx-font-size: 13px;");

        // Action Buttons
        HBox actions = new HBox(10);
        Button replyBtn = new Button("↩️ Répondre");
        replyBtn.getStyleClass().add("btn-primary");
        Button forwardBtn = new Button("➡️ Transférer");
        forwardBtn.getStyleClass().add("btn-secondary");
        Button printBtn = new Button("🖨️ Imprimer / PDF");
        printBtn.getStyleClass().add("btn-secondary");

        actions.getChildren().addAll(replyBtn, forwardBtn, printBtn);

        emailDetailPane.getChildren().addAll(certBadge, subject, senderBox, bodyArea, new Separator(), actions);
    }

    private void showComposeDialog() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Nouveau Message Académique — UniMail");
        dialog.setHeaderText("Rédiger un courriel officiel signé par UniFlow");

        VBox form = new VBox(10);
        form.setPadding(new Insets(20));

        TextField toField = new TextField();
        toField.setPromptText("Destinataire (ex: secretariat.informatique@uniflow.cm)");

        TextField subField = new TextField();
        subField.setPromptText("Objet du message");

        TextArea msgArea = new TextArea();
        msgArea.setPromptText("Votre message officiel...");
        msgArea.setPrefRowCount(8);

        form.getChildren().addAll(
                new Label("Destinataire :"), toField,
                new Label("Objet :"), subField,
                new Label("Corps du message :"), msgArea
        );

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        dialog.showAndWait();
    }
}
