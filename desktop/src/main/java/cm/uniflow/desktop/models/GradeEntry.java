package cm.uniflow.desktop.models;

public class GradeEntry {
    private String courseCode;
    private String courseTitle;
    private int credits;
    private double caScore;    // Note Contrôle Continu (sur 20)
    private double examScore;  // Note Examen (sur 20)
    private double finalScore; // Moyenne pondérée (sur 20)
    private String status;     // VALIDÉ, NON_VALIDÉ

    public GradeEntry() {}

    public GradeEntry(String courseCode, String courseTitle, int credits, double caScore, double examScore) {
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.credits = credits;
        this.caScore = caScore;
        this.examScore = examScore;
        this.finalScore = Math.round((caScore * 0.3 + examScore * 0.7) * 100.0) / 100.0;
        this.status = this.finalScore >= 10.0 ? "VALIDÉ" : "NON_VALIDÉ";
    }

    public String getCourseCode() { return courseCode; }
    public String getCourseTitle() { return courseTitle; }
    public int getCredits() { return credits; }
    public double getCaScore() { return caScore; }
    public double getExamScore() { return examScore; }
    public double getFinalScore() { return finalScore; }
    public String getStatus() { return status; }
}
