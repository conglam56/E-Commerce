package com.javaweb.ecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StorefrontConfig implements WebMvcConfigurer {

    public static final String[] PAGE_ROUTES = {
            "/login", "/register", "/profile", "/cart", "/checkout", "/orders",
            "/products/{id}", "/admin/products", "/admin/orders"
    };

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String route : PAGE_ROUTES) {
            registry.addViewController(route).setViewName("forward:/index.html");
        }
    }
}
