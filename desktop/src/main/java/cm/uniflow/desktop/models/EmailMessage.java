package cm.uniflow.desktop.models;

public class EmailMessage {
    private String id;
    private String sender;
    private String recipient;
    private String subject;
    private String snippet;
    private String body;
    private String date;
    private boolean read;
    private boolean starred;
    private boolean signedOfficially;
    private String folder; // INBOX, SENT, STARRED, DRAFTS, TRASH

    public EmailMessage() {}

    public EmailMessage(String id, String sender, String recipient, String subject, String snippet, String body, String date, boolean read, boolean starred, boolean signedOfficially, String folder) {
        this.id = id;
        this.sender = sender;
        this.recipient = recipient;
        this.subject = subject;
        this.snippet = snippet;
        this.body = body;
        this.date = date;
        this.read = read;
        this.starred = starred;
        this.signedOfficially = signedOfficially;
        this.folder = folder;
    }

    public String getId() { return id; }
    public String getSender() { return sender; }
    public String getRecipient() { return recipient; }
    public String getSubject() { return subject; }
    public String getSnippet() { return snippet; }
    public String getBody() { return body; }
    public String getDate() { return date; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public boolean isStarred() { return starred; }
    public void setStarred(boolean starred) { this.starred = starred; }
    public boolean isSignedOfficially() { return signedOfficially; }
    public String getFolder() { return folder; }
    public void setFolder(String folder) { this.folder = folder; }
}
