package cm.uniflow.desktop.models;

public class PaymentItem {
    private String id;
    private String reference;
    private String label;
    private int amount; // in XAF
    private String date;
    private String method; // MTN MoMo, Orange Money, Carte Bancaire
    private String status; // PAYÉ, EN ATTENTE, REJETÉ

    public PaymentItem() {}

    public PaymentItem(String id, String reference, String label, int amount, String date, String method, String status) {
        this.id = id;
        this.reference = reference;
        this.label = label;
        this.amount = amount;
        this.date = date;
        this.method = method;
        this.status = status;
    }

    public String getId() { return id; }
    public String getReference() { return reference; }
    public String getLabel() { return label; }
    public int getAmount() { return amount; }
    public String getDate() { return date; }
    public String getMethod() { return method; }
    public String getStatus() { return status; }
}
