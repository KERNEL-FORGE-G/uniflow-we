package cm.uniflow.desktop;

import cm.uniflow.desktop.config.AppConfig;
import cm.uniflow.desktop.models.Course;
import cm.uniflow.desktop.models.ScheduleItem;
import cm.uniflow.desktop.models.User;
import cm.uniflow.desktop.services.MockDataService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AppConfigTest {

    @Test
    public void testUserInitializationAndMail() {
        User user = new User("u1", "Jean Paul", "jean.paul@uy1.cm", "STUDENT", "21T1000", "ICT4D", "L3");
        assertEquals("jean.paul@uniflow.cm", user.getUniflowMail());
        assertEquals("Jean Paul", user.getName());
        assertEquals("STUDENT", user.getRole());
        assertFalse(user.isAdmin());
    }

    @Test
    public void testAdminRole() {
        User admin = new User("a1", "Admin", "admin@uniflow.cm", "ADMIN", "ADM01", "Administration", "Direction");
        assertTrue(admin.isAdmin());
    }

    @Test
    public void testMockDataCourses() {
        List<Course> courses = MockDataService.getSampleCourses();
        assertNotNull(courses);
        assertFalse(courses.isEmpty());
        assertTrue(courses.size() >= 5);
        Course c1 = courses.get(0);
        assertNotNull(c1.getCode());
        assertNotNull(c1.getTitle());
        assertTrue(c1.getCredits() > 0);
    }

    @Test
    public void testMockDataSchedule() {
        List<ScheduleItem> schedule = MockDataService.getSampleSchedule();
        assertNotNull(schedule);
        assertFalse(schedule.isEmpty());
        assertTrue(schedule.stream().anyMatch(s -> "INF3055".equals(s.getCourseCode())));
    }

    @Test
    public void testAppConfigConstants() {
        assertEquals("UniFlow Desktop", AppConfig.APP_NAME);
        assertEquals("KERNEL FORGE", AppConfig.ORG_NAME);
        assertTrue(AppConfig.APPWRITE_ENDPOINT.startsWith("https://"));
    }
}
