// если нужно отобразить только одну строку текста
new Popup({
    title: '...',
    content: [
        {
            type: 'text',
            body: '...'
        },
        {
            type: 'text',
            body: '...'
        }
    ]
});
// если нужно отобразить список
new Popup({
    title: '...',
    content: [
        {
            type: 'text',
            body: [
                '...',
                '....',
                '.....'
            ]
        },
        {
            type: 'text',
            body: [
                '...',
                '....',
                '.....'
            ]
        }
    ]
});
// если нужно расширить видео/изображение
new Popup({
    content: [
        {
            type: 'htmlElement',
            body: video || videoContainer,
            oldParent: video.parentNode || videoContainer.parentNode
        }
    ]
});