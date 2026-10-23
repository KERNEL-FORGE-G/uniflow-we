package cm.uniflow.desktop.models;

public class RoomItem {
    private String id;
    private String name;
    private String type;
    private String building;
    private int capacity;
    private String equipment;
    private String status; // LIBRE, OCCUPÉ, RÉSERVÉ
    private String currentCourse;

    public RoomItem() {}

    public RoomItem(String id, String name, String building, int capacity, String status, String currentCourse) {
        this(id, name, name.toLowerCase().contains("amphi") ? "Amphithéâtre" : "Laboratoire", building, capacity, "Vidéoprojecteur HD, Climatisation, WiFi, Sentinelle IoT", status, currentCourse);
    }

    public RoomItem(String id, String name, String type, String building, int capacity, String equipment, String status, String currentCourse) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.building = building;
        this.capacity = capacity;
        this.equipment = equipment;
        this.status = status;
        this.currentCourse = currentCourse;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type != null ? type : (name.toLowerCase().contains("amphi") ? "Amphithéâtre" : "Salle TP"); }
    public String getBuilding() { return building; }
    public int getCapacity() { return capacity; }
    public String getEquipment() { return equipment != null ? equipment : "Vidéoprojecteur HD, WiFi Campus, Caméra Sentinelle"; }
    public String getStatus() { return status; }
    public String getCurrentCourse() { return currentCourse; }
}
