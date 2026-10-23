package cm.uniflow.desktop.models;

public class ScheduleItem {
    private String id;
    private String day; // Lundi, Mardi, Mercredi...
    private String startTime; // "08:00"
    private String endTime;   // "11:00"
    private String courseCode;
    private String courseTitle;
    private String room;
    private String teacher;
    private String type; // CM, TD, TP

    public ScheduleItem() {}

    public ScheduleItem(String id, String day, String startTime, String endTime, String courseCode, String courseTitle, String room, String teacher, String type) {
        this.id = id;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.room = room;
        this.teacher = teacher;
        this.type = type;
    }

    public String getId() { return id; }
    public String getDay() { return day; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public String getCourseCode() { return courseCode; }
    public String getCourseTitle() { return courseTitle; }
    public String getRoom() { return room; }
    public String getTeacher() { return teacher; }
    public String getType() { return type; }
}
