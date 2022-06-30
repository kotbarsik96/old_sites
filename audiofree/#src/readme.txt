1. Динамически-адаптивное перемещение блоков: dynamic-adaptive:

для активации необходимо блоку, который будет перемещен, задать атрибут data-dynamic-adaptive="mediaType, mediaValue, new_parent.[...else], 
[...unique]", ГДЕ mediaType - min/max, mediaValue - величина media-запроса в px, new_parent - класс нового родителя (else - перечисление других 
классов для уточнения), unique - является ли new_parent уникальным, то есть все элементы с похожим new_parent в атрибуте будут отправлены ТОЛЬКО
в этот болк - по умолчанию не указан, то есть не уникален.


2. Полноэкранный слайдер:

для применения задать классы: container - 'swiper pagination-slider', wrapper - 'swiper-wrapper pagination-slider__wrapper',
slide - 'pagination-slide'.

3. Мобильный слайдер (появляется только на определенных ширинах экранов устройств, в основном - мобильных экранах)

для применения необходимо контейнеру слайдера задать data-mobile-slider="condition, md", где condition - условие: max/min, 
md - значение: 767, 992 и т.д.
также задать классы: container - 'mobile-slider', wrapper - 'mobile-slider__wrapper'.

4. Select

для применения создать блок '.select', внутри - элемент '.select__options-list', внутри - '.select__option' с атрибутом data-select-value="..." 
и нужным текстом соответственно.

5. Спойлер-блок
Для применения нужно создать блок с [data-spoiler="md, src"], где md - media-запрос max-width: md, при возвращении true включающий
spoiler, а при false - toggler. Внутрь блока помещаются .spoiler и .toggler; .spoiler можно задать [data-is-accordeon], указывающий
на то, что может быть открыт только 1 спойлер одновременно.
!!! ВАЖНО: если блок находится внутри Vue-приложения, обязательно поставить блоку атрибут data-inside-app, т.к. его необходимо инициализировать уже внутри mounted() хука Vue-приложения !!!

6. Отрисовка товаров
Происходит при помощи Vue 3.2.27. Соответсвующие шаблоны можно найти в html-snippets в #src.

7. Экран загрузки - ::before у элементов с классом [v-cloak].