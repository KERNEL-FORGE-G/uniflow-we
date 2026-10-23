package cm.uniflow.desktop.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class User {
    private String id;
    private String name;
    private String email;
    private String role; // STUDENT, DELEGATE, TEACHER, ADMIN
    private String matricule;
    private String accountType; // UNIVERSITY, PERSONAL, PLATFORM
    private String university;
    private String faculty;
    private String program;
    private String level;
    private String uniflowMail;

    public User() {
        this.id = "user_default";
        this.name = "Ravel Nghomsi";
        this.email = "ravel.nghomsi@uniflow.cm";
        this.role = "STUDENT";
        this.matricule = "21T2849";
        this.accountType = "UNIVERSITY";
        this.university = "Université de Yaoundé I";
        this.faculty = "Faculté des Sciences";
        this.program = "Informatique (ICT4D)";
        this.level = "L3";
        this.uniflowMail = "ravel.nghomsi@uniflow.cm";
    }

    public User(String id, String name, String email, String role, String matricule, String program, String level) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.matricule = matricule;
        this.accountType = "UNIVERSITY";
        this.university = "Université de Yaoundé I";
        this.faculty = "Faculté des Sciences";
        this.program = program;
        this.level = level;
        this.uniflowMail = email.contains("@uniflow.cm") ? email : email.split("@")[0] + "@uniflow.cm";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getUniflowMail() {
        if (uniflowMail == null && email != null) {
            return email.contains("@uniflow.cm") ? email : email.split("@")[0] + "@uniflow.cm";
        }
        return uniflowMail != null ? uniflowMail : "etudiant.uy1@uniflow.cm";
    }
    public void setUniflowMail(String uniflowMail) { this.uniflowMail = uniflowMail; }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }
}
