// ============================================
// AUDIO-MANAGER.JS - Versión Simplificada
// Sistema de audio continuo con bucle infinito
// ============================================

(function() {
    'use strict';
    
    console.log('🎵 Audio Manager iniciado');
    
    // Configuración de canciones por página
    const SONG_CONFIG = {
        'index.html': 0,
        '': 0, // Para cuando no hay nombre de archivo
        'page2.html': 1,
        'page3.html': 1,
        'page4.html': 2,
        'page5.html': 2,
        'page6.html': 2,
        'page7.html': 2,
        'page8.html': 2,
        'page9.html': 2,
        'page10.html': null
    };
    
    const AUDIO_SOURCES = ['song1.mp3', 'song2.mp3', 'song3.mp3'];
    let currentPlaylistIndex = 0;
    let audio = null;
    let volumeSlider = null;
    
    // Obtener página actual
    function getCurrentPage() {
        const path = window.location.pathname;
        let page = path.split('/').pop();
        if (!page || page === '') {
            page = 'index.html';
        }
        console.log('📄 Página actual:', page);
        return page;
    }
    
    // Crear elemento de audio
    function createAudioElement() {
        audio = document.createElement('audio');
        audio.id = 'global-background-music';
        audio.style.display = 'none';
        audio.preload = 'auto';
        document.body.appendChild(audio);
        console.log('🔊 Elemento de audio creado');
        return audio;
    }
    
    // Crear control de volumen
    function createVolumeControl() {
        const volumeControl = document.createElement('div');
        volumeControl.id = 'global-volume-control';
        volumeControl.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            border: 2px solid #ff9800;
        `;
        
        volumeControl.innerHTML = `
            <div style="font-size: 1.5rem; color: #ff9800; cursor: pointer;" id="play-pause-btn">▶️</div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1rem; color: #ff9800;">🔊</span>
                <input type="range" id="global-volume-slider" min="0" max="100" value="50" 
                    style="width: 100px; cursor: pointer;">
            </div>
            <div id="current-song" style="font-size: 0.7rem; color: #666; text-align: center;"></div>
        `;
        
        document.body.appendChild(volumeControl);
        console.log('🎚️ Control de volumen creado');
        
        return document.getElementById('global-volume-slider');
    }
    
    // Actualizar display de canción actual
    function updateSongDisplay() {
        const display = document.getElementById('current-song');
        if (display) {
            display.textContent = `Song ${currentPlaylistIndex + 1}/3`;
        }
    }
    
    // Reproducir siguiente canción en playlist
    function playNextInPlaylist() {
        currentPlaylistIndex = (currentPlaylistIndex + 1) % 3;
        console.log('⏭️ Siguiente canción:', currentPlaylistIndex + 1);
        
        audio.src = AUDIO_SOURCES[currentPlaylistIndex];
        audio.currentTime = 0;
        
        sessionStorage.setItem('playlistIndex', currentPlaylistIndex);
        updateSongDisplay();
        
        audio.play().catch(err => {
            console.error('Error al reproducir:', err);
        });
    }
    
    // Inicializar sistema de audio
    function initAudioSystem() {
        const currentPage = getCurrentPage();
        const songIndex = SONG_CONFIG[currentPage];
        
        console.log('🎼 Índice de canción para esta página:', songIndex);
        
        // Si es página 10, detener todo
        if (songIndex === null) {
            console.log('⏹️ Página 10 - Sin música');
            stopAllAudio();
            return;
        }
        
        // Crear elementos
        audio = createAudioElement();
        volumeSlider = createVolumeControl();
        
        // Botón play/pause
        const playPauseBtn = document.getElementById('play-pause-btn');
        
        // Determinar modo
        const isPlaylistMode = (songIndex === 2); // Páginas 4-9
        console.log('🔄 Modo playlist:', isPlaylistMode);
        
        // Configurar audio
        if (isPlaylistMode) {
            // Modo playlist: reproducir las 3 canciones en bucle
            const savedIndex = sessionStorage.getItem('playlistIndex');
            currentPlaylistIndex = savedIndex ? parseInt(savedIndex) : 0;
            
            audio.src = AUDIO_SOURCES[currentPlaylistIndex];
            audio.loop = false;
            
            // Cuando termina una canción, pasar a la siguiente
            audio.addEventListener('ended', playNextInPlaylist);
            
            updateSongDisplay();
        } else {
            // Modo normal: repetir la misma canción
            audio.src = AUDIO_SOURCES[songIndex];
            audio.loop = true;
            currentPlaylistIndex = songIndex;
            updateSongDisplay();
        }
        
        // Configurar volumen
        const savedVolume = sessionStorage.getItem('audioVolume') || '50';
        volumeSlider.value = savedVolume;
        audio.volume = savedVolume / 100;
        
        console.log('🎵 Canción cargada:', audio.src);
        console.log('🔊 Volumen:', audio.volume);
        
        // Evento de volumen
        volumeSlider.addEventListener('input', function() {
            audio.volume = this.value / 100;
            sessionStorage.setItem('audioVolume', this.value);
            console.log('🔊 Volumen ajustado a:', this.value);
        });
        
        // Botón play/pause
        playPauseBtn.addEventListener('click', function() {
            if (audio.paused) {
                audio.play().then(() => {
                    playPauseBtn.textContent = '⏸️';
                    console.log('▶️ Reproduciendo');
                }).catch(err => {
                    console.error('❌ Error al reproducir:', err);
                    alert('Error al reproducir audio. Verifica que los archivos song1.mp3, song2.mp3 y song3.mp3 existan.');
                });
            } else {
                audio.pause();
                playPauseBtn.textContent = '▶️';
                console.log('⏸️ Pausado');
            }
        });
        
        // Intentar reproducir automáticamente
        console.log('🎬 Intentando reproducir...');
        audio.play().then(() => {
            console.log('✅ Reproducción iniciada exitosamente');
            playPauseBtn.textContent = '⏸️';
        }).catch(err => {
            console.log('⚠️ Reproducción automática bloqueada. Haz clic en el botón ▶️');
            playPauseBtn.textContent = '▶️';
            
            // Mostrar alerta visual
            playPauseBtn.style.animation = 'pulse 1s infinite';
            const style = document.createElement('style');
            style.textContent = '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }';
            document.head.appendChild(style);
        });
        
        // Guardar tiempo periódicamente
        setInterval(() => {
            if (!audio.paused) {
                sessionStorage.setItem('audioTime', audio.currentTime);
            }
        }, 1000);
        
        // Guardar antes de salir
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('audioTime', audio.currentTime);
            sessionStorage.setItem('audioVolume', volumeSlider.value);
        });
        
        // Detectar errores
        audio.addEventListener('error', function(e) {
            console.error('❌ Error de audio:', e);
            alert('No se puede cargar el archivo de audio. Verifica que existan:\n- song1.mp3\n- song2.mp3\n- song3.mp3\n\nEn la misma carpeta que tu HTML.');
        });
        
        audio.addEventListener('canplay', function() {
            console.log('✅ Audio listo para reproducir');
        });
    }
    
    // Detener todo
    function stopAllAudio() {
        if (audio) {
            audio.pause();
            audio.remove();
        }
        const control = document.getElementById('global-volume-control');
        if (control) {
            control.remove();
        }
        sessionStorage.clear();
    }
    
    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioSystem);
    } else {
        initAudioSystem();
    }
    
})();