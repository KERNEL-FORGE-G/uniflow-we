package cm.uniflow.desktop.models;

public class NewsItem {
    private String id;
    private String title;
    private String category; // Annonces, Pédagogie, Vie de campus, Bourse
    private String content;
    private String author;
    private String date;
    private String imagePath;
    private boolean pinned;
    private String linkUrl;

    public NewsItem() {}

    public NewsItem(String id, String title, String category, String content, String author, String date, String imagePath, boolean pinned, String linkUrl) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.content = content;
        this.author = author;
        this.date = date;
        this.imagePath = imagePath;
        this.pinned = pinned;
        this.linkUrl = linkUrl;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getContent() { return content; }
    public String getAuthor() { return author; }
    public String getDate() { return date; }
    public String getImagePath() { return imagePath; }
    public boolean isPinned() { return pinned; }
    public String getLinkUrl() { return linkUrl; }
}
