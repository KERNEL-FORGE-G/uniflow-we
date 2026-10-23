package cm.uniflow.desktop.models;

public class DirectoryPerson {
    private String id;
    private String name;
    private String email;
    private String role; // STUDENT, TEACHER, ADMIN, DELEGATE
    private String matricule;
    private String program;
    private String level;
    private String title;
    private String department;
    private String office;

    public DirectoryPerson() {}

    public DirectoryPerson(String id, String name, String email, String role, String matricule, String program, String level) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.matricule = matricule;
        this.program = program;
        this.level = level;
        if ("TEACHER".equalsIgnoreCase(role)) {
            this.title = "Enseignant-Chercheur · Informatique";
            this.department = "Département d'Informatique";
            this.office = "Bureau B204";
        } else if ("DELEGATE".equalsIgnoreCase(role)) {
            this.title = "Délégué de Promotion · " + program + " " + level;
            this.department = "Faculté des Sciences";
            this.office = "Amphi 250";
        } else {
            this.title = "Étudiant · " + program + " " + level;
            this.department = "Faculté des Sciences";
            this.office = "Campus Principal Ngoa-Ekélé";
        }
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getMatricule() { return matricule; }
    public String getProgram() { return program; }
    public String getLevel() { return level; }
    public String getTitle() { return title != null ? title : ("Étudiant · " + program + " " + level); }
    public String getDepartment() { return department != null ? department : "Faculté des Sciences"; }
    public String getOffice() { return office != null ? office : "Campus Ngoa-Ekélé"; }
}
