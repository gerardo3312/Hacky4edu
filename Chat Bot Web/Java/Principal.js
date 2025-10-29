// Efecto de despliegue para los botones
document.querySelectorAll(".dropdown-btn").forEach(button => {
    button.addEventListener("click", () => {
        const content = button.nextElementSibling;
        content.style.display = content.style.display === "flex" ? "none" : "flex";
    });
});

// Animación de luces de fondo suave
document.addEventListener("mousemove", (e) => {
    const overlay = document.querySelector(".overlay");
    overlay.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(0,255,255,0.3), transparent 60%)`;
});

