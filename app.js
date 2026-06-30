// CONFIGURACIÓN DE NARRATIVA MULTIMEDIA E INTUITIVA
const datosNodos = {
    "cabo-domingo": {
        titulo: "Cabo Domingo",
        tipo: "multihotspot", 
        mediaGeneral: "assets/images/Cabo domingo Plano General.png",
        hotspots: [
            {
                id: "destino-piedra",
                posicion: "top: 78%; left: 58%;", 
                tipoDestino: "image",
                mediaDestino: "assets/images/piedra-cabo domingo.png",
                audioHotspot: "assets/audio/CaboDomingo-Piedra.mp3" 
            },
            {
                id: "destino-video",
                posicion: "top: 30%; left: 30%;", 
                tipoDestino: "video",
                mediaDestino: "assets/videos/VIDEO CABO DOMINGO.mp4",
                audioHotspot: "assets/audio/cabo-domingo-2.mp3" 
            }
        ],
        poesia: "«La piedra no es silencio, es un grito contenido por los siglos. Fui una gota de lluvia que cayó antes de que existieran los mapas.»",
        ecos: ["espera", "erosión", "distancia", "horizonte"]
    },
    "laguna-patos": {
        titulo: "Laguna de los Patos",
        tipo: "multihotspot",
        mediaGeneral: "assets/images/cartel-laguna-de-los-patos.png", 
        hotspots: [
            {
                id: "destino-patos",
                posicion: "top: 88%; left: 45%;", 
                tipoDestino: "image",
                mediaDestino: "assets/images/patos.png"
            },
            {
                id: "destino-laguna",
                posicion: "top: 45%; left: 72%;", 
                tipoDestino: "image",
                mediaDestino: "assets/images/laguna.png"
            }
        ],
        audioObjeto: "assets/audio/Audio-Laguna de los Patos.mp3",
        poesia: "«El agua estancada sabe reflejar el cielo que el viento quiebra. Año tras año, las aves regresan siguiendo senderos invisibles.»",
        ecos: [] 
    },
    "aves": {
        titulo: "Avistamiento de Aves",
        tipo: "secuencia",
        mediaGeneral: "assets/images/aves.png", 
        posicionHotspot: "top: 40%; left: 60%;", 
        tipoDestino: "video",
        mediaDestino: "assets/videos/VIDEO PAJAROS_1.mp4", 
        audioObjeto: "assets/audio/aves 1_mezcla.mp3",
        poesia: "«El viento no conoce fronteras. Las aves tampoco. Hablan de los cambios del paisaje y del paso de las estaciones.»",
        ecos: []
    },
    "punta-popper": {
        titulo: "Punta Popper",
        tipo: "secuencia", // Cambiado de 'simple' a 'secuencia' para soportar los dos pasos
        mediaGeneral: "assets/images/Punta Popper.png", // Imagen inicial del cartel (Paso 1)
        posicionHotspot: "top: 50%; left: 50%;", // Aro interactivo en el centro del paisaje
        tipoDestino: "image",
        mediaDestino: "assets/images/Punta-Popper-2.png", // Nueva imagen del mar/costa (Paso 2)
        audioObjeto: "assets/audio/Audio-Punta-Popper1.mp3", // Nuevo archivo de audio asignado
        poesia: "«Doy la bienvenida a quienes llegan, pero también despido a quienes se van. Todo comienzo también es una despedida.»",
        ecos: []
    }
};

let audiosEscuchados = new Set(); 
let audioObjetoActual = null;

const audioBg = document.getElementById('audio-bg');
const audioInicio = document.getElementById('audio-inicio');
const bitacoraElement = document.getElementById('bitacora-progreso');
const contadorElement = document.getElementById('contador-audios');

// INICIO Y SECUENCIA DE PRÓLOGO
document.getElementById('btn-comenzar').addEventListener('click', () => {
    audioBg.volume = 0.20;
    audioBg.play().catch(e => console.log("Audio ambiente listo"));
    switchScreen('screen-inicio', 'screen-prologo');
    audioInicio.currentTime = 0;
    audioInicio.volume = 0.85;
    audioInicio.play();
    audioInicio.onended = () => {
        if(document.getElementById('screen-prologo').classList.contains('active')){
            switchScreen('screen-prologo', 'screen-mapa');
            bitacoraElement.classList.add('visible');
        }
    };
});

// Selección en el mapa
document.querySelectorAll('.map-node').forEach(node => {
    node.addEventListener('click', () => {
        const target = node.getAttribute('data-target');
        cargarRecorrido(target);
        switchScreen('screen-mapa', 'screen-recorrido');
    });
});

document.getElementById('btn-volver-mapa').addEventListener('click', () => {
    if (audioObjetoActual) audioObjetoActual.pause();
    if (audiosEscuchados.size === 4) {
        bitacoraElement.classList.remove('visible'); 
        switchScreen('screen-recorrido', 'screen-final');
    } else {
        switchScreen('screen-recorrido', 'screen-mapa');
    }
});

document.getElementById('btn-reiniciar').addEventListener('click', () => {
    audiosEscuchados.clear();
    actualizarBitacora();
    switchScreen('screen-final', 'screen-inicio');
});

