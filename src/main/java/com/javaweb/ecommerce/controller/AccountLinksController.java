package com.javaweb.ecommerce.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.javaweb.ecommerce.common.ApiResponse;
import com.javaweb.ecommerce.entity.User;
import com.javaweb.ecommerce.service.AccountLinks;
import com.javaweb.ecommerce.service.AccountMail;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AccountLinksController {
    private final AccountLinks links;
    private final AccountMail mail;

    public record EmailRequest(@NotBlank @Email @Size(max = 255) String email) {}
    public record TokenRequest(@NotBlank @Size(max = 128) String token) {}
    public record ResetRequest(@NotBlank @Size(max = 128) String token,
            @NotBlank @Size(min = 6, max = 72) String newPassword, @NotBlank String confirmPassword) {}
    public record EmailStatus(boolean verified, boolean mailAvailable) {}

    @GetMapping("/email-status")
    public ApiResponse<EmailStatus> status(@AuthenticationPrincipal User user) {
        return ApiResponse.success(new EmailStatus(user.isEmailVerified(), mail.available()));
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resend(@AuthenticationPrincipal User user) {
        links.requestVerification(user.getEmail());
        return ApiResponse.success(null);
    }

    @PostMapping("/verify-email")
    public ApiResponse<Void> verify(@AuthenticationPrincipal User user, @Valid @RequestBody TokenRequest request) {
        links.verify(user.getId(), request.token());
        return ApiResponse.success(null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgot(@Valid @RequestBody EmailRequest request) {
        links.requestReset(request.email().trim());
        return ApiResponse.success(null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> reset(@Valid @RequestBody ResetRequest request) {
        links.reset(request.token(), request.newPassword(), request.confirmPassword());
        return ApiResponse.success(null);
    }
}
