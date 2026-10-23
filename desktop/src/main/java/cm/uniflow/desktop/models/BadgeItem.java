package cm.uniflow.desktop.models;

public class BadgeItem {
    private String id;
    private String title;
    private String description;
    private String iconPath;
    private boolean unlocked;
    private int xpValue;

    public BadgeItem() {}

    public BadgeItem(String id, String title, String description, String iconPath, boolean unlocked, int xpValue) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.iconPath = iconPath;
        this.unlocked = unlocked;
        this.xpValue = xpValue;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getIconPath() { return iconPath; }
    public boolean isUnlocked() { return unlocked; }
    public int getXpValue() { return xpValue; }
}
