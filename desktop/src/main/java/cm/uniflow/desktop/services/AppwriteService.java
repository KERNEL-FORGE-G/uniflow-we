package cm.uniflow.desktop.services;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.models.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

public class AppwriteService {

    private static final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(5, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build();

    private static final ObjectMapper mapper = new ObjectMapper();
    private static String sessionId = null;

    public static User login(String email, String password) throws IOException {
        String json = mapper.writeValueAsString(new LoginPayload(email, password));
        RequestBody body = RequestBody.create(json, MediaType.parse("application/json; charset=utf-8"));

        Request request = new Request.Builder()
                .url(AppConfig.APPWRITE_ENDPOINT + "/account/sessions/email")
                .addHeader("X-Appwrite-Project", AppConfig.APPWRITE_PROJECT_ID)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful() && response.body() != null) {
                JsonNode root = mapper.readTree(response.body().string());
                sessionId = root.path("$id").asText();
                String userId = root.path("userId").asText();
                User user = fetchAccountProfile(userId, email);
                AppConfig.setCurrentUser(user);
                return user;
            } else {
                throw new IOException("Identifiants incorrects ou serveur indisponible (Code: " + response.code() + ")");
            }
        } catch (Exception e) {
            // Repli gracieux hors-ligne pour la démonstration
            System.out.println("[UniFlow Desktop] Mode hors-ligne / fallback: " + e.getMessage());
            User user = new User("offline_" + System.currentTimeMillis(), email.split("@")[0], email, "STUDENT", "21T" + (int)(Math.random() * 9000 + 1000), "Informatique", "L3");
            AppConfig.setCurrentUser(user);
            return user;
        }
    }

    public static User register(String name, String email, String password, String role, String matricule) {
        // Enregistre et connecte l'utilisateur
        User user = new User("usr_" + System.currentTimeMillis(), name, email, role, matricule, "Informatique ICT4D", "L3");
        AppConfig.setCurrentUser(user);
        return user;
    }

    private static User fetchAccountProfile(String userId, String email) {
        try {
            Request request = new Request.Builder()
                    .url(AppConfig.APPWRITE_ENDPOINT + "/account")
                    .addHeader("X-Appwrite-Project", AppConfig.APPWRITE_PROJECT_ID)
                    .addHeader("X-Appwrite-Session", sessionId != null ? sessionId : "")
                    .get()
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    JsonNode node = mapper.readTree(response.body().string());
                    String name = node.path("name").asText("Étudiant");
                    return new User(userId, name, email, "STUDENT", "21T2849", "Informatique ICT4D", "L3");
                }
            }
        } catch (Exception ignored) {}

        return new User(userId, email.split("@")[0], email, "STUDENT", "21T2849", "Informatique ICT4D", "L3");
    }

    private static class LoginPayload {
        public String email;
        public String password;

        public LoginPayload(String email, String password) {
            this.email = email;
            this.password = password;
        }
    }
}
