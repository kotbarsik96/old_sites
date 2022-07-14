class ScrollAnim {
    constructor() {
        this.timeoutDflt = 75;

        this.initAllObjs();
        window.addEventListener('scroll', () => this.initAnimObjs());
    }
    initAllObjs(node = document) {
        this.initAnimObjs(node);
        this.initTextNodes(node);
    }
    initAnimObjs(node = document) {
        const animObjects = node.querySelectorAll('[class*="anim__object"]:not([v-cloak])');
        animObjects.forEach(obj => this.initAnimObj(obj));
    }
    initTextNodes(node = document) {
        const textNodes = node.querySelectorAll('[class*="anim__object-text"]:not([v-cloak])');
        textNodes.forEach(textNode => this.initTextTyping(textNode));
    }
    initAnimObj(obj) {
        let animCoords = getCoords(obj);
        let animHeight = obj.offsetHeight;
        let scrollHeight = window.pageYOffset;
        let animValue = 5;
        let animPoint = window.innerHeight - window.innerHeight / animValue;

        if ((window.pageYOffset > animCoords.top - animPoint) && (window.pageYOffset < animHeight + animCoords.top)) {
            applyAnim();
        }
        else {
            removeAnim();
        }

        function applyAnim() {
            obj.classList.add('__animated');
        }
        function removeAnim() {
            if (obj.classList.contains('__unlock-anim')) {
                obj.classList.remove('__animated');
            }
        }
    }
    initTextTyping(textNode) {
        this.saveTextContent(textNode);
        const hasAnimatedClass = textNode.classList.contains('__animated');
        // поставить обработчик DOM-мутаций
        if (!hasAnimatedClass) {
            const observer = new MutationObserver(onMutation.bind(this));
            observer.observe(textNode, { attributes: true, attributeOldValue: true });
        }
        // просто анимировать текст
        if (hasAnimatedClass) this.type(textNode);


        function onMutation(mtList) {
            mtList.forEach(mutn => {
                const textNode = mutn.target;
                if (mutn.attributeName === 'class' && mutn.oldValue) {
                    const wasntAnimated = !mutn.oldValue.split(' ').includes('__animated');
                    const isAnimated = textNode.classList.contains('__animated');
                    if (wasntAnimated && isAnimated) this.type(textNode);
                }
            });
        }
    }
    type(textNode) {
        const content = textNode.textContent;
        const dataset = textNode.dataset.textContent;
        const typingSpeed = textNode.dataset.typingSpeed;

        if (textNode.dataset.isTyping !== 'true') {
            textNode.dataset.isTyping = 'true';
            textNode.textContent = '';

            const lettersArray = dataset.replace(/\s\s/g, '').split('');
            for (let i = 0; i < lettersArray.length; i++) {
                let timeout = 0;
                !typingSpeed ? timeout = this.timeoutDflt * i : timeout = typingSpeed * i;
                const letter = lettersArray[i];

                setTimeout(() => {
                    textNode.textContent += letter;
                    if (i === lettersArray.length - 1) {
                        textNode.dataset.isTyping = 'false';
                    }
                }, timeout);
            }
        }
    }
    saveTextContent(textNode) {
        const dataset = textNode.dataset.textContent;
        if (!dataset) textNode.dataset.textContent = textNode.textContent;
        textNode.textContent = '';
    }
}
const scrollAnim = new ScrollAnim();