// MOTOR RENDERIZADOR
function cargarRecorrido(idNodo) {
    const data = datosNodos[idNodo];
    const contenedor = document.getElementById('recorrido-content');
    
    let htmlContent = `<h2 class="map-title">${data.titulo}</h2>`;
    
    if (data.tipo === "multihotspot" || data.tipo === "secuencia") {
        htmlContent += `<button class="btn-narrative btn-volver-interno" id="btn-volver-interno" style="display: none;">↑ Volver a la vista general</button>`;
    }
    
    htmlContent += `<div class="image-viewport">`;

    if (data.tipo === "multihotspot") {
        htmlContent += `<img src="${data.mediaGeneral}" class="recorrido-img visible" id="layer-general">`;
        data.hotspots.forEach(hs => {
            htmlContent += `<div class="view-hotspot hs-multi" style="${hs.posicion}" data-target-id="${hs.id}"></div>`;
            if (hs.tipoDestino === "video") {
                htmlContent += `<video src="${hs.mediaDestino}" loop muted class="recorrido-img hidden target-media" id="${hs.id}"></video>`;
            } else {
                htmlContent += `<img src="${hs.mediaDestino}" class="recorrido-img hidden target-media" id="${hs.id}">`;
            }
        });
    } else if (data.tipo === "secuencia") {
        htmlContent += `<img src="${data.mediaGeneral}" class="recorrido-img visible" id="layer-general">`;
        if (data.tipoDestino === "video") {
            htmlContent += `<video src="${data.mediaDestino}" loop muted class="recorrido-img hidden target-media" id="layer-detalle"></video>`;
        } else {
            htmlContent += `<img src="${data.mediaDestino}" class="recorrido-img hidden target-media" id="layer-detalle">`;
        }
        htmlContent += `<div class="view-hotspot" style="${data.posicionHotspot}" id="hotspot-interactivo"></div>`;
    } else {
        htmlContent += `<img src="${data.media}" class="recorrido-img visible" id="img-interactiva">`;
    }

    htmlContent += `</div><p class="poetic-text" id="texto-poetico">${data.poesia}</p>`;
    if (data.ecos && data.ecos.length > 0) {
        htmlContent += `<div class="echo-container" id="ecos-nodo">${data.ecos.map(w => `<span class="word-echo">${w}</span>`).join('')}</div>`;
    }
    contenedor.innerHTML = htmlContent;

    const btnVolverInterno = document.getElementById('btn-volver-interno');
    const layerGeneral = document.getElementById('layer-general');

    if (btnVolverInterno) {
        btnVolverInterno.addEventListener('click', () => {
            btnVolverInterno.style.display = 'none';
            document.querySelectorAll('.target-media').forEach(el => {
                el.classList.replace('visible', 'hidden');
                if (el.tagName === 'VIDEO') el.pause();
            });
            layerGeneral.classList.replace('hidden', 'visible');
            document.querySelectorAll('.hs-multi').forEach(h => h.style.display = 'block');
            if(document.getElementById('hotspot-interactivo')) document.getElementById('hotspot-interactivo').style.display = 'block';
            document.getElementById('texto-poetico').classList.remove('visible');
            const ecosNodo = document.getElementById('ecos-nodo');
            if (ecosNodo) ecosNodo.classList.remove('visible');
        });
    }

    if (data.tipo === "multihotspot") {
        document.querySelectorAll('.hs-multi').forEach((hs, index) => {
            hs.addEventListener('click', (e) => {
                layerGeneral.classList.replace('visible', 'hidden');
                document.querySelectorAll('.hs-multi').forEach(h => h.style.display = 'none');
                
                const targetId = hs.getAttribute('data-target-id');
                const targetElement = document.getElementById(targetId);
                targetElement.classList.replace('hidden', 'visible');
                if (targetElement.tagName === 'VIDEO') targetElement.play();
                
                btnVolverInterno.style.display = 'inline-block';
                
                const audioAAntregar = data.hotspots[index].audioHotspot ? data.hotspots[index].audioHotspot : data.audioObjeto;
                dispararAudioNodo(idNodo, audioAAntregar);
                
                document.getElementById('texto-poetico').classList.add('visible');
                const ecosNodo = document.getElementById('ecos-nodo');
                if (ecosNodo) ecosNodo.classList.add('visible');
            });
        });
    } else if (data.tipo === "secuencia") {
        document.getElementById('hotspot-interactivo').addEventListener('click', () => {
            document.getElementById('hotspot-interactivo').style.display = 'none';
            layerGeneral.classList.replace('visible', 'hidden');
            const detail = document.getElementById('layer-detalle');
            detail.classList.replace('hidden', 'visible');
            if (detail.tagName === 'VIDEO') detail.play();
            btnVolverInterno.style.display = 'inline-block';
            
            // En Punta Popper o Avistamiento, el audio se detona al hacer clic en la imagen de detalle
            detail.addEventListener('click', () => {
                dispararAudioNodo(idNodo, data.audioObjeto);
                document.getElementById('texto-poetico').classList.add('visible');
            }, { once: true }); // Se ejecuta una sola vez por entrada
        });
    } else {
        document.getElementById('img-interactiva').addEventListener('click', () => {
            dispararAudioNodo(idNodo, data.audioObjeto);
            document.getElementById('texto-poetico').classList.add('visible');
        });
    }
}

function dispararAudioNodo(idNodo, rutaAudio) {
    if (audioObjetoActual) audioObjetoActual.pause();
    audioObjetoActual = new Audio(rutaAudio);
    audioObjetoActual.volume = 0.75;
    audioObjetoActual.play();
    if (!audiosEscuchados.has(idNodo)) {
        audiosEscuchados.add(idNodo);
        actualizarBitacora();
    }
}

function actualizarBitacora() {
    contadorElement.textContent = audiosEscuchados.size;
}

function switchScreen(oldId, newId) {
    document.getElementById(oldId).classList.remove('active');
    setTimeout(() => { document.getElementById(newId).classList.add('active'); }, 150);
}