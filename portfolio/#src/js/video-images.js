class Video {
    constructor() {
        this.initVideoInNode(document);
    }
    initVideoInNode(node = document) {
        setTimeout(() => {
            const videoContainers = node.querySelectorAll('.video-container');
            videoContainers.forEach(videoContainer => this.initControls(videoContainer));
        }, 0);
    }
    setControls(videoContainer) {
        let videoControls = videoContainer.querySelector('.video-container__controls');
        // список классов элементов управления
        const controlsElClasses = {
            playBtn: 'video-container__play-btn',
            expandBtn: 'video-container__expand',
            timestamp: 'video-container__timestamp',
            videotrack: 'video-container__videotrack',
            timeline: 'video-container__timeline',
            timelineSlider: 'video-container__timeline-slider'
        };
        // создать videoControls если его нет
        if (!videoControls) createControls();
        // пересоздать videoControls, если он есть, но внутри него присутствуют не все элементы
        if (videoControls) {
            // проверка, все ли нужные элементы есть внутри videoControls:
            let controlsCheckSum = true;
            for (let key in controlsElClasses) {
                const className = controlsElClasses[key];
                if (!videoControls.querySelector(className)) controlsCheckSum = false;
            }
            // нет каких-либо элементов: пересоздать controls
            if (!controlsCheckSum) {
                videoControls.remove();
                createControls();
            }
        }

        // ссылки на элементы управления в html
        const videoControlsObj = {
            video: videoContainer.querySelector('video'),
            node: videoControls,
            playBtn: videoControls.querySelector(`.${controlsElClasses.playBtn}`),
            expandBtn: videoControls.querySelector(`.${controlsElClasses.expandBtn}`),
            timestamp: videoControls.querySelector(`.${controlsElClasses.timestamp}`),
            videotrack: videoControls.querySelector(`.${controlsElClasses.videotrack}`),
            timeline: videoControls.querySelector(`.${controlsElClasses.timeline}`),
            timelineSlider: videoControls.querySelector(`.${controlsElClasses.timelineSlider}`)
        }

        function createControls() {
            videoControls = document.createElement('div');
            videoControls.className = 'video-container__controls';
            videoControls.innerHTML = `
                <div class="${controlsElClasses.playBtn}"></div>
                <div class="${controlsElClasses.expandBtn}"></div>
                <div class="${controlsElClasses.timestamp}">
                    <span></span>
                    <span></span>
                </div>
                <div class="${controlsElClasses.videotrack}">
                    <div class="${controlsElClasses.timeline}">
                        <div class="${controlsElClasses.timelineSlider}"></div>
                    </div>
                </div>
            `;
            videoContainer.append(videoControls);
        }
        return videoControlsObj;
    }
    initControls(videoContainer) {
        // получение объекта, содержащего как сам .video-container, так и элементы управления внутри него
        // этот объект собираетсяв this.setControls();
        const videoControlsObj = this.setControls(videoContainer);

        // выставление обработчиков на элементы управлнения
        this.initPlayingToggle(videoControlsObj);
        this.initVideotrack(videoControlsObj);
        this.initExpandBtn(videoControlsObj);
        this.initTimestamp(videoControlsObj);
        this.toggleControlsOnHover(videoControlsObj);
    }
    play(video) {
        const videoContainer = video.closest('.video-container');
        videoContainer.classList.add('__playing');
        video.play();
        if (!video.loop) video.loop = true;
    }
    pause(video) {
        const videoContainer = video.closest('.video-container');
        videoContainer.classList.remove('__playing');
        video.pause();
    }
    initPlayingToggle(videoControlsObj) {
        const videoContainer = videoControlsObj.node.closest('.video-container');
        const video = videoControlsObj.video;
        togglePlaying = togglePlaying.bind(this);

        videoControlsObj.node.addEventListener('click', togglePlaying);

        function togglePlaying(event) {
            const isPlaying = videoContainer.classList.contains('__playing');
            // если клик был не на элементы управления - остановить или воспроизвести
            if (event.target === videoControlsObj.node || event.target === videoControlsObj.playBtn) isPlaying ? this.pause(video) : this.play(video);
        }
    }
    initVideotrack(videoControlsObj) {
        const videotrack = videoControlsObj.videotrack;
        const timeline = videoControlsObj.timeline;
        const slider = videoControlsObj.timelineSlider;
        const video = videoControlsObj.video;

        // показ прогресса проигрывания
        initVideotrack();
        // перемотка. Бинд контекста для того, чтобы вызвать pause при перемотке через pointermove
        initRewind = initRewind.bind(this);
        initRewind();

        function initVideotrack() {
            video.addEventListener('timeupdate', showProgress);

            function showProgress() {
                timeline.style.width = `${video.currentTime / video.duration * 100}%`;
            }
        }
        function initRewind() {
            onPointerDown = onPointerDown.bind(this);

            videotrack.addEventListener('click', rewind);
            videotrack.addEventListener('pointerdown', onPointerDown);
            videotrack.ondragstart = function () { return false };

            function rewind(event) {
                const coord = event.clientX - getCoords(videotrack).left;
                const trackWidth = videotrack.offsetWidth;
                const value = coord / trackWidth * 100;

                // перемотка не выходит за границы videotrack
                if (value > 1 && value <= 100) {
                    timeline.style.width = `${value}%`;
                    video.currentTime = video.duration / 100 * value;
                }
                // перемотка выходит за границы videotrack
                if (value > 100) timeline.style.width = '100%';
                if (value < 1) timeline.style.width = '1%';
            }
            function onPointerDown(downEvent) {
                this.pause(video);
                document.addEventListener('pointermove', onMove);
                document.addEventListener('pointerup', onUp);

                function onMove(event) {
                    event.preventDefault();
                    rewind(event);
                }
                function onUp() {
                    document.removeEventListener('pointermove', onMove);
                    document.removeEventListener('pointerup', onUp);
                }
            }
        }
    }
    initExpandBtn(videoControlsObj) {
        const videoContainer = videoControlsObj.node.closest('.video-container');
        const expandBtn = videoControlsObj.expandBtn;
        const video = videoControlsObj.video;
        initExpansion();

        function initExpansion() {
            // для double-click. Такая реализация потому, что dblclick не регистрирует touch-нажатия
            let doubledClick = false;
            videoContainer.onclick = watchDblClick;
            expandBtn.addEventListener('click', doExpand);

            function doExpand() {
                if (!video.closest('.popup')) {
                    new Popup({
                        content: [
                            {
                                type: 'htmlElement',
                                body: videoContainer,
                                oldParent: videoContainer.parentNode
                            }
                        ]
                    });
                }
            }
            function watchDblClick(event) {
                const controls = videoContainer.querySelector('.video-container__controls');
                const playBtn = videoContainer.querySelector('.video-container__play-btn');
                if (event.target === controls || event.target === playBtn) {
                    if (doubledClick) {
                        if (!videoContainer.closest('.popup')) doExpand();
                        if (videoContainer.closest('.popup')) {
                            const popupCloseBtn = document.querySelector('.popup__body');
                            const customEvent = new Event('click', { bubbles: true });
                            popupCloseBtn.dispatchEvent(customEvent);
                        }
                    }
                    doubledClick = true;
                    setTimeout(() => {
                        doubledClick = false;
                    }, 250);
                }
            }
        }
    }
    initTimestamp(videoControlsObj) {
        const video = videoControlsObj.video;
        const timestamp = videoControlsObj.timestamp;
        setTimestamp();
        video.addEventListener('timeupdate', setTimestamp);

        function setTimestamp() {
            const spans = timestamp.querySelectorAll('span');
            const currentSpan = spans[0];
            const durationSpan = spans[1];

            let currentMinutes = Math.floor(Math.floor(video.currentTime) / 60) || 0;
            let currentSeconds = Math.floor(video.currentTime) - currentMinutes * 60 || 0;
            currentMinutes = currentMinutes.toString();
            currentSeconds = currentSeconds.toString();
            if (currentMinutes.length <= 1) currentMinutes = `0${currentMinutes}`;
            if (currentSeconds.length <= 1) currentSeconds = `0${currentSeconds}`;

            let durationMinutes = Math.floor(Math.floor(video.duration) / 60) || 0;
            let durationSeconds = Math.floor(video.duration) - durationMinutes * 60 || 0;
            durationMinutes = durationMinutes.toString();
            durationSeconds = durationSeconds.toString();
            if (durationMinutes.length <= 1) durationMinutes = `0${durationMinutes}`;
            if (durationSeconds.length <= 1) durationSeconds = `0${durationSeconds}`;

            currentSpan.innerHTML = `${currentMinutes}:${currentSeconds}`;
            durationSpan.innerHTML = `${durationMinutes}:${durationSeconds}`;
        }
    }
    toggleControlsOnHover(videoControlsObj) {
        const videoContainer = videoControlsObj.node.closest('.video-container');
        videoContainer.onpointerover = addHoverClass;
        videoContainer.onmouseleave = removeHoverClass;

        function addHoverClass(event) {
            videoContainer.classList.add('__hover');
            // убрать класс __hover через 1с после присваивания, если event спровоцирован не мышью (тачскрином)
            if (event.pointerType != 'mouse') setTimeout(() => { removeHoverClass(); }, 1000);
        }
        function removeHoverClass() {
            videoContainer.classList.remove('__hover');
        }
    }
}
class Images {
    constructor() {
        this.initImagesInNode(document);
    }
    initImagesInNode(node = document) {
        setTimeout(() => {
            const imageContainers = node.querySelectorAll('.image-container');
            imageContainers.forEach(imageContainer => this.initContainer(imageContainer));
        }, 0);
    }
    initContainer(imageContainer) {
        this.initExpandBtn(imageContainer);
    }
    initExpandBtn(imageContainer) {
        setIcon();
        imageContainer.onclick = doExpand;

        function setIcon() {
            let expandBtn = imageContainer.querySelector('.image-container__expand');
            if (!expandBtn) {
                expandBtn = document.createElement('div');
                expandBtn.className = 'image-container__expand';
                imageContainer.append(expandBtn);
            }
        }
        function doExpand() {
            if (!imageContainer.closest('.popup')) {
                new Popup({
                    content: [{ type: 'htmlElement', body: imageContainer, oldParent: imageContainer.parentNode }]
                });
            }
        }
    }
}

const videoMethods = new Video();
const imageMethods = new Images();