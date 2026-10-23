package cm.uniflow.desktop.models;

public class Course {
    private String id;
    private String code;
    private String title;
    private int credits;
    private String teacher;
    private String room;
    private int hours;
    private double progress;
    private String color;

    public Course() {}

    public Course(String id, String code, String title, int credits, String teacher, String room, int hours, double progress, String color) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.credits = credits;
        this.teacher = teacher;
        this.room = room;
        this.hours = hours;
        this.progress = progress;
        this.color = color;
    }

    public String getId() { return id; }
    public String getCode() { return code; }
    public String getTitle() { return title; }
    public int getCredits() { return credits; }
    public String getTeacher() { return teacher; }
    public String getRoom() { return room; }
    public int getHours() { return hours; }
    public double getProgress() { return progress; }
    public String getColor() { return color != null ? color : "#1E3A8A"; }
}
