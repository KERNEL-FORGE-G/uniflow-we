package cm.uniflow.desktop.models;

public class ZBook {
    private String id;
    private String title;
    private String author;
    private String category;
    private int pages;
    private int year;
    private String format; // PDF, EPUB
    private String fileSize;
    private String coverPath;

    public ZBook() {}

    public ZBook(String id, String title, String author, String category, int pages, int year, String format, String fileSize, String coverPath) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.pages = pages;
        this.year = year;
        this.format = format;
        this.fileSize = fileSize;
        this.coverPath = coverPath;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getCategory() { return category; }
    public int getPages() { return pages; }
    public int getYear() { return year; }
    public String getFormat() { return format; }
    public String getFileSize() { return fileSize; }
    public String getCoverPath() { return coverPath; }
}
