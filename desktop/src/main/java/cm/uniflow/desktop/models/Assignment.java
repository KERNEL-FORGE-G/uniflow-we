package cm.uniflow.desktop.models;

public class Assignment {
    private String id;
    private String courseCode;
    private String title;
    private String dueDate;
    private String status; // TO_DO, SUBMITTED, GRADED
    private Double grade; // e.g. 17.5 / 20
    private String description;

    public Assignment() {}

    public Assignment(String id, String courseCode, String title, String dueDate, String status, Double grade, String description) {
        this.id = id;
        this.courseCode = courseCode;
        this.title = title;
        this.dueDate = dueDate;
        this.status = status;
        this.grade = grade;
        this.description = description;
    }

    public String getId() { return id; }
    public String getCourseCode() { return courseCode; }
    public String getTitle() { return title; }
    public String getDueDate() { return dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getGrade() { return grade; }
    public String getDescription() { return description; }
}
