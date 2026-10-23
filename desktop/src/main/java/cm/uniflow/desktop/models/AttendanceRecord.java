package cm.uniflow.desktop.models;

public class AttendanceRecord {
    private String id;
    private String courseCode;
    private String courseTitle;
    private String date;
    private String time;
    private String status; // PRÉSENT, ABSENT, EN RETARD, JUSTIFIÉ
    private boolean verifiedByQr;

    public AttendanceRecord() {}

    public AttendanceRecord(String id, String courseCode, String courseTitle, String date, String time, String status, boolean verifiedByQr) {
        this.id = id;
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.date = date;
        this.time = time;
        this.status = status;
        this.verifiedByQr = verifiedByQr;
    }

    public String getId() { return id; }
    public String getCourseCode() { return courseCode; }
    public String getCourseTitle() { return courseTitle; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public String getStatus() { return status; }
    public boolean isVerifiedByQr() { return verifiedByQr; }
}
