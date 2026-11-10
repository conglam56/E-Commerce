# Design Pattern Guidelines (from iluwatar/java-design-patterns)

Always follow standard object-oriented design patterns when refactoring or creating new services:
- Reference repo: https://github.com/iluwatar/java-design-patterns
- Creational: Prefer Builder for multi-field entities, Factory Method for dynamic object decoupling. Ensure Singleton uses Enum or Double-Checked Locking.
- Structural: Use Adapter for third-party libraries, Facade to simplify module interfaces, and Decorator instead of inheritance.
- Behavioral: Use Strategy over complex switch-case or nested if-else, Chain of Responsibility for request validation/filters.
- Principles: Strict adherence to SOLID, loose coupling, and clean unit testing for each pattern.