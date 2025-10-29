
document.getElementById('chatBotBtn').addEventListener('click', () => {
    const chatBotUrl = 'https://ejemplo.com/tu-chat-bot'; 
    window.open(chatBotUrl, '_blank');
});

document.getElementById('descargarPDF').addEventListener('click', () => {
    
    const elemento = document.getElementById('contenidoPDF');
    const titulo = document.getElementById('titulo-tema').innerText;
    const nivel = document.getElementById('nivel-educativo').innerText;


    const opciones = {
        margin: 10,
        filename: `${titulo}_${nivel}.pdf`, 
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            allowTaint: true 
        }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };


    const imgs = elemento.querySelectorAll('img');
    const promesas = Array.from(imgs).map(img => {
        return new Promise(resolve => {
            if (img.complete && img.naturalHeight !== 0) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = resolve; 
            }
        });
    });


    Promise.all(promesas)
        .then(() => {
            setTimeout(() => {
                html2pdf().set(opciones).from(elemento).save();
            }, 100);
        })
        .catch(err => {
            console.error("Error al cargar imágenes para el PDF:", err);
            html2pdf().set(opciones).from(elemento).save();
        });
});