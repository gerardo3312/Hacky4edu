import html2pdf from "html2pdf.js";
document.querySelectorAll(".dropdown-btn").forEach(button => {
    button.addEventListener("click", () => {
        const content = button.nextElementSibling;
        if (!content) return;
        content.classList.toggle("visible");
    });
});
// Ensure tutor badge stays fixed relative to the viewport: move it to body
function ensureBadgeFixed() {
    document.querySelectorAll('.tutor-badge').forEach(b => {
        if (b.parentElement !== document.body) document.body.appendChild(b);
        b.style.position = 'fixed';
        b.style.right = b.style.right || '24px';
        b.style.bottom = b.style.bottom || '86px';
        b.style.zIndex = '1600';
        b.style.pointerEvents = 'auto';
    });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureBadgeFixed);
else ensureBadgeFixed();

// Ejemplo de efecto suave al hacer scroll hacia secciones:
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// Ejemplo de animación simple al pasar el mouse sobre botones:
document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        btn.style.transform = "scale(1.05)";
        btn.style.transition = "transform 0.2s ease";
    });
    btn.addEventListener("mouseleave", () => {
        btn.style.transform = "scale(1)";
    });
});
// Behavior for tutor badge: try to open chat (simulate click on #chatBotBtn) when badge is clicked
document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.tutor-badge');
    if (!b) return;
    const chatBtn = document.getElementById('chatBotBtn');
    if (chatBtn) {
        chatBtn.click();
        return;
    }
    // If no chat btn, scroll to Assistant area or show message
    const asist = document.getElementById('asistente');
    if (asist) {
        asist.scrollIntoView({ behavior: 'smooth', block: 'center' });
        asist.focus && asist.focus();
    }
});
export function convertHtmlPdf(divElement) {
    const element = document.getElementById(divElement);

    html2pdf().from(element).save()
}

