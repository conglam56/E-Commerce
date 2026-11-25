package com.javaweb.ecommerce.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.repository.UserRepository;

class DemoAdminConfigTest {

    @Test
    void promotesOnlyConfiguredAccountAndPreservesPassword() throws Exception {
        UserRepository users = mock(UserRepository.class);
        User user = User.builder().email("admin@example.test").role("CUSTOMER")
                .status("ACTIVE").password("existing-bcrypt-hash").build();
        when(users.findByEmail("admin@example.test")).thenReturn(Optional.of(user));

        new DemoAdminConfig().promoteDemoAdmin(users, "admin@example.test").run(null);

        assertEquals("ADMIN", user.getRole());
        assertEquals("existing-bcrypt-hash", user.getPassword());
        verify(users).save(user);
    }

    @Test
    void repeatStartupDoesNotRewriteAdminAccount() throws Exception {
        UserRepository users = mock(UserRepository.class);
        User user = User.builder().email("admin@example.test").role("ADMIN").status("ACTIVE").build();
        when(users.findByEmail("admin@example.test")).thenReturn(Optional.of(user));

        new DemoAdminConfig().promoteDemoAdmin(users, "admin@example.test").run(null);

        verify(users, never()).save(any());
    }

    @Test
    void inactiveAccountCannotBecomeAdmin() {
        UserRepository users = mock(UserRepository.class);
        User user = User.builder().role("CUSTOMER").status("INACTIVE").build();
        when(users.findByEmail("admin@example.test")).thenReturn(Optional.of(user));

        assertThrows(IllegalStateException.class,
                () -> new DemoAdminConfig().promoteDemoAdmin(users, "admin@example.test").run(null));

        assertEquals("CUSTOMER", user.getRole());
        verify(users, never()).save(any());
    }
}